package com.expense.demo.controller;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.expense.demo.service.AuthService;
import com.expense.demo.service.EmailService;
import com.expense.demo.service.OtpService;
import com.expense.demo.model.OtpRequest;
import com.expense.demo.model.User;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Value;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class AuthController {

    private static final int JWT_EXPIRY_SECONDS = 60 * 60 * 30 * 30 / 1000;

    @Value("${app.cookie.secure:false}")
    private boolean secureCookie;

    @Autowired
    private EmailService emailService;

    @Autowired
    private AuthService service;

    @Autowired
    private OtpService otpService;

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody OtpRequest request) {

        String email = request.getEmail();
        String otp = otpService.generateOtp(email);

        System.out.println("Generated OTP for " + email + ": " + otp);

        try {
            emailService.sendOtpEmail(email, otp);
            System.out.println("OTP email sent to " + email);
            otpService.saveOtp(email, otp);
            return ResponseEntity.ok(Map.of("message", "OTP sent successfully"));
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest request) {
        String email = request.getEmail();
        String otpInput = request.getOtp();

        OtpRequest emailAndOtp = otpService.findBy(email);
        if (emailAndOtp == null || !emailAndOtp.getOtp().equals(otpInput)) {
            return ResponseEntity.status(400).body(Map.of("error", "Invalid OTP"));
        }

        User newUser = new User();
        newUser.setName(request.getName());
        newUser.setUsername(request.getUsername());
        newUser.setEmail(request.getEmail());
        newUser.setPassword(request.getPassword());

        try {
            service.register(newUser);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to register user. Username or email may already exist."));
        }

        otpService.clearOtp(email);
        return ResponseEntity.ok(Map.of("message", "User registered successfully"));
    }

    @GetMapping("/otp-requests")
    public List<OtpRequest> getAllOtpRequests() {
        return otpService.getAllOtpRequests();
    }

    @GetMapping("/me")
    public ResponseEntity<?> me() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        return ResponseEntity.ok(Map.of("username", auth.getName()));
    }


    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user, HttpServletResponse response) {
        String token = service.verify(user);

        if ("fail".equals(token)) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid username or password"));
        }

        Cookie jwtCookie = new Cookie("jwt_token", token);
        jwtCookie.setHttpOnly(true);
        jwtCookie.setSecure(secureCookie);
        jwtCookie.setAttribute("SameSite", secureCookie ? "None" : "Lax");
        jwtCookie.setPath("/");
        jwtCookie.setMaxAge(JWT_EXPIRY_SECONDS);

        response.addCookie(jwtCookie);
        return ResponseEntity.ok(Map.of("message", "Login successful"));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        Cookie expiredCookie = new Cookie("jwt_token", null);
        expiredCookie.setHttpOnly(true);
        expiredCookie.setSecure(secureCookie);
        expiredCookie.setAttribute("SameSite", secureCookie ? "None" : "Lax");
        expiredCookie.setPath("/");
        expiredCookie.setMaxAge(0);

        response.addCookie(expiredCookie);
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }
}


class RegisterRequest {
    private String name;
    private String username;
    private String email;
    private String password;
    private String otp;

    public String getName() { return name; }
    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public String getPassword() { return password; }
    public String getOtp() { return otp; }
}

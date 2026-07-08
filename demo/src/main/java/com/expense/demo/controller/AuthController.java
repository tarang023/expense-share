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

    // JWT expiry MUST match JWTService.generateToken() expiration millis:
    // 60 * 60 * 30 * 30 ms = 27,000 seconds
    private static final int JWT_EXPIRY_SECONDS = 60 * 60 * 30 * 30 / 1000;

    // true on Render (prod), false on localhost (dev)
    // In dev: Secure=false + SameSite=Lax so the browser accepts cookies over HTTP.
    // In prod: Secure=true + SameSite=None required for cross-origin HTTPS.
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

        otpService.clearOtp(email);
        return ResponseEntity.ok(Map.of("message", "User registered successfully", "userId", "12345"));
    }

    @GetMapping("/otp-requests")
    public List<OtpRequest> getAllOtpRequests() {
        return otpService.getAllOtpRequests();
    }

    // ── /me — returns the logged-in username so the frontend can verify auth ──
    // The JWT is in an HttpOnly cookie; JS can't read it, so we ask the server.
    // Spring Security's JWTFilter already validated the cookie and populated
    // the SecurityContext before this method is ever called.
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
        jwtCookie.setHttpOnly(true);                        // Inaccessible to JS — blocks XSS
        jwtCookie.setSecure(secureCookie);                  // true in prod (HTTPS), false in dev (HTTP)
        jwtCookie.setAttribute("SameSite", secureCookie ? "None" : "Lax"); // None requires Secure=true
        jwtCookie.setPath("/");
        jwtCookie.setMaxAge(JWT_EXPIRY_SECONDS);

        response.addCookie(jwtCookie);
        return ResponseEntity.ok(Map.of("message", "Login successful"));
    }

    // ── Logout — overwrite cookie with MaxAge=0 to clear it ─────────────────
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        Cookie expiredCookie = new Cookie("jwt_token", null);
        expiredCookie.setHttpOnly(true);
        expiredCookie.setSecure(secureCookie);
        expiredCookie.setAttribute("SameSite", secureCookie ? "None" : "Lax");
        expiredCookie.setPath("/");
        expiredCookie.setMaxAge(0); // Browser deletes cookie immediately

        response.addCookie(expiredCookie);
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }
}


class RegisterRequest {
    @SuppressWarnings("unused") private String name;
    @SuppressWarnings("unused") private String username;
    private String email;
    @SuppressWarnings("unused") private String password;
    private String otp;

    public String getEmail() { return email; }
    public String getOtp() { return otp; }
}
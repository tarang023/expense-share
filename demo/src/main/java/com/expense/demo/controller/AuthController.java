package com.expense.demo.controller;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.expense.demo.service.AuthService;
import com.expense.demo.service.EmailService;
import com.expense.demo.service.JWTService;
import com.expense.demo.service.OtpService;
import com.expense.demo.model.OtpRequest;
import com.expense.demo.model.User;

import java.util.Map;
import java.util.List;
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")  
public class AuthController {

    @Autowired
    private EmailService emailService;

    @Autowired
    private AuthService service;

    @Autowired
    private JWTService jwtService;

    

    @Autowired
    private OtpService otpService;
 
    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody OtpRequest request) { // Change String to OtpRequest

        String email = request.getEmail();
        String otp = otpService.generateOtp(email);

        System.out.println("Generated OTP for " + email + ": " + otp); // For testing only
      
        try {
            emailService.sendOtpEmail(email, otp); 
           System.out.println("OTP email sent to " + email);           
            otpService.saveOtp(email,otp);
            return ResponseEntity.ok(Map.of("message", "OTP sent successfully"));
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
 
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest request) {
        String email = request.getEmail();
        String otpInput = request.getOtp();

        
        OtpRequest emailAndOtp=otpService.findBy(email);
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

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        String token = service.verify(user);
        
        if ("fail".equals(token)) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid username or password"));
        }
        return new ResponseEntity<>(Map.of("token", token), HttpStatus.OK);
    }
}

// Helper class for the incoming JSON
class RegisterRequest {
    private String name;
    private String username;
    private String email;
    private String password;
    private String otp;

    // Getters and Setters needed
    public String getEmail() { return email; }
    public String getOtp() { return otp; }
     
}
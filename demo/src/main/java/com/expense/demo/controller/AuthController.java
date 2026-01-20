package com.expense.demo.controller;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.expense.demo.service.EmailService;
import com.expense.demo.service.OtpService;
import com.expense.demo.model.OtpRequest;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")  
public class AuthController {

    @Autowired
    private EmailService emailService;

    @Autowired
    private OtpService otpService;
 
    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody OtpRequest request) { // Change String to OtpRequest

        String email = request.getEmail();
        String otp = otpService.generateOtp(email);

        System.out.println("Generated OTP for " + email + ": " + otp); // For testing only
      
        try {
            emailService.sendOtpEmail(email, otp);
            return ResponseEntity.ok(Map.of("message", "OTP sent successfully"));
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Endpoint 2: Register (Verify OTP + Create User)
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest request) {
        String email = request.getEmail();
        String otpInput = request.getOtp();

        // 1. Verify OTP
        if (!otpService.validateOtp(email, otpInput)) {
            return ResponseEntity.status(400).body(Map.of("error", "Invalid or expired OTP"));
        }

        // 2. OTP is correct! Create the user in DB
        // User user = new User();
        // user.setName(request.getName());
        // ... save to DB ...
        
        // 3. Clear OTP after usage so it can't be used again
        otpService.clearOtp(email);

        return ResponseEntity.ok(Map.of("message", "User registered successfully", "userId", "12345"));
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
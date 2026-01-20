package com.expense.demo.service;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

import org.springframework.stereotype.Service;

@Service
public class OtpService {

    // Storage format: <Email, OTP>
    private final ConcurrentHashMap<String, String> otpStorage = new ConcurrentHashMap<>();
    
    // To clean up OTPs, you would ideally store an expiry timestamp too.
    
    public String generateOtp(String email) {
        // Generate random 6-digit number
        String otp = String.valueOf(new Random().nextInt(900000) + 100000);
        
        // Save to storage (overwrites existing if any)
        otpStorage.put(email, otp);
        
        return otp;
    }

    public boolean validateOtp(String email, String otpInput) {
        if (!otpStorage.containsKey(email)) {
            return false;
        }
        
        String storedOtp = otpStorage.get(email);
        return storedOtp.equals(otpInput);
    }
    
    public void clearOtp(String email) {
        otpStorage.remove(email);
    }
}
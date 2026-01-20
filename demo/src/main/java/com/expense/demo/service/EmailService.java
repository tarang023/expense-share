package com.expense.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender javaMailSender;

    // Inject your Gmail address from application.properties
    @Value("${spring.mail.username}")
    private String senderEmail;

    public void sendOtpEmail( String to , String otp) {
        // --- DEBUGGING LOGS ---
        System.out.println("DEBUG CHECK:");
        System.out.println("From (senderEmail): '" + senderEmail + "'");
        System.out.println("To (recipient): '" + to + "'");
        // ----------------------

        SimpleMailMessage message = new SimpleMailMessage();
        
        // Fallback: If @Value failed, hardcode it to test
        if (senderEmail == null) {
            System.err.println("CRITICAL ERROR: senderEmail is NULL. Check application.properties.");
            // TEMPORARY FIX: Hardcode your email here to see if it works
            message.setFrom("YOUR_REAL_EMAIL@gmail.com"); 
        } else {
            message.setFrom(senderEmail);
        }

        message.setTo(to);
        message.setSubject("Your Registration OTP");
        message.setText("Your OTP code is: " + otp);

        javaMailSender.send(message);
    }
}
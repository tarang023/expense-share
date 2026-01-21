 package com.expense.demo.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity

public class OtpRequest {
    @Id
    private String email;
    private String otp;

    // Default constructor
    public OtpRequest() {}

    // Getter and Setter
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getOtp() {
        return otp;
    }
    public void setOtp(String otp) {
        this.otp = otp;
    }
}
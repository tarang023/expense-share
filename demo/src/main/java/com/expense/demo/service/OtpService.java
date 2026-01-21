package com.expense.demo.service;
import java.util.List;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.expense.demo.model.OtpRequest;
import com.expense.demo.repository.OtpRequestRepository;

@Service
public class OtpService {
  
    @Autowired
    private OtpRequestRepository otpRequestRepository;
    
    
    public String generateOtp(String email) {
      
        String otp = String.valueOf(new Random().nextInt(900000) + 100000);
        
        return otp;
    }

    public void saveOtp(String email, String otp) {

        OtpRequest otpEntity = new OtpRequest();
        otpEntity.setEmail(email);  
        otpEntity.setOtp(otp);
       otpRequestRepository.save(otpEntity);
    }

    public List<OtpRequest> getAllOtpRequests() {
         return otpRequestRepository.findAll();
    }
    public OtpRequest findBy(String email) {
        return otpRequestRepository.findById(email).orElse(null);
    }

    public void clearOtp(String email) {
        otpRequestRepository.deleteById(email);
    }
}
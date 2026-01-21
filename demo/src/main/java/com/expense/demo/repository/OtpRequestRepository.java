package com.expense.demo.repository;


import org.springframework.data.jpa.repository.JpaRepository;

import com.expense.demo.model.OtpRequest;



public interface OtpRequestRepository extends JpaRepository<OtpRequest, String> {
        

    }


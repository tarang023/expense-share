package com.expense.demo.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/expenses")

public class ExpenseController {


    @GetMapping("/test")
    public String test() {
        return "Expense controller is working!";
    }

    
}

package com.expense.demo.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DemoController {
    @GetMapping("/demo")
    public String demo() {
        return "Welcome! If you see this, your Token works!";
    }
}

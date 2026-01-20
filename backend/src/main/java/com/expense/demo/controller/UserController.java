package com.expense.demo.controller;

import com.expense.demo.model.User;
import com.expense.demo.repository.UserRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepo;

    public UserController(UserRepository userRepo) {
        this.userRepo = userRepo;
    }

    // API: POST /api/users/register
    // Body: { "name": "Buckky", "email": "buckky@test.com" }
    @PostMapping("/register")
    public User registerUser(@RequestBody User user) {
       
        return userRepo.save(user);
    }
}
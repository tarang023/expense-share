package com.expense.demo.controller;

import com.expense.demo.model.ExpenseGroup;
import com.expense.demo.model.User;
import com.expense.demo.repository.ExpenseGroupRepository;
import com.expense.demo.repository.UserRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups")
public class GroupController {

    private final ExpenseGroupRepository groupRepo;
    private final UserRepository userRepo;

    public GroupController(ExpenseGroupRepository groupRepo, UserRepository userRepo) {
        this.groupRepo = groupRepo;
        this.userRepo = userRepo;
    }

    // 1. Create a Group
    // API: POST /api/groups
    // Body: { "name": "Manali Trip" }
    @PostMapping
    public ExpenseGroup createGroup(@RequestBody ExpenseGroup group) {
        return groupRepo.save(group);
    }

    // 2. Add a User to a Group
    // API: POST /api/groups/1/add/5  (Add User ID 5 to Group ID 1)
    @PostMapping("/{groupId}/add/{userId}")
    public ExpenseGroup addMember(@PathVariable Long groupId, @PathVariable Long userId) {
        ExpenseGroup group = groupRepo.findById(groupId).orElseThrow();
        User user = userRepo.findById(userId).orElseThrow();

        group.getMembers().add(user);
        return groupRepo.save(group);
    }

    // 3. Get all groups
    @GetMapping
    public List<ExpenseGroup> getAllGroups() {
        return groupRepo.findAll();
    }
}
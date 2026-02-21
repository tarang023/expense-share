package com.expense.demo.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.expense.demo.dto.ExpenseDto;
import com.expense.demo.model.Expense;
import com.expense.demo.model.ExpenseGroup;
import com.expense.demo.model.ExpenseSplit;
import com.expense.demo.model.User;
import com.expense.demo.repository.ExpenseGroupRepository;
import com.expense.demo.repository.ExpenseRepository;
import com.expense.demo.repository.UserRepository;

@Service
public class GroupService {

    @Autowired
    private ExpenseGroupRepository groupRepo;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    public ExpenseGroup findById(Long groupId) {
        return groupRepo.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found with ID: " + groupId));
    }

    public ExpenseGroup saveGroup(ExpenseGroup group) {
        return groupRepo.save(group);
    }

    public List<ExpenseGroup> getAllGroups(Long userId) {

        return groupRepo.findByMembers_Id(userId);

    }

    public ExpenseGroup createGroup(Long creatorId, String name) {
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + creatorId));

        
        ExpenseGroup newGroup = new ExpenseGroup();
        newGroup.setName(name);

        
        newGroup.getMembers().add(creator);

        
        return groupRepo.save(newGroup);

    }

    public ExpenseGroup addMemberByUsername(Long groupId, String usernameToAdd, String requesterUsername) {
        
        ExpenseGroup group = groupRepo.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        System.out.println("Adding member by username: " + usernameToAdd);

        System.out.println("Requester: " + requesterUsername + ", To Add: " + usernameToAdd);
        boolean isRequesterInGroup = group.getMembers().stream()
                .anyMatch(member -> member.getUsername().equals(requesterUsername));

        if (!isRequesterInGroup) {
            throw new RuntimeException("You are not a member of this group, so you cannot add others.");
        }

        
        User userToAdd = userRepository.findByUsername(usernameToAdd);

        if (userToAdd == null) {
            throw new RuntimeException("User to add not found: " + usernameToAdd);
        }

        if (group.getMembers().contains(userToAdd)) {
            throw new RuntimeException("User is already in the group.");
        }

        
        group.getMembers().add(userToAdd);
        return groupRepo.save(group);
    }

    public ExpenseDto addExpense(Long groupId, ExpenseDto expenseDto) {
        ExpenseGroup group = groupRepo.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found with ID: " + groupId));

        User paidBy = userRepository.findByUsername(expenseDto.getPaidBy());

        if (paidBy == null) {
            throw new RuntimeException("Payer user not found: " + expenseDto.getPaidBy());
        }
        ;

        Expense expense = new Expense();
        expense.setAmount(expenseDto.getAmount());
        expense.setDescription(expenseDto.getDescription());

        if (expenseDto.getDate() == null) {
            expense.setDate(LocalDateTime.now());
        } else {
            expense.setDate(expenseDto.getDate());
        }

        expense.setGroup(group);
        expense.setPaidBy(paidBy);

        Expense savedExpense = expenseRepository.save(expense);

        
        List<User> members = group.getMembers();
        if (members != null && !members.isEmpty()) {
            double amountPerPerson = expense.getAmount() / members.size();
            List<ExpenseSplit> splits = new java.util.ArrayList<>();

            for (User member : members) {
                ExpenseSplit split = new ExpenseSplit();
                split.setExpense(savedExpense);
                split.setUser(member);
                split.setAmountOwed(amountPerPerson);
                splits.add(split);
            }
            
            
            
            savedExpense.setSplits(splits);
            expenseRepository.save(savedExpense); 
        }

        
        expenseDto.setId(savedExpense.getId());
        expenseDto.setDate(savedExpense.getDate());

        return expenseDto;

    }

    public void inviteMember(Long groupId, String email) {

        

    }

}

package com.expense.demo.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.expense.demo.model.ExpenseGroup;
import com.expense.demo.model.User;
import com.expense.demo.repository.ExpenseGroupRepository;
import com.expense.demo.repository.UserRepository;

@Service
public class GroupService {

    @Autowired
    private ExpenseGroupRepository groupRepo;

    @Autowired
    private UserRepository userRepository;

    public ExpenseGroup findById(Long groupId) {
        return groupRepo.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found with ID: " + groupId));
    }

    public ExpenseGroup saveGroup(ExpenseGroup group) {
        return groupRepo.save(group);
    }

    public List<ExpenseGroup> getAllGroups() {

       Long userId=5L; 
       return groupRepo.findByMembers_Id(userId);

    }

    public ExpenseGroup createGroup(Long creatorId, String name) {
      User creator = userRepository.findById(creatorId)
            .orElseThrow(() -> new RuntimeException("User not found with ID: " + creatorId));

    // 2. Create the new Group object
    ExpenseGroup newGroup = new ExpenseGroup();
    newGroup.setName(name);

    // 3. Add the creator to the members list
    newGroup.getMembers().add(creator);
    
    // 4. Save
    return groupRepo.save(newGroup);


    }

    public ExpenseGroup addMemberByUsername(Long groupId, String usernameToAdd, String requesterUsername) {
    // 1. Fetch the Group
    ExpenseGroup group = groupRepo.findById(groupId)
        .orElseThrow(() -> new RuntimeException("Group not found"));
System.out.println("Adding member by username: " + usernameToAdd);
    System.out.println();
    System.out.println();
    System.out.println();
    System.out.println();
    System.out.println();
    System.out.println("Requester: " + requesterUsername + ", To Add: " + usernameToAdd);
    boolean isRequesterInGroup = group.getMembers().stream()
        .anyMatch(member -> member.getUsername().equals(requesterUsername));
    
    if (!isRequesterInGroup) {
        throw new RuntimeException("You are not a member of this group, so you cannot add others.");
    }

    // 3. Fetch the User to be added
    User userToAdd = userRepository.findByUsername(usernameToAdd);
         
    if(userToAdd == null) {
        throw new RuntimeException("User to add not found: " + usernameToAdd);
    }

  
    if (group.getMembers().contains(userToAdd)) {
        throw new RuntimeException("User is already in the group.");
    }

    // 5. Add and Save
    group.getMembers().add(userToAdd);
    return groupRepo.save(group);
}
    
}

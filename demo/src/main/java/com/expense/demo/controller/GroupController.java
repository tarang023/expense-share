package com.expense.demo.controller;

import com.expense.demo.dto.ExpenseDto;
import com.expense.demo.dto.GroupDetailDto;
import com.expense.demo.dto.MemberDto;
import com.expense.demo.model.ExpenseGroup;
import com.expense.demo.model.User;
import com.expense.demo.repository.ExpenseGroupRepository;
import com.expense.demo.repository.UserRepository;
import com.expense.demo.service.GroupService;
import com.expense.demo.service.JWTService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
 

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/groups")
public class GroupController {

    private final ExpenseGroupRepository groupRepo;
    // private final UserRepository userRepo;
    @Autowired
    private GroupService groupService;

    @Autowired
    private JWTService jwtService;

    @Autowired
    private UserRepository userRepo;

    public GroupController(ExpenseGroupRepository groupRepo, UserRepository userRepo) {
        this.groupRepo = groupRepo;
        // this.userRepo = userRepo;
    }

    @PostMapping("/createGroup")
   public ExpenseGroup createGroup(@RequestBody Map<String, String> payload, Authentication authentication) {
    
  
    String name = payload.get("name");

   
    Long userId = userRepo.findByUsername(authentication.getName()).getId();
    
    return groupService.createGroup(userId, name);
}

    @GetMapping("/test")
    public String test() {
        return "Group controller is working!";
    }

    @PostMapping("/{groupId}/add") // Removed {userId} since you are adding the logged-in user
    public ExpenseGroup addMember(
            @PathVariable Long groupId,
            @RequestHeader("Authorization") String authHeader // 1. Get the raw header
    ) {
        ExpenseGroup group = groupService.findById(groupId);

    
        String token = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        }

        // 3. Now extract username
        String username = jwtService.extractUserName(token);
        System.out.println("Username from token: " + username);

        User user = userRepo.findByUsername(username);

        group.getMembers().add(user);
        return groupService.saveGroup(group);
    }

    @GetMapping("/getAll")
    public List<ExpenseGroup> getAllGroups(Authentication authentication) {
          Long userId = userRepo.findByUsername(authentication.getName()).getId();

          System.out.println("Fetching groups for user ID: " + userId);
        return groupService.getAllGroups(userId);
    }

    @PostMapping("/{groupId}/add-member")
    public ResponseEntity<?> addMemberToGroup(
    @PathVariable Long groupId, 
    @RequestBody Map<String, String> requestBody, // expects {"username": "john_doe"}
    @AuthenticationPrincipal UserDetails currentUserDetails // The person DOING the adding
) {
    try {
        String usernameToAdd = requestBody.get("username");
        ExpenseGroup updatedGroup = groupService.addMemberByUsername(groupId, usernameToAdd, currentUserDetails.getUsername());
        return ResponseEntity.ok(updatedGroup);
    } catch (RuntimeException e) {
        return ResponseEntity.badRequest().body(e.getMessage());
    }
}

    @GetMapping("/{groupId}/dashboard")
    public ResponseEntity<GroupDetailDto> getGroupDashboard(
            @PathVariable Long groupId,
            @AuthenticationPrincipal UserDetails currentUser  
    ) {
      
        ExpenseGroup group = groupRepo.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        // 2. SECURITY CHECK: Ensure the requester is actually IN the group
        boolean isMember = group.getMembers().stream()
                .anyMatch(m -> m.getUsername().equals(currentUser.getUsername()));
        
        if (!isMember) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // 3. Map Members to DTOs (Hiding passwords/emails)
        List<MemberDto> memberDtos = group.getMembers().stream()
                .map(m -> new MemberDto(m.getId(), m.getUsername()))
                .collect(Collectors.toList());


    

        // 4. Map Expenses to DTOs
        // Assuming 'Expense' entity has fields: id, description, amount, paidBy (User), date
        List<ExpenseDto> expenseDtos = group.getExpenses().stream()
                .map(e -> new ExpenseDto(
                        e.getId(),
                        e.getDescription(),
                        e.getAmount(),
                        e.getPaidBy().getUsername(), // Extract just the username
                        e.getDate()
                ))
                .collect(Collectors.toList());

        // 5. Construct Final Response
        GroupDetailDto response = new GroupDetailDto(
                group.getId(),
                group.getName(),
                memberDtos,
                expenseDtos
        );

        return ResponseEntity.ok(response);
    }


    @PostMapping("/{groupId}/expenses")
    public ResponseEntity<ExpenseDto> addExpense(@PathVariable Long groupId, @RequestBody ExpenseDto expense) {
       
        ExpenseDto savedExpense = groupService.addExpense(groupId, expense);
        return ResponseEntity.ok(savedExpense);
    }

    @PostMapping("/{groupId}/invite")
    public ResponseEntity<String> inviteMember(@PathVariable Long groupId, @RequestBody Map<String, String> payload) {
        String username = payload.get("username");
        groupService.inviteMember(groupId, username);
        return ResponseEntity.ok("Invite sent successfully");
    }


}
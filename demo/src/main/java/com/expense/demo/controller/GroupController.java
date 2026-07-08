package com.expense.demo.controller;

import com.expense.demo.dto.ExpenseDto;
import com.expense.demo.dto.GroupDetailDto;
import com.expense.demo.dto.InvitationDto;
import com.expense.demo.dto.MemberDto;
import com.expense.demo.model.ExpenseGroup;
import com.expense.demo.model.User;
import com.expense.demo.repository.ExpenseGroupRepository;
import com.expense.demo.repository.UserRepository;
import com.expense.demo.service.GroupService;
import com.expense.demo.service.SettlementService;
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
    private final GroupService groupService;
    private final SettlementService settlementService;
    private final UserRepository userRepo;

    @Autowired
    private JWTService jwtService;

    public GroupController(ExpenseGroupRepository groupRepo, GroupService groupService, SettlementService settlementService, UserRepository userRepo) {
        this.groupRepo = groupRepo;
        this.groupService = groupService;
        this.settlementService = settlementService;
        this.userRepo = userRepo;
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

    @PostMapping("/{groupId}/add")
    public ExpenseGroup addMember(
            @PathVariable Long groupId,
            @RequestHeader("Authorization") String authHeader
    ) {
        ExpenseGroup group = groupService.findById(groupId);

        String token = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        }

        String username = jwtService.extractUserName(token);
        User user = userRepo.findByUsername(username);

        group.getMembers().add(user);
        return groupService.saveGroup(group);
    }

    @GetMapping("/getAll")
    public List<ExpenseGroup> getAllGroups(Authentication authentication) {
        Long userId = userRepo.findByUsername(authentication.getName()).getId();
        return groupService.getAllGroups(userId);
    }

    @PostMapping("/{groupId}/add-member")
    public ResponseEntity<?> addMemberToGroup(
            @PathVariable Long groupId,
            @RequestBody Map<String, String> requestBody,
            @AuthenticationPrincipal UserDetails currentUserDetails
    ) {
        try {
            String usernameToAdd = requestBody.get("username");
            ExpenseGroup updatedGroup = groupService.addMemberByUsername(groupId, usernameToAdd,
                    currentUserDetails.getUsername());
            return ResponseEntity.ok(updatedGroup);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{groupId}/dashboard")
    @SuppressWarnings("null")
    public ResponseEntity<GroupDetailDto> getGroupDashboard(
            @PathVariable Long groupId,
            @AuthenticationPrincipal UserDetails currentUser) {

        ExpenseGroup group = groupRepo.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        boolean isMember = group.getMembers().stream()
                .anyMatch(m -> m.getUsername().equals(currentUser.getUsername()));

        if (!isMember) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<MemberDto> memberDtos = group.getMembers().stream()
                .map(m -> new MemberDto(m.getId(), m.getUsername()))
                .collect(Collectors.toList());

        List<ExpenseDto> expenseDtos = group.getExpenses().stream()
                .map(e -> new ExpenseDto(
                        e.getId(),
                        e.getDescription(),
                        e.getAmount(),
                        e.getPaidBy() != null ? e.getPaidBy().getUsername() : "Unknown",
                        e.getDate()))
                .collect(Collectors.toList());

        List<com.expense.demo.dto.SimplifiedDebtDto> simplifiedDebts = settlementService.calculateSimplifiedDebts(groupId);

        GroupDetailDto response = new GroupDetailDto(
                group.getId(),
                group.getName(),
                memberDtos,
                expenseDtos,
                simplifiedDebts);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/{groupId}/expenses")
    public ResponseEntity<ExpenseDto> addExpense(
            @PathVariable Long groupId,
            @RequestBody ExpenseDto expense,
            @AuthenticationPrincipal UserDetails currentUser) {
        ExpenseDto savedExpense = groupService.addExpense(groupId, expense, currentUser.getUsername());
        return ResponseEntity.ok(savedExpense);
    }

    // ── Invitation endpoints ──────────────────────────────────────────────────

    /**
     * POST /api/groups/{groupId}/invite
     * Body: { "username": "target_user" }
     * Sends a PENDING invitation from the authenticated user to the target.
     */
    @PostMapping("/{groupId}/invite")
    public ResponseEntity<?> sendInvite(
            @PathVariable Long groupId,
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal UserDetails currentUser) {
        try {
            String inviteeUsername = payload.get("username");
            InvitationDto dto = groupService.sendInvite(groupId, currentUser.getUsername(), inviteeUsername);
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * GET /api/groups/invites
     * Returns all PENDING invitations for the authenticated user.
     */
    @GetMapping("/invites")
    public ResponseEntity<List<InvitationDto>> getPendingInvites(
            @AuthenticationPrincipal UserDetails currentUser) {
        List<InvitationDto> invites = groupService.getPendingInvites(currentUser.getUsername());
        return ResponseEntity.ok(invites);
    }

    /**
     * POST /api/groups/invites/{inviteId}/accept
     * Accepts the invitation and joins the group.
     */
    @PostMapping("/invites/{inviteId}/accept")
    public ResponseEntity<?> acceptInvite(
            @PathVariable Long inviteId,
            @AuthenticationPrincipal UserDetails currentUser) {
        try {
            InvitationDto dto = groupService.acceptInvite(inviteId, currentUser.getUsername());
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * POST /api/groups/invites/{inviteId}/reject
     * Rejects the invitation without joining the group.
     */
    @PostMapping("/invites/{inviteId}/reject")
    public ResponseEntity<?> rejectInvite(
            @PathVariable Long inviteId,
            @AuthenticationPrincipal UserDetails currentUser) {
        try {
            InvitationDto dto = groupService.rejectInvite(inviteId, currentUser.getUsername());
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
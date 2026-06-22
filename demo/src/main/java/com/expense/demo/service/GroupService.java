package com.expense.demo.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.expense.demo.dto.ExpenseDto;
import com.expense.demo.dto.InvitationDto;
import com.expense.demo.model.Expense;
import com.expense.demo.model.ExpenseGroup;
import com.expense.demo.model.ExpenseSplit;
import com.expense.demo.model.GroupInvitation;
import com.expense.demo.model.InvitationStatus;
import com.expense.demo.model.User;
import com.expense.demo.repository.ExpenseGroupRepository;
import com.expense.demo.repository.ExpenseRepository;
import com.expense.demo.repository.GroupInvitationRepository;
import com.expense.demo.repository.UserRepository;

@Service
public class GroupService {

    @Autowired
    private ExpenseGroupRepository groupRepo;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private GroupInvitationRepository invitationRepository;

    // ── Existing helpers ─────────────────────────────────────────────────────

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

    public ExpenseDto addExpense(Long groupId, ExpenseDto expenseDto, String paidByUsername) {
        ExpenseGroup group = groupRepo.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found with ID: " + groupId));

        // Payer is always the authenticated user — ignoring any paidBy in the DTO
        User paidBy = userRepository.findByUsername(paidByUsername);
        if (paidBy == null) {
            throw new RuntimeException("Authenticated user not found: " + paidByUsername);
        }

        Expense expense = new Expense();
        expense.setAmount(expenseDto.getAmount());
        expense.setDescription(expenseDto.getDescription());
        expense.setDate(expenseDto.getDate() == null ? LocalDateTime.now() : expenseDto.getDate());
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

    // ── Invitation methods ────────────────────────────────────────────────────

    /**
     * Creates a PENDING invitation from inviterUsername to inviteeUsername for groupId.
     * Guards: invitee must exist, invitee must not already be a member, no duplicate PENDING invite.
     */
    @Transactional
    public InvitationDto sendInvite(Long groupId, String inviterUsername, String inviteeUsername) {
        ExpenseGroup group = groupRepo.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found with ID: " + groupId));

        User inviter = userRepository.findByUsername(inviterUsername);
        if (inviter == null) {
            throw new RuntimeException("Inviter not found: " + inviterUsername);
        }

        // Only group members can send invites
        boolean inviterIsMember = group.getMembers().stream()
                .anyMatch(m -> m.getUsername().equals(inviterUsername));
        if (!inviterIsMember) {
            throw new RuntimeException("You must be a group member to send invitations.");
        }

        User invitee = userRepository.findByUsername(inviteeUsername);
        if (invitee == null) {
            throw new RuntimeException("User not found: " + inviteeUsername);
        }

        // Guard: already a member
        boolean alreadyMember = group.getMembers().stream()
                .anyMatch(m -> m.getId().equals(invitee.getId()));
        if (alreadyMember) {
            throw new RuntimeException(inviteeUsername + " is already a member of this group.");
        }

        // Guard: duplicate pending invite
        boolean pendingExists = invitationRepository
                .existsByGroup_IdAndInvitee_IdAndStatus(groupId, invitee.getId(), InvitationStatus.PENDING);
        if (pendingExists) {
            throw new RuntimeException(inviteeUsername + " already has a pending invitation to this group.");
        }

        GroupInvitation invitation = new GroupInvitation();
        invitation.setGroup(group);
        invitation.setInviter(inviter);
        invitation.setInvitee(invitee);
        invitation.setStatus(InvitationStatus.PENDING);
        invitation.setCreatedAt(LocalDateTime.now());

        GroupInvitation saved = invitationRepository.save(invitation);
        return toDto(saved);
    }

    /**
     * Returns all PENDING invitations for the authenticated user.
     */
    public List<InvitationDto> getPendingInvites(String username) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found: " + username);
        }
        return invitationRepository
                .findByInvitee_IdAndStatus(user.getId(), InvitationStatus.PENDING)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Accepts the invitation: sets status to ACCEPTED and adds the invitee to the group.
     */
    @Transactional
    public InvitationDto acceptInvite(Long inviteId, String username) {
        GroupInvitation invitation = getInvitationForUser(inviteId, username);

        invitation.setStatus(InvitationStatus.ACCEPTED);
        invitationRepository.save(invitation);

        ExpenseGroup group = invitation.getGroup();
        group.getMembers().add(invitation.getInvitee());
        groupRepo.save(group);

        return toDto(invitation);
    }

    /**
     * Rejects the invitation: sets status to REJECTED only.
     */
    @Transactional
    public InvitationDto rejectInvite(Long inviteId, String username) {
        GroupInvitation invitation = getInvitationForUser(inviteId, username);
        invitation.setStatus(InvitationStatus.REJECTED);
        invitationRepository.save(invitation);
        return toDto(invitation);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    /** Loads an invitation and verifies it is PENDING and belongs to the given user. */
    private GroupInvitation getInvitationForUser(Long inviteId, String username) {
        GroupInvitation invitation = invitationRepository.findById(inviteId)
                .orElseThrow(() -> new RuntimeException("Invitation not found with ID: " + inviteId));

        if (!invitation.getInvitee().getUsername().equals(username)) {
            throw new RuntimeException("This invitation does not belong to you.");
        }
        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new RuntimeException("Invitation is no longer pending (status: " + invitation.getStatus() + ").");
        }
        return invitation;
    }

    /** Maps a GroupInvitation entity to a flat InvitationDto. */
    private InvitationDto toDto(GroupInvitation inv) {
        return new InvitationDto(
                inv.getId(),
                inv.getGroup().getId(),
                inv.getGroup().getName(),
                inv.getInviter().getUsername(),
                inv.getInvitee().getUsername(),
                inv.getStatus(),
                inv.getCreatedAt()
        );
    }
}


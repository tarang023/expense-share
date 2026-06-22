package com.expense.demo.repository;

import com.expense.demo.model.GroupInvitation;
import com.expense.demo.model.InvitationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GroupInvitationRepository extends JpaRepository<GroupInvitation, Long> {

    /** All PENDING invites waiting for a specific invitee. */
    List<GroupInvitation> findByInvitee_IdAndStatus(Long inviteeId, InvitationStatus status);

    /** Guard against duplicate pending invites for the same group + invitee pair. */
    boolean existsByGroup_IdAndInvitee_IdAndStatus(Long groupId, Long inviteeId, InvitationStatus status);
}

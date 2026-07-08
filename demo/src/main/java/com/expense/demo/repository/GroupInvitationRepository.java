package com.expense.demo.repository;

import com.expense.demo.model.GroupInvitation;
import com.expense.demo.model.InvitationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GroupInvitationRepository extends JpaRepository<GroupInvitation, Long> {

    List<GroupInvitation> findByInvitee_IdAndStatus(Long inviteeId, InvitationStatus status);

    boolean existsByGroup_IdAndInvitee_IdAndStatus(Long groupId, Long inviteeId, InvitationStatus status);
}

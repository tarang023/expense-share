package com.expense.demo.dto;

import com.expense.demo.model.InvitationStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class InvitationDto {

    private Long id;
    private Long groupId;
    private String groupName;
    private String inviterUsername;
    private String inviteeUsername;
    private InvitationStatus status;
    private LocalDateTime createdAt;

    public InvitationDto(Long id, Long groupId, String groupName,
                         String inviterUsername, String inviteeUsername,
                         InvitationStatus status, LocalDateTime createdAt) {
        this.id = id;
        this.groupId = groupId;
        this.groupName = groupName;
        this.inviterUsername = inviterUsername;
        this.inviteeUsername = inviteeUsername;
        this.status = status;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getGroupId() { return groupId; }
    public void setGroupId(Long groupId) { this.groupId = groupId; }

    public String getGroupName() { return groupName; }
    public void setGroupName(String groupName) { this.groupName = groupName; }

    public String getInviterUsername() { return inviterUsername; }
    public void setInviterUsername(String inviterUsername) { this.inviterUsername = inviterUsername; }

    public String getInviteeUsername() { return inviteeUsername; }
    public void setInviteeUsername(String inviteeUsername) { this.inviteeUsername = inviteeUsername; }

    public InvitationStatus getStatus() { return status; }
    public void setStatus(InvitationStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

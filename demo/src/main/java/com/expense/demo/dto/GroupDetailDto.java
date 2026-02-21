package com.expense.demo.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

public class GroupDetailDto {
    private Long groupId;
    private String groupName;
    private List<MemberDto> members;
    private List<ExpenseDto> expenses;

    public GroupDetailDto() {
    }

    public GroupDetailDto(Long groupId, String groupName, List<MemberDto> members, List<ExpenseDto> expenses) {
        this.groupId = groupId;
        this.groupName = groupName;
        this.members = members;
        this.expenses = expenses;
    }

    public Long getGroupId() {
        return groupId;
    }

    public void setGroupId(Long groupId) {
        this.groupId = groupId;
    }

    public String getGroupName() {
        return groupName;
    }

    public void setGroupName(String groupName) {
        this.groupName = groupName;
    }

    public List<MemberDto> getMembers() {
        return members;
    }

    public void setMembers(List<MemberDto> members) {
        this.members = members;
    }

    public List<ExpenseDto> getExpenses() {
        return expenses;
    }

    public void setExpenses(List<ExpenseDto> expenses) {
        this.expenses = expenses;
    }
}
package com.expense.demo.dto;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data                 // Generates Getters, Setters, toString, equals, hashcode
@AllArgsConstructor   // Generates a constructor with all arguments
@NoArgsConstructor
public class GroupDetailDto {
    private Long groupId;
    private String groupName;
    private List<MemberDto> members;
    private List<ExpenseDto> expenses;

    
}
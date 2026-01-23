package com.expense.demo.dto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data                 // Generates Getters, Setters, toString, equals, hashcode
@AllArgsConstructor   // Generates a constructor with all arguments
@NoArgsConstructor
public class MemberDto {
    private Long id;
    private String username;
 
    // Generate Getters & Setters
}
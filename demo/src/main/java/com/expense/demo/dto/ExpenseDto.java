package com.expense.demo.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data                 // Generates Getters, Setters, toString, equals, hashcode
@AllArgsConstructor   // Generates a constructor with all arguments
@NoArgsConstructor

public class ExpenseDto {
    private Long id;
    private String description;
    private Double amount;
    private String paidBy; // Username of the payer
    private LocalDateTime date;
 
}
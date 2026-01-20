package com.expense.demo.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor // Allows empty constructor
@AllArgsConstructor
public class SettlementTransaction {
    private Long payerId;
    private Long payeeId;
    private Double amount;
}
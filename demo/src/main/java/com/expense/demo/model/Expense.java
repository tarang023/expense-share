package com.expense.demo.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;
import java.time.LocalDateTime;

@Entity
@Getter 
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String description;
    private Double amount;
    private LocalDateTime date;
    
    // --- FIX 1: Map to the User Entity, not the ID ---
    // If you only want the ID number, remove @ManyToOne. 
    // But usually, you want the relationship to the User object.
    @ManyToOne
    @JoinColumn(name = "payer_id") 
    private User payer; 

    @ManyToOne
    @JoinColumn(name = "group_id") 
    private ExpenseGroup group;

 
    @OneToMany(mappedBy = "expense", cascade = CascadeType.ALL)
    private List<ExpenseSplit> splits;
}
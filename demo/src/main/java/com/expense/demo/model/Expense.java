package com.expense.demo.model;

import com.fasterxml.jackson.annotation.JsonIgnore; // <--- Import this
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
    
    @ManyToOne
    @JoinColumn(name = "group_id") 
    @JsonIgnore  // <--- CRITICAL FIX: Stops the infinite JSON loop
    private ExpenseGroup group;

    @OneToMany(mappedBy = "expense", cascade = CascadeType.ALL)
    private List<ExpenseSplit> splits;

    @ManyToOne 
    @JoinColumn(name = "paid_by_user_id") 
    private User paidBy;
}
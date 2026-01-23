package com.expense.demo.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;       // <--- Changed from @Data
import lombok.NoArgsConstructor;
import lombok.Setter;       // <--- Changed from @Data

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter  // Use Getter/Setter instead of @Data to prevent toString() infinite loops
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseGroup {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;  

    @OneToMany(mappedBy = "group") 
    private List<Expense> expenses;
 
    @ManyToMany
    @JoinTable(
        name = "group_members",
        joinColumns = @JoinColumn(name = "group_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private List<User> members = new ArrayList<>();
}
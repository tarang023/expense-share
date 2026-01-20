package com.expense.demo.repository;

import com.expense.demo.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    // JpaRepository gives us findAll(), save(), findById() automatically.
    List<Expense> findByGroupId(Long groupId);

}
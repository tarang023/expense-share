package com.expense.demo.repository;

import com.expense.demo.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;


@Repository

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    
    List<Expense> findByGroupId(Long groupId);

    @Query("SELECT s.user.id as userId, " +
           "(SUM(CASE WHEN e.paidBy.id = s.user.id THEN e.amount ELSE 0 END) - SUM(s.amountOwed)) as netBalance " +
           "FROM Expense e JOIN ExpenseSplit s ON e.id = s.expense.id " +
           "WHERE e.group.Id = :groupId GROUP BY s.user.id")
    List<UserBalanceProjection> getGroupNetBalances(@Param("groupId") Long groupId);


}
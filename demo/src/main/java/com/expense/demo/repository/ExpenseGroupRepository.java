package com.expense.demo.repository;

import com.expense.demo.model.ExpenseGroup;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ExpenseGroupRepository extends JpaRepository<ExpenseGroup, Long> {

    List<ExpenseGroup> findByMembers_Id(Long userId);
}   
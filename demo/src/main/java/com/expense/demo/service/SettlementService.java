package com.expense.demo.service;

import com.expense.demo.model.Expense;
import com.expense.demo.model.ExpenseSplit;
import com.expense.demo.model.SettlementTransaction;
import com.expense.demo.repository.ExpenseRepository;
import com.expense.demo.repository.ExpenseSplitRepository;
import com.expense.demo.repository.UserRepository;
import com.expense.demo.repository.ExpenseGroupRepository;
import com.expense.demo.model.ExpenseGroup;
import com.expense.demo.model.User;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class SettlementService {

    private final ExpenseRepository expenseRepo;
    private final ExpenseSplitRepository splitRepo;
    private final UserRepository userRepo;
    private final ExpenseGroupRepository groupRepo;

    public SettlementService(ExpenseRepository expenseRepo, ExpenseSplitRepository splitRepo, UserRepository userRepo,
            ExpenseGroupRepository groupRepo) {
        this.expenseRepo = expenseRepo;
        this.splitRepo = splitRepo;
        this.userRepo = userRepo;
        this.groupRepo = groupRepo;
    }

    
    public List<SettlementTransaction> getSettlementPlan(Long groupId) {
        
        
        Map<Long, Double> balances = new HashMap<>();

        
        List<Expense> expenses = expenseRepo.findByGroupId(groupId);

        for (Expense e : expenses) {
            
            balances.put(e.getPaidBy().getId(), balances.getOrDefault(e.getPaidBy().getId(), 0.0) + e.getAmount());

            
            
            
            List<ExpenseSplit> splits = splitRepo.findByExpenseId(e.getId());

            for (ExpenseSplit s : splits) {
                
                balances.put(s.getUser().getId(), balances.getOrDefault(s.getUser().getId(), 0.0) - s.getAmountOwed());
            }
        }

        
        PriorityQueue<Map.Entry<Long, Double>> debtors = new PriorityQueue<>(Map.Entry.comparingByValue()); 
                                                                                                            
                                                                                                            

        PriorityQueue<Map.Entry<Long, Double>> creditors = new PriorityQueue<>(
                (a, b) -> Double.compare(b.getValue(), a.getValue())); 

        for (Map.Entry<Long, Double> entry : balances.entrySet()) {
            
            if (entry.getValue() < -0.01)
                debtors.add(entry);
            else if (entry.getValue() > 0.01)
                creditors.add(entry);
        }

        List<SettlementTransaction> transactions = new ArrayList<>();

        
        while (!debtors.isEmpty() && !creditors.isEmpty()) {
            var debtor = debtors.poll();
            var creditor = creditors.poll();

            double debt = Math.abs(debtor.getValue());
            double credit = creditor.getValue();

            
            double settleAmount = Math.min(debt, credit);

            SettlementTransaction st = new SettlementTransaction();
            st.setPayerId(debtor.getKey());
            st.setPayeeId(creditor.getKey());
            st.setAmount(settleAmount);
            transactions.add(st);

            
            double remainingDebt = debt - settleAmount;
            double remainingCredit = credit - settleAmount;

            if (remainingCredit > 0.01) {
                creditor.setValue(remainingCredit);
                creditors.add(creditor);
            }
            if (remainingDebt > 0.01) {
                debtor.setValue(-remainingDebt); 
                debtors.add(debtor);
            }
        }
        return transactions;
    }

    public void recordSettlement(Long groupId, SettlementTransaction transaction) {
        ExpenseGroup group = groupRepo.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        User payer = userRepo.findById(transaction.getPayerId())
                .orElseThrow(() -> new RuntimeException("Payer not found"));

        User payee = userRepo.findById(transaction.getPayeeId())
                .orElseThrow(() -> new RuntimeException("Payee not found"));

        
        Expense settlementExpense = new Expense();
        settlementExpense.setAmount(transaction.getAmount());
        settlementExpense.setDescription("Settlement from " + payer.getUsername() + " to " + payee.getUsername());
        settlementExpense.setDate(java.time.LocalDateTime.now());
        settlementExpense.setGroup(group);
        settlementExpense.setPaidBy(payer); 

        
        Expense savedExpense = expenseRepo.save(settlementExpense);

        
        
        
        
        
        
        ExpenseSplit split = new ExpenseSplit();
        split.setExpense(savedExpense);
        split.setUser(payee);
        split.setAmountOwed(transaction.getAmount());

        savedExpense.setSplits(java.util.List.of(split));
        expenseRepo.save(savedExpense); 
    }
}
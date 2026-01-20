package com.expense.demo.service;

import com.expense.demo.model.Expense;
import com.expense.demo.model.ExpenseSplit;
import com.expense.demo.model.SettlementTransaction;
import com.expense.demo.repository.ExpenseRepository;
import com.expense.demo.repository.ExpenseSplitRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class SettlementService {

    private final ExpenseRepository expenseRepo;
    private final ExpenseSplitRepository splitRepo;

    public SettlementService(ExpenseRepository expenseRepo, ExpenseSplitRepository splitRepo) {
        this.expenseRepo = expenseRepo;
        this.splitRepo = splitRepo;
    }

    /**
     * MAIN ALGORITHM: Calculates who pays whom to settle all debts for a SPECIFIC GROUP.
     */
    public List<SettlementTransaction> getSettlementPlan(Long groupId) {
        // 1. Calculate Net Balances
        // Map<UserID, Balance> -> Positive means you are owed, Negative means you owe.
        Map<Long, Double> balances = new HashMap<>();

        // Fetch only expenses belonging to this specific group
        List<Expense> expenses = expenseRepo.findByGroupId(groupId);

        for (Expense e : expenses) {
            // Payer gets POSITIVE balance (they paid, so they are owed money)
            balances.put(e.getPayer().getId(), balances.getOrDefault(e.getPayer().getId(), 0.0) + e.getAmount());

            // Fetch splits for this specific expense
            // Note: Ensure your ExpenseSplitRepository has the method findByExpenseId(Long id)
            List<ExpenseSplit> splits = splitRepo.findByExpenseId(e.getId()); 
            
            for (ExpenseSplit s : splits) {
                // Borrower gets NEGATIVE balance (they consumed, so they owe money)
                balances.put(s.getUser().getId(), balances.getOrDefault(s.getUser().getId(), 0.0) - s.getAmountOwed());
            }
        }

        // 2. Separate into Debtors (-) and Creditors (+)
        PriorityQueue<Map.Entry<Long, Double>> debtors = 
            new PriorityQueue<>(Map.Entry.comparingByValue()); // Ascending (-100, -50)
            
        PriorityQueue<Map.Entry<Long, Double>> creditors = 
            new PriorityQueue<>((a, b) -> Double.compare(b.getValue(), a.getValue())); // Descending (100, 50)

        for (Map.Entry<Long, Double> entry : balances.entrySet()) {
            // Use 0.01 tolerance for floating point errors
            if (entry.getValue() < -0.01) debtors.add(entry);
            else if (entry.getValue() > 0.01) creditors.add(entry);
        }

        List<SettlementTransaction> transactions = new ArrayList<>();

        // 3. Greedy Matching Algorithm
        while (!debtors.isEmpty() && !creditors.isEmpty()) {
            var debtor = debtors.poll();
            var creditor = creditors.poll();

            double debt = Math.abs(debtor.getValue());
            double credit = creditor.getValue();

            // The amount to settle is the minimum of the two
            double settleAmount = Math.min(debt, credit);
            
            transactions.add(new SettlementTransaction(debtor.getKey(), creditor.getKey(), settleAmount));

            // Adjust remaining balances
            double remainingDebt = debt - settleAmount;
            double remainingCredit = credit - settleAmount;

            if (remainingCredit > 0.01) {
                creditor.setValue(remainingCredit);
                creditors.add(creditor);
            }
            if (remainingDebt > 0.01) {
                debtor.setValue(-remainingDebt); // Store as negative again
                debtors.add(debtor);
            }
        }
        return transactions;
    }
}
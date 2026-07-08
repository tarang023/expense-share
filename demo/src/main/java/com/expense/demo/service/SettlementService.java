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
import com.expense.demo.dto.SimplifiedDebtDto;
import com.expense.demo.dto.MemberDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
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

    @SuppressWarnings("null")
    public List<SimplifiedDebtDto> calculateSimplifiedDebts(Long groupId) {
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
        PriorityQueue<Map.Entry<Long, Double>> creditors = new PriorityQueue<>((a, b) -> Double.compare(b.getValue(), a.getValue()));

        for (Map.Entry<Long, Double> entry : balances.entrySet()) {
            if (entry.getValue() < -0.01) debtors.add(entry);
            else if (entry.getValue() > 0.01) creditors.add(entry);
        }

        List<SimplifiedDebtDto> simplifiedDebts = new ArrayList<>();

        while (!debtors.isEmpty() && !creditors.isEmpty()) {
            var debtorEntry = debtors.poll();
            var creditorEntry = creditors.poll();

            double debt = Math.abs(debtorEntry.getValue());
            double credit = creditorEntry.getValue();
            double settleAmount = Math.min(debt, credit);

            User debtorUser = userRepo.findById(debtorEntry.getKey()).orElse(null);
            User creditorUser = userRepo.findById(creditorEntry.getKey()).orElse(null);

            if (debtorUser != null && creditorUser != null) {
                SimplifiedDebtDto dto = new SimplifiedDebtDto(
                        new MemberDto(debtorUser.getId(), debtorUser.getUsername()),
                        new MemberDto(creditorUser.getId(), creditorUser.getUsername()),
                        settleAmount
                );
                simplifiedDebts.add(dto);
            }

            double remainingDebt = debt - settleAmount;
            double remainingCredit = credit - settleAmount;

            if (remainingCredit > 0.01) { creditorEntry.setValue(remainingCredit); creditors.add(creditorEntry); }
            if (remainingDebt > 0.01) { debtorEntry.setValue(-remainingDebt); debtors.add(debtorEntry); }
        }

        return simplifiedDebts;
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

        PriorityQueue<Map.Entry<Long, Double>> debtors   = new PriorityQueue<>(Map.Entry.comparingByValue());
        PriorityQueue<Map.Entry<Long, Double>> creditors = new PriorityQueue<>((a, b) -> Double.compare(b.getValue(), a.getValue()));

        for (Map.Entry<Long, Double> entry : balances.entrySet()) {
            if (entry.getValue() < -0.01)      debtors.add(entry);
            else if (entry.getValue() > 0.01)  creditors.add(entry);
        }

        List<SettlementTransaction> transactions = new ArrayList<>();

        while (!debtors.isEmpty() && !creditors.isEmpty()) {
            var debtor   = debtors.poll();
            var creditor = creditors.poll();

            double debt   = Math.abs(debtor.getValue());
            double credit = creditor.getValue();
            double settleAmount = Math.min(debt, credit);

            SettlementTransaction st = new SettlementTransaction();
            st.setDebtorId(debtor.getKey());
            st.setCreditorId(creditor.getKey());
            st.setAmount(settleAmount);
            transactions.add(st);

            double remainingDebt   = debt   - settleAmount;
            double remainingCredit = credit - settleAmount;

            if (remainingCredit > 0.01) { creditor.setValue(remainingCredit); creditors.add(creditor); }
            if (remainingDebt   > 0.01) { debtor.setValue(-remainingDebt);    debtors.add(debtor); }
        }
        return transactions;
    }

    @Transactional
    @SuppressWarnings("null")
    public void recordSettlement(Long groupId, SettlementTransaction transaction, String authenticatedUsername) {
        ExpenseGroup group = groupRepo.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        User payer = userRepo.findById(transaction.getDebtorId())
                .orElseThrow(() -> new RuntimeException("Debtor not found: " + transaction.getDebtorId()));

        if (!payer.getUsername().equals(authenticatedUsername)) {
            throw new RuntimeException("Only the debtor can initiate a settlement.");
        }

        User payee = userRepo.findById(transaction.getCreditorId())
                .orElseThrow(() -> new RuntimeException("Creditor not found: " + transaction.getCreditorId()));

        Expense settlementExpense = new Expense();
        settlementExpense.setAmount(transaction.getAmount());
        settlementExpense.setDescription("Settlement: " + payer.getUsername() + " → " + payee.getUsername());
        settlementExpense.setDate(LocalDateTime.now());
        settlementExpense.setGroup(group);
        settlementExpense.setPaidBy(payer);
        Expense savedExpense = expenseRepo.save(settlementExpense);

        ExpenseSplit split = new ExpenseSplit();
        split.setExpense(savedExpense);
        split.setUser(payee);
        split.setAmountOwed(transaction.getAmount());
        splitRepo.save(split);
    }
}
package com.expense.demo.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class SimplifiedDebtDto {
    private MemberDto debtor;
    private MemberDto creditor;
    private Double amount;

    public SimplifiedDebtDto(MemberDto debtor, MemberDto creditor, Double amount) {
        this.debtor = debtor;
        this.creditor = creditor;
        this.amount = amount;
    }

    public MemberDto getDebtor() {
        return debtor;
    }

    public void setDebtor(MemberDto debtor) {
        this.debtor = debtor;
    }

    public MemberDto getCreditor() {
        return creditor;
    }

    public void setCreditor(MemberDto creditor) {
        this.creditor = creditor;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }
}

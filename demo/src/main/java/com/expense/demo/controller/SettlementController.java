package com.expense.demo.controller;

import com.expense.demo.model.SettlementTransaction;
import com.expense.demo.service.SettlementService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api")
public class SettlementController {

    private final SettlementService settlementService;

    public SettlementController(SettlementService settlementService) {
        this.settlementService = settlementService;
    }
 
    
    @GetMapping("/settle/{groupId}")
    public List<SettlementTransaction> getSettlement(@PathVariable Long groupId) {
        return settlementService.getSettlementPlan(groupId);
    }

}
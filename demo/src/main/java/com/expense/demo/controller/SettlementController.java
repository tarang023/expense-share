package com.expense.demo.controller;

import com.expense.demo.model.SettlementTransaction;
import com.expense.demo.service.SettlementService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.http.ResponseEntity;
import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
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

    @PostMapping("/settle/{groupId}/pay")
    public ResponseEntity<String> recordSettlement(
            @PathVariable Long groupId,
            @RequestBody SettlementTransaction transaction) {
        settlementService.recordSettlement(groupId, transaction);
        return ResponseEntity.ok("Settlement recorded successfully");
    }

}
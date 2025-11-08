package com.ai.aitravelplanner.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Data
public class Budget {
    private Long id;
    @JsonProperty("planId")
    private Long planId;
    private String category;
    private BigDecimal amount;
    private String remark;
    @JsonProperty("expense_date")
    private LocalDate expenseDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
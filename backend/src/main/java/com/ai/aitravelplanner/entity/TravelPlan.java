package com.ai.aitravelplanner.entity;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.List;

@Data
public class TravelPlan {
    private Long id;
    private Long userId;
    private String title;
    private String destination; // 目的地
    private Integer people; // 人数
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer days;
    private BigDecimal budget; // 改为BigDecimal以匹配数据库的decimal类型
    private String preferences; // 存 JSON 字符串 ["美食","动漫"]
    private String planData; // 行程数据（JSON格式）
    private Integer status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

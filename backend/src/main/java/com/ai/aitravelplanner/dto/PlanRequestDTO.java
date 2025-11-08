package com.ai.aitravelplanner.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

/**
 * 用户创建行程时的请求体
 */
@Data
public class PlanRequestDTO {
    private String planName;          // 行程名称
    private String destination;       // 目的地
    private LocalDate startDate;      // 开始日期
    private LocalDate endDate;        // 结束日期
    private Integer days;             // 天数
    private Double budget;            // 预算
    private Integer people;           // 人数
    private List<String> preferences; // 用户偏好，如 ["美食", "文化"]
    private List<PlanDayDTO> plan;    // 用户行程安排
}
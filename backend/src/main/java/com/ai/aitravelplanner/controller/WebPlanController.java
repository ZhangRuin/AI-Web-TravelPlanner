package com.ai.aitravelplanner.controller;

import com.ai.aitravelplanner.dto.PlanDayDTO;
import com.ai.aitravelplanner.dto.PlanRequestDTO;
import com.ai.aitravelplanner.dto.SpotDTO;
import com.ai.aitravelplanner.entity.TravelPlan;
import com.ai.aitravelplanner.result.Result;
import com.ai.aitravelplanner.service.PlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/plan")
@RequiredArgsConstructor
public class WebPlanController {

    @Autowired
    private PlanService planService;

    /**
     * 保存 AI 生成的行程
     */
    @PostMapping("/save")
    public Result savePlan(@RequestBody Map<String, Object> requestBody,
                           @RequestParam Long userId) {
        try {
            System.out.println("接收到保存行程请求，用户ID: " + userId);
            System.out.println("请求体数据: " + requestBody);
            
            // 创建 PlanRequestDTO 对象
            PlanRequestDTO request = new PlanRequestDTO();
            
            // 灵活处理字段映射，支持 API 文档中定义的格式
            // 从 requestBody 中获取字段，支持不同的字段名称
            // 尝试获取 title 字段（API文档中使用的名称）
            if (requestBody.containsKey("title")) {
                request.setPlanName(requestBody.get("title").toString());
            } 
            // 同时也支持 planName 字段
            else if (requestBody.containsKey("planName")) {
                request.setPlanName(requestBody.get("planName").toString());
            }
            
            // 设置目的地
            if (requestBody.containsKey("destination")) {
                request.setDestination(requestBody.get("destination").toString());
            }
            
            // 设置天数 - 从 startDate 和 endDate 计算，或者直接获取 days
            if (requestBody.containsKey("days")) {
                request.setDays(Integer.parseInt(requestBody.get("days").toString()));
            }
            
            // 设置预算
            if (requestBody.containsKey("budget")) {
                request.setBudget(Double.parseDouble(requestBody.get("budget").toString()));
            }
            
            // 设置人数
            if (requestBody.containsKey("people")) {
                request.setPeople(Integer.parseInt(requestBody.get("people").toString()));
            }
            
            // 设置开始日期和结束日期 - 添加详细日志调试
            System.out.println("请求体中是否包含startDate: " + requestBody.containsKey("startDate"));
            System.out.println("请求体中startDate值: " + (requestBody.containsKey("startDate") ? requestBody.get("startDate") : "不存在"));
            
            if (requestBody.containsKey("startDate")) {
                String startDateStr = requestBody.get("startDate").toString();
                System.out.println("开始日期字符串值: " + startDateStr);
                try {
                    // 支持ISO格式的日期时间字符串，截取前10位作为日期部分
                    if (startDateStr.contains("T")) {
                        startDateStr = startDateStr.substring(0, 10);
                        System.out.println("截取后的日期字符串: " + startDateStr);
                    }
                    // 假设前端传递的是ISO格式的日期字符串，如"2025-11-09"
                    java.time.LocalDate startDate = java.time.LocalDate.parse(startDateStr);
                    request.setStartDate(startDate);
                    System.out.println("成功解析并设置startDate: " + startDate);
                } catch (Exception e) {
                    System.out.println("解析开始日期失败: " + e.getMessage() + ", 原始字符串: " + startDateStr);
                }
            } else {
                System.out.println("请求体中不包含startDate字段");
            }
            
            System.out.println("请求体中是否包含endDate: " + requestBody.containsKey("endDate"));
            System.out.println("请求体中endDate值: " + (requestBody.containsKey("endDate") ? requestBody.get("endDate") : "不存在"));
            
            if (requestBody.containsKey("endDate")) {
                String endDateStr = requestBody.get("endDate").toString();
                System.out.println("结束日期字符串值: " + endDateStr);
                try {
                    // 支持ISO格式的日期时间字符串，截取前10位作为日期部分
                    if (endDateStr.contains("T")) {
                        endDateStr = endDateStr.substring(0, 10);
                        System.out.println("截取后的日期字符串: " + endDateStr);
                    }
                    // 假设前端传递的是ISO格式的日期字符串，如"2025-11-10"
                    java.time.LocalDate endDate = java.time.LocalDate.parse(endDateStr);
                    request.setEndDate(endDate);
                    System.out.println("成功解析并设置endDate: " + endDate);
                } catch (Exception e) {
                    System.out.println("解析结束日期失败: " + e.getMessage() + ", 原始字符串: " + endDateStr);
                }
            } else {
                System.out.println("请求体中不包含endDate字段");
            }
            
            // 记录设置完日期后的DTO状态
            System.out.println("DTO设置完成后的startDate: " + request.getStartDate());
            System.out.println("DTO设置完成后的endDate: " + request.getEndDate());
            
            // 设置偏好
            if (requestBody.containsKey("preferences")) {
                request.setPreferences((List<String>) requestBody.get("preferences"));
            }
            
            // 设置行程安排
            if (requestBody.containsKey("plan")) {
                // 处理行程安排数据
                List<Map<String, Object>> planData = (List<Map<String, Object>>) requestBody.get("plan");
                if (planData != null && !planData.isEmpty()) {
                    List<PlanDayDTO> planDays = new ArrayList<>();
                    for (Map<String, Object> dayData : planData) {
                        PlanDayDTO dayDTO = new PlanDayDTO();
                        
                        // 设置天数
                        if (dayData.containsKey("day")) {
                            dayDTO.setDay(Integer.parseInt(dayData.get("day").toString()));
                        }
                        
                        // 设置景点
                        if (dayData.containsKey("spots")) {
                            List<Map<String, Object>> spotData = (List<Map<String, Object>>) dayData.get("spots");
                            if (spotData != null && !spotData.isEmpty()) {
                                List<SpotDTO> spots = new ArrayList<>();
                                for (Map<String, Object> spotItem : spotData) {
                                    SpotDTO spot = new SpotDTO();
                                    spot.setName(spotItem.get("name") != null ? spotItem.get("name").toString() : "");
                                    spot.setLng(spotItem.get("lng") != null ? Double.parseDouble(spotItem.get("lng").toString()) : 0.0);
                                    spot.setLat(spotItem.get("lat") != null ? Double.parseDouble(spotItem.get("lat").toString()) : 0.0);
                                    spot.setDescription(spotItem.get("description") != null ? spotItem.get("description").toString() : "");
                                    spot.setType(spotItem.get("type") != null ? spotItem.get("type").toString() : "");
                                    spots.add(spot);
                                }
                                dayDTO.setSpots(spots);
                            }
                        }
                        
                        // 设置住宿
                        if (dayData.containsKey("accommodation")) {
                            dayDTO.setAccommodation(dayData.get("accommodation").toString());
                        }
                        
                        // 设置备注
                        if (dayData.containsKey("notes")) {
                            dayDTO.setNotes(dayData.get("notes").toString());
                        }
                        
                        planDays.add(dayDTO);
                    }
                    request.setPlan(planDays);
                }
            }
            
            // 调用服务保存行程
            Long planId = planService.savePlan(userId, request);
            
            System.out.println("行程保存成功，用户ID: " + userId + "，生成的planId: " + planId);
            
            // 返回成功响应，包含planId信息
            Result<Map<String, Long>> result = Result.success(Map.of("planId", planId));
            result.setMsg("行程保存成功");
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("保存行程失败: " + e.getMessage());
        }
    }

    // 获取用户所有行程
    @GetMapping("/list/{userId}")
    public Result<List<TravelPlan>> getPlansByUserId(@PathVariable Long userId) {
        List<TravelPlan> plans = planService.getPlansByUserId(userId);
        return Result.success(plans);
    }

    /**
     * 搜索用户行程
     */
    @GetMapping("/search")
    public Result<List<TravelPlan>> searchPlans(
            @RequestParam Long userId,
            @RequestParam(required = false) String planName,
            @RequestParam(required = false) String preferences,
            @RequestParam(required = false) Double budgetMin,
            @RequestParam(required = false) Double budgetMax) {

        List<TravelPlan> list = planService.searchPlans(userId, planName, preferences, budgetMin, budgetMax);
        return Result.success(list);
    }

    /**
     * 删除指定计划及关联的景点
     */
    @DeleteMapping("/delete/{planId}")
    public Result<String> deletePlan(@PathVariable Long planId) {
        try {
            planService.deletePlanWithSpots(planId);
            return Result.success("删除成功");
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("删除失败: " + e.getMessage());
        }
    }
}

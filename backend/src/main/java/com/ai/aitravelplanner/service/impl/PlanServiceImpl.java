package com.ai.aitravelplanner.service.impl;

import com.ai.aitravelplanner.dto.PlanRequestDTO;
import com.ai.aitravelplanner.dto.PlanResponse;
import com.ai.aitravelplanner.dto.SpotDTO;
import com.ai.aitravelplanner.entity.TravelPlan;
import com.ai.aitravelplanner.entity.TravelSpot;
import com.ai.aitravelplanner.mapper.TravelPlanMapper;
import com.ai.aitravelplanner.mapper.TravelSpotMapper;
import com.ai.aitravelplanner.service.PlanService;
import com.ai.aitravelplanner.service.TravelPlanAiService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class PlanServiceImpl implements PlanService {

    @Autowired
    private TravelPlanAiService travelPlanAiService;

    @Autowired
    private TravelPlanMapper planMapper;
    @Autowired
    private TravelSpotMapper spotMapper;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public PlanResponse generatePlan(Map<String, Object> payload) {
        return travelPlanAiService.generatePlan(payload);
    }

    @Override
    @Transactional
    public Long savePlan(Long userId, PlanRequestDTO dto) {
        try {
            System.out.println("开始保存行程，用户ID: " + userId);
            
            // 保存 plan 主表
            TravelPlan plan = new TravelPlan();
            plan.setUserId(userId);
            
            // 灵活处理字段映射，支持直接传入的JSON格式
            String title = dto.getPlanName();
            if (title == null || title.isEmpty()) {
                title = "未命名行程";
            }
            plan.setTitle(title);
            
            // 设置目的地和人数
            plan.setDestination(dto.getDestination());
            plan.setPeople(dto.getPeople() != null ? dto.getPeople() : 1);
            
            // 设置开始日期和结束日期 - 添加详细日志调试
            System.out.println("DTO中的startDate: " + dto.getStartDate());
            System.out.println("DTO中的endDate: " + dto.getEndDate());
            
            if (dto.getStartDate() != null) {
                plan.setStartDate(dto.getStartDate());
                System.out.println("设置plan.startDate: " + plan.getStartDate());
            } else {
                System.out.println("DTO中的startDate为null，未设置到plan对象");
            }
            
            if (dto.getEndDate() != null) {
                plan.setEndDate(dto.getEndDate());
                System.out.println("设置plan.endDate: " + plan.getEndDate());
            } else {
                System.out.println("DTO中的endDate为null，未设置到plan对象");
            }
            
            // 设置天数，如果为null则使用默认值
            plan.setDays(dto.getDays() != null ? dto.getDays() : 1);
            // 设置预算，从Double转换为BigDecimal
            if (dto.getBudget() != null) {
                plan.setBudget(BigDecimal.valueOf(dto.getBudget()));
            }
            plan.setPreferences(dto.getPreferences() != null ? 
                objectMapper.valueToTree(dto.getPreferences()).toString() : "[]");
            // 设置默认状态为1（有效/正常）
            plan.setStatus(1);
            plan.setCreatedAt(LocalDateTime.now());
            plan.setUpdatedAt(LocalDateTime.now());

            System.out.println("准备插入行程数据: " + plan);
            int insertResult = planMapper.insert(plan);
            System.out.println("行程插入结果: " + insertResult + ", 生成的planId: " + plan.getId());

            // 保存每一天的景点
            if (dto.getPlan() != null) {
                System.out.println("开始保存景点数据，共 " + dto.getPlan().size() + " 天的行程");
                dto.getPlan().forEach(dayPlan -> {
                    int order = 1;
                    for (SpotDTO spotDTO : dayPlan.getSpots()) {
                        TravelSpot spot = new TravelSpot();
                        spot.setPlanId(plan.getId());
                        spot.setDay(dayPlan.getDay());
                        spot.setName(spotDTO.getName());
                        spot.setLng(spotDTO.getLng());
                        spot.setLat(spotDTO.getLat());
                        spot.setType(spotDTO.getType());
                        spot.setDescription(spotDTO.getDescription());
                        spot.setOrderIndex(order++);
                        spot.setCreatedAt(LocalDateTime.now());
                        spot.setUpdatedAt(LocalDateTime.now());
                        spotMapper.insert(spot);
                        System.out.println("保存景点成功: " + spot.getName());
                    }
                });
                System.out.println("所有景点保存完成");
            }
            
            // 设置planData字段，存储完整的行程数据JSON
            try {
                String planDataJson = objectMapper.writeValueAsString(dto.getPlan());
                plan.setPlanData(planDataJson);
                // 更新plan_data字段
                planMapper.updatePlanData(plan.getId(), planDataJson);
                System.out.println("行程数据planData已保存");
            } catch (Exception e) {
                System.err.println("保存planData失败: " + e.getMessage());
                // 不中断主流程，只记录日志
            }
            
            return plan.getId(); // 返回生成的行程ID
        } catch (Exception e) {
            System.err.println("保存行程失败: " + e.getMessage());
            e.printStackTrace();
            throw e; // 重新抛出异常，确保事务回滚
        }
    }

    @Override
    public List<TravelPlan> getPlansByUserId(Long userId) {
        return planMapper.selectByUserId(userId);
    }

    @Override
    public List<TravelPlan> searchPlans(Long userId, String planName, String preferences, Double budgetMin, Double budgetMax) {
        return planMapper.searchPlans(userId, planName, preferences, budgetMin, budgetMax);
    }

    @Override
    public void deletePlanWithSpots(Long planId) {
        // 1. 删除关联的景点
        spotMapper.deleteByPlanId(planId);

        // 2. 删除行程
        planMapper.deleteById(planId);
    }
}

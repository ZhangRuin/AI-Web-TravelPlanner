package com.ai.aitravelplanner.service;

import com.ai.aitravelplanner.entity.TravelSpot;

import java.util.List;

public interface SpotService {
    /**
     * 根据计划ID获取景点
     * @param planId 计划ID
     * @return 景点列表
     */
    List<TravelSpot> getSpotsByPlanId(Long planId);
}

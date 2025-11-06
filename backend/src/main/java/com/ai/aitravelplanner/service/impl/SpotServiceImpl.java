package com.ai.aitravelplanner.service.impl;

import com.ai.aitravelplanner.entity.TravelSpot;
import com.ai.aitravelplanner.mapper.TravelSpotMapper;
import com.ai.aitravelplanner.service.SpotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SpotServiceImpl implements SpotService {

    @Autowired
    private TravelSpotMapper spotMapper;
    @Override
    public List<TravelSpot> getSpotsByPlanId(Long planId) {
        return spotMapper.selectByPlanId(planId);
    }
}

package com.ai.aitravelplanner.controller;

import com.ai.aitravelplanner.entity.TravelSpot;
import com.ai.aitravelplanner.result.Result;
import com.ai.aitravelplanner.service.SpotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/spot")
@CrossOrigin
public class WebSpotController {

    @Autowired
    private SpotService spotService;

    @GetMapping("/list/{planId}")
    public Result<List<TravelSpot>> listByPlanId(@PathVariable Long planId) {
        List<TravelSpot> spots = spotService.getSpotsByPlanId(planId);
        return Result.success(spots);
    }
}
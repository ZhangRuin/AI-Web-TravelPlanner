package com.ai.aitravelplanner.mapper;

import com.ai.aitravelplanner.entity.TravelPlan;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface TravelPlanMapper {

    @Insert("INSERT INTO plan (user_id, title, days, budget, preferences, created_at, updated_at) " +
            "VALUES (#{userId}, #{title}, #{days}, #{budget}, #{preferences}, #{createdAt}, #{updatedAt})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(TravelPlan plan);

    @Select("SELECT id, user_id, title, days, budget, preferences, created_at " +
            "FROM plan WHERE user_id = #{userId} ORDER BY created_at DESC" )
    List<TravelPlan> selectByUserId(Long userId);


    List<TravelPlan> searchPlans(
            @Param("userId") Long userId,
            @Param("planName") String planName,
            @Param("preferences") String preferences,
            @Param("budgetMin") Double budgetMin,
            @Param("budgetMax") Double budgetMax
    );

    @Delete("DELETE FROM plan WHERE id = #{planId}")
    void deleteById(Long planId);
}
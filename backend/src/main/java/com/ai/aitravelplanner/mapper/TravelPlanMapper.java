package com.ai.aitravelplanner.mapper;

import com.ai.aitravelplanner.entity.TravelPlan;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

@Mapper
public interface TravelPlanMapper {

    @Insert("INSERT INTO plan (user_id, title, destination, people, start_date, end_date, days, budget, preferences, plan_data, status, created_at, updated_at) " +
            "VALUES (#{userId}, #{title}, #{destination}, #{people}, #{startDate}, #{endDate}, #{days}, #{budget}, #{preferences}, #{planData}, #{status}, #{createdAt}, #{updatedAt})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(TravelPlan plan);

    @Select("SELECT id, user_id, title, destination, people, start_date, end_date, days, budget, preferences, plan_data, status, created_at, updated_at " +
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
    
    @Update("UPDATE plan SET plan_data = #{planData} WHERE id = #{planId}")
    void updatePlanData(@Param("planId") Long planId, @Param("planData") String planData);
}
package com.ai.aitravelplanner.mapper;

import com.ai.aitravelplanner.entity.TravelSpot;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface TravelSpotMapper {
    @Insert("INSERT INTO spot (plan_id, day, name, lng, lat, type, description, order_index, created_at, updated_at) " +
            "VALUES (#{planId}, #{day}, #{name}, #{lng}, #{lat}, #{type}, #{description}, #{orderIndex}, #{createdAt}, #{updatedAt}) ")
    void insert(TravelSpot spot);
    
    @Insert("<script>INSERT INTO spot (plan_id, day, name, lng, lat, type, description, order_index, created_at, updated_at) VALUES" +
            "<foreach collection=\"spots\" item=\"spot\" separator=\",\">" +
            "(#{spot.planId}, #{spot.day}, #{spot.name}, #{spot.lng}, #{spot.lat}, #{spot.type}, #{spot.description}, #{spot.orderIndex}, #{spot.createdAt}, #{spot.updatedAt})" +
            "</foreach></script>")
    void insertBatch(List<TravelSpot> spots);
    
    @Select("SELECT * FROM spot WHERE plan_id = #{planId} AND day = #{day} ORDER BY order_index")
    List<TravelSpot> selectByPlanIdAndDay(Long planId, Integer day);

    @Select("SELECT * FROM spot WHERE plan_id = #{planId} ORDER BY day")
    List<TravelSpot> selectByPlanId(Long planId);

    @Delete("DELETE FROM spot WHERE plan_id = #{planId}")
    void deleteByPlanId(Long planId);
}
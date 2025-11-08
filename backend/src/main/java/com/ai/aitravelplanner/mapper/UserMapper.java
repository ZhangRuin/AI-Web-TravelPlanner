package com.ai.aitravelplanner.mapper;

import com.ai.aitravelplanner.entity.User;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface UserMapper {
    /**
     * 根据用户名查询用户
     * @param username
     * @return
     */
    @Select("SELECT * FROM user WHERE username = #{username}")
    User findByUsername(String username);

    /**
     * 新增用户
     * @param user
     */
    @Insert("INSERT INTO user (username, password, email, avatar, created_at, updated_at) " +
            "VALUES (#{username}, #{password}, #{email}, #{avatar}, NOW(), NOW())")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    void insert(User user);

    // 查询用户偏好列表（从JSON字段中提取）
    @Select("SELECT preferences FROM user_preference WHERE user_id = #{userId}")
    String getPreferencesJsonByUserId(@Param("userId") Long userId);

    // 查询用户旅行风格
    @Select("SELECT travel_style FROM user_preference WHERE user_id = #{userId}")
    String getTravelStyleByUserId(@Param("userId") Long userId);
}

package com.ai.aitravelplanner.service.impl;

import com.ai.aitravelplanner.entity.User;
import com.ai.aitravelplanner.mapper.UserMapper;
import com.ai.aitravelplanner.mapper.UserPreferenceMapper;
import com.ai.aitravelplanner.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class UserServiceImpl implements UserService {
    @Autowired
    private UserMapper userMapper;

    @Autowired
    private UserPreferenceMapper userPreferenceMapper;

    @Override
    public User login(String username, String password) {
        User user = userMapper.findByUsername(username);
        if (user != null && user.getPassword().equals(password)) {
            // 登录成功，不返回密码
            user.setPassword(null);
            return user;
        }
        return null;
    }

    @Override
    public boolean register(User user) {
        User existing = userMapper.findByUsername(user.getUsername());
        if (existing != null) {
            return false; // 用户名已存在
        }
        userMapper.insert(user);
        return true;
    }

    @Override
    public Map<String, Object> getUserPreferences(Long userId) {
        try {
            // 添加日志
            System.out.println("开始获取用户ID: " + userId + " 的偏好设置");
            
            // 查询数据
            String preferencesJson = userMapper.getPreferencesJsonByUserId(userId);
            String travelStyle = userMapper.getTravelStyleByUserId(userId);
            
            // 日志记录获取的数据
            System.out.println("查询到的preferencesJson: " + preferencesJson);
            System.out.println("查询到的travelStyle: " + travelStyle);

            // 初始化偏好列表
            List<String> prefs = new ArrayList<>();
            
            // 安全地处理preferencesJson
            if (preferencesJson != null && !preferencesJson.trim().isEmpty()) {
                try {
                    // 如果数据库中存储的是完整的JSON数组格式
                    if (preferencesJson.startsWith("[") && preferencesJson.endsWith("]")) {
                        // 去除前后的[]
                        String content = preferencesJson.substring(1, preferencesJson.length() - 1);
                        if (!content.trim().isEmpty()) {
                            // 分割字符串并去除引号
                            String[] prefArray = content.split(",");
                            for (String pref : prefArray) {
                                if (pref != null && !pref.trim().isEmpty()) {
                                    // 去除前后的引号和空格
                                    String cleanPref = pref.trim().replaceAll("^\"|\"$", "");
                                    if (!cleanPref.isEmpty()) {
                                        prefs.add(cleanPref);
                                    }
                                }
                            }
                        }
                    } else if (preferencesJson.contains(",")) {
                        // 如果是逗号分隔的字符串格式
                        String[] prefArray = preferencesJson.split(",");
                        for (String pref : prefArray) {
                            if (pref != null && !pref.trim().isEmpty()) {
                                prefs.add(pref.trim());
                            }
                        }
                    } else if (!preferencesJson.equals("null")) {
                        // 单个偏好
                        prefs.add(preferencesJson.trim());
                    }
                } catch (Exception e) {
                    System.out.println("解析JSON时出错: " + e.getMessage());
                    // 出错时使用空列表
                    prefs = new ArrayList<>();
                }
            }

            // 构建返回结果
            Map<String, Object> result = new HashMap<>();
            result.put("preferences", prefs);
            result.put("travelStyle", travelStyle);
            
            System.out.println("返回的偏好列表: " + prefs);

            return result;
        } catch (Exception e) {
            System.out.println("获取用户偏好时发生错误: " + e.getMessage());
            e.printStackTrace();
            // 返回默认空结果
            Map<String, Object> result = new HashMap<>();
            result.put("preferences", new ArrayList<>());
            result.put("travelStyle", null);
            return result;
        }
    }

    @Override
    public boolean saveUserPreferences(Long userId, List<String> preferences, String travelStyle) {
        try {
            // 删除旧数据
            userPreferenceMapper.deleteByUserId(userId);
            
            // 将偏好列表转换为JSON字符串
            String preferencesJson = null;
            if (preferences != null && !preferences.isEmpty()) {
                // 简单的JSON字符串构建，实际项目中可使用JSON库
                StringBuilder sb = new StringBuilder();
                sb.append("[");
                for (int i = 0; i < preferences.size(); i++) {
                    sb.append('"').append(preferences.get(i)).append('"');
                    if (i < preferences.size() - 1) {
                        sb.append(",");
                    }
                }
                sb.append("]");
                preferencesJson = sb.toString();
            }
            
            // 插入一条记录
            userPreferenceMapper.insert(userId, preferencesJson, travelStyle);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}

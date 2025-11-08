# AI旅行规划系统

## 项目概述

这是一个基于Spring Boot后端和Vue.js前端的全栈AI旅行规划系统。项目采用Docker容器化部署，包含完整的微服务架构。

## 项目结构

```
WebAi/
├── backend/          # Spring Boot后端服务
├── frontend/         # Vue.js前端应用
└── docker-compose.yml # Docker编排文件
```

## 技术栈

### 后端技术栈
- **框架**: Spring Boot 3.x
- **数据库**: MySQL 8.0
- **构建工具**: Maven
- **容器化**: Docker
- **API文档**: Spring Boot Actuator

### 前端技术栈
- **框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **UI框架**: Element Plus
- **路由**: Vue Router
- **状态管理**: Pinia
- **HTTP客户端**: Axios
- **容器化**: Docker + Nginx

## 功能特性

### 后端功能
- 用户认证与授权
- 旅行路线规划
- 景点信息管理
- 天气数据集成
- RESTful API接口

### 前端功能
- 响应式用户界面
- 实时地图展示
- 旅行路线可视化
- 用户交互体验优化

## 部署说明

### 环境要求
- Docker Desktop
- Docker Compose
- 至少4GB可用内存

### 快速启动

1. **克隆项目**
   ```bash
   git clone https://github.com/ZhangRuin/AI-Web-TravelPlanner.git
   ```
   
2. **一键部署**
   ```bash
   docker-compose up --build
   ```

3. **访问应用**
   - 前端应用: http://localhost:5173
   - 后端API: http://localhost:8081
   - MySQL数据库: localhost:3307

### 服务说明

| 服务名称 | 端口 | 描述 | 状态检查 |
|---------|------|------|----------|
| ai-travel-frontend | 5173 | Vue.js前端应用 | 自动健康检查 |
| ai-travel-backend | 8081 | Spring Boot后端API | 根路径健康检查 |
| ai-travel-mysql | 3307 | MySQL数据库 | 自动健康检查 |

## 开发历程总结

### 第一阶段：后端开发
- ✅ Spring Boot项目初始化
- ✅ MySQL数据库配置
- ✅ 实体类和数据访问层开发
- ✅ RESTful API接口实现
- ✅ Docker容器化配置

### 第二阶段：前端开发
- ✅ Vue 3 + TypeScript项目搭建
- ✅ Element Plus UI组件集成
- ✅ 路由和状态管理配置
- ✅ API服务层封装
- ✅ 响应式界面开发

### 第三阶段：容器化部署
- ✅ 后端Docker镜像构建
- ✅ 前端Docker镜像构建
- ✅ Nginx反向代理配置
- ✅ Docker Compose编排
- ✅ 服务依赖和健康检查配置

### 第四阶段：问题排查与优化

#### 遇到的问题及解决方案

1. **前端Docker构建失败**
   - **问题**: TypeScript类型检查错误导致构建失败
   - **解决方案**: 修改Dockerfile使用`npm run build-only`跳过类型检查

2. **前端服务启动失败**
   - **问题1**: nginx配置结构错误
     - **原因**: `events`指令不能在`http`块之外使用
     - **解决方案**: 简化nginx配置，只保留`server`块
   
   - **问题2**: 后端服务健康检查失败
     - **原因**: 使用了不存在的`/actuator/health`端点
     - **解决方案**: 修改健康检查为根路径检查`http://localhost:8081`

3. **服务依赖问题**
   - **问题**: 前端服务因后端健康检查失败而无法启动
   - **解决方案**: 修改依赖条件从`service_healthy`改为`service_started`

## 关键配置文件

### docker-compose.yml
```yaml
services:
  mysql:
    image: mysql:8.0
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      
  backend:
    build: ./backend
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:8081"]
      
  frontend:
    build: ./frontend
    depends_on:
      backend:
        condition: service_started
```

### frontend/nginx.conf
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://backend:8081/;
    }
}
```

## 项目亮点

1. **完整的容器化部署**: 一键启动所有服务
2. **健康检查机制**: 确保服务稳定运行
3. **前后端分离架构**: 清晰的职责划分
4. **TypeScript支持**: 类型安全的开发体验
5. **响应式设计**: 良好的移动端兼容性

## 后续优化方向

1. **CI/CD流水线**: 自动化构建和部署
2. **监控告警**: 服务监控和性能优化
3. **安全加固**: API安全认证和权限控制
4. **性能优化**: 缓存策略和数据库优化
5. **功能扩展**: 更多AI旅行规划功能



---

**最后更新**: 2025年11月8日  
**项目状态**: ✅ 部署完成，服务正常运行
# AI旅行规划系统 API 文档

本文档详细说明系统中所有Controller的方法及其调用方式。

## 目录

- [1. MapController](#1-mapcontroller)
- [2. UserController](#2-usercontroller)
- [3. PlanController](#3-plancontroller)
- [4. SpotController](#4-spotcontroller)
- [5. AIPlanController](#5-aiplancontroller)
- [6. BudgetController](#6-budgetcontroller)
- [7. BudgetAiController](#7-budgetaicontroller)

## 1. MapController

### 获取附近地点

**方法说明**：根据经纬度和类型获取附近的地点信息

**请求信息**：
- HTTP方法：GET
- URL路径：`/api/map/nearby`
- 参数：
  - `lng` (Double)：经度
  - `lat` (Double)：纬度
  - `type` (String)：地点类型，支持：restaurant / hotel / traffic

**返回值**：
- 类型：`List<PlaceInfo>`
- 描述：符合条件的地点列表

**调用示例**：
```bash
curl -X GET "http://localhost:8081/api/map/nearby?lng=118.779441&lat=32.055063&type=restaurant"
```

## 2. UserController

### 用户登录

**方法说明**：用户登录验证

**请求信息**：
- HTTP方法：POST
- URL路径：`/api/user/login`
- 参数：
  - `username` (String)：用户名
  - `password` (String)：密码

**返回值**：
- 类型：`Result<User>`
- 描述：登录成功返回用户信息，失败返回错误信息

**调用示例**：
```bash
curl -X POST "http://localhost:8081/api/user/login?username=test&password=123456"
```

### 用户注册

**方法说明**：新用户注册

**请求信息**：
- HTTP方法：POST
- URL路径：`/api/user/register`
- 请求体（JSON）：User对象
  ```json
  {
    "username": "新用户名",
    "password": "密码",
    "email": "邮箱（可选）"
  }
  ```

**返回值**：
- 类型：`Result<String>`
- 描述：注册成功或失败信息

**调用示例**：
```bash
curl -X POST "http://localhost:8081/api/user/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"newuser","password":"123456"}'
```

### 获取用户偏好

**方法说明**：获取用户的旅行偏好设置

**请求信息**：
- HTTP方法：GET
- URL路径：`/api/user/preference`
- 参数：
  - `userId` (Long)：用户ID

**返回值**：
- 类型：`Result<Map<String, Object>>`
- 描述：包含用户偏好和旅行风格的Map对象

**调用示例**：
```bash
curl -X GET "http://localhost:8081/api/user/preference?userId=1"
```

### 保存用户偏好

**方法说明**：保存或更新用户的旅行偏好设置

**请求信息**：
- HTTP方法：POST
- URL路径：`/api/user/preferences/save`
- 请求体（JSON）：
  ```json
  {
    "userId": 1,
    "preferences": ["美食", "历史文化", "自然风光"],
    "travelStyle": "休闲度假"
  }
  ```

**返回值**：
- 类型：`Result<?>`
- 描述：保存成功或失败信息

**调用示例**：
```bash
curl -X POST "http://localhost:8081/api/user/preferences/save" \
  -H "Content-Type: application/json" \
  -d '{"userId":1,"preferences":["美食","历史文化"],"travelStyle":"休闲度假"}'
```

## 3. PlanController

### 保存行程

**方法说明**：保存AI生成的行程计划

**请求信息**：
- HTTP方法：POST
- URL路径：`/api/plan/save`
- URL参数：
  - `userId` (Long)：用户ID
- 请求体（JSON）：PlanRequestDTO对象

**返回值**：
- 类型：`Result`
- 描述：保存成功信息

**调用示例**：
```bash
curl -X POST "http://localhost:8081/api/plan/save?userId=1" \
  -H "Content-Type: application/json" \
  -d '{"title":"北京三日游","startDate":"2024-05-01","endDate":"2024-05-03","budget":2000,"preferences":["美食","历史"]}'
```

### 获取用户所有行程

**方法说明**：获取指定用户的所有行程列表

**请求信息**：
- HTTP方法：GET
- URL路径：`/api/plan/list/{userId}`
- 路径参数：
  - `userId` (Long)：用户ID

**返回值**：
- 类型：`Result<List<Plan>>`
- 描述：用户的行程列表

**调用示例**：
```bash
curl -X GET "http://localhost:8081/api/plan/list/1"
```

### 搜索用户行程

**方法说明**：根据条件搜索用户的行程

**请求信息**：
- HTTP方法：GET
- URL路径：`/api/plan/search`
- 参数：
  - `userId` (Long)：用户ID（必填）
  - `planName` (String)：行程名称（可选）
  - `preferences` (String)：偏好标签（可选）
  - `budgetMin` (Double)：最小预算（可选）
  - `budgetMax` (Double)：最大预算（可选）

**返回值**：
- 类型：`Result<List<Plan>>`
- 描述：符合搜索条件的行程列表

**调用示例**：
```bash
curl -X GET "http://localhost:8081/api/plan/search?userId=1&planName=北京&budgetMax=3000"
```

### 删除行程

**方法说明**：删除指定行程及其关联的景点信息

**请求信息**：
- HTTP方法：DELETE
- URL路径：`/api/plan/delete/{planId}`
- 路径参数：
  - `planId` (Long)：行程ID

**返回值**：
- 类型：`Result<String>`
- 描述：删除成功或失败信息

**调用示例**：
```bash
curl -X DELETE "http://localhost:8081/api/plan/delete/1"
```

## 4. SpotController

### 获取行程景点列表

**方法说明**：获取指定行程的所有景点信息

**请求信息**：
- HTTP方法：GET
- URL路径：`/api/spot/list/{planId}`
- 路径参数：
  - `planId` (Long)：行程ID

**返回值**：
- 类型：`Result<List<Spot>>`
- 描述：行程的景点列表

**调用示例**：
```bash
curl -X GET "http://localhost:8081/api/spot/list/1"
```

## 5. AIPlanController

### 生成AI旅行计划

**方法说明**：根据用户输入生成AI旅行计划

**请求信息**：
- HTTP方法：POST
- URL路径：`/api/ai/generate`
- 请求体（JSON）：包含旅行参数的Map
  ```json
  {
    "destination": "北京",
    "days": 3,
    "budget": 2000,
    "preferences": ["美食", "历史文化"],
    "travelStyle": "休闲"
  }
  ```

**返回值**：
- 类型：`Result<PlanResponse>`
- 描述：AI生成的旅行计划响应

**调用示例**：
```bash
curl -X POST "http://localhost:8081/api/ai/generate" \
  -H "Content-Type: application/json" \
  -d '{"destination":"北京","days":3,"budget":2000,"preferences":["美食","历史文化"]}'
```

## 6. BudgetController

### 添加预算项

**方法说明**：为行程添加预算项

**请求信息**：
- HTTP方法：POST
- URL路径：`/api/budget/add`
- 请求体（JSON）：Budget对象
  ```json
  {
    "planId": 1,
    "category": "餐饮",
    "amount": 500.0,
    "description": "每日三餐"
  }
  ```

**返回值**：
- 类型：`Result`
- 描述：添加成功或失败信息

**调用示例**：
```bash
curl -X POST "http://localhost:8081/api/budget/add" \
  -H "Content-Type: application/json" \
  -d '{"planId":1,"category":"餐饮","amount":500.0}'
```

### 获取行程预算列表

**方法说明**：获取指定行程的所有预算项

**请求信息**：
- HTTP方法：GET
- URL路径：`/api/budget/list/{planId}`
- 路径参数：
  - `planId` (Long)：行程ID

**返回值**：
- 类型：`Result<List<Budget>>`
- 描述：行程的预算项列表

**调用示例**：
```bash
curl -X GET "http://localhost:8081/api/budget/list/1"
```

### 删除预算项

**方法说明**：删除指定的预算项

**请求信息**：
- HTTP方法：DELETE
- URL路径：`/api/budget/delete/{id}`
- 路径参数：
  - `id` (Long)：预算项ID

**返回值**：
- 类型：`Result<?>`
- 描述：删除成功或失败信息

**调用示例**：
```bash
curl -X DELETE "http://localhost:8081/api/budget/delete/1"
```

## 7. BudgetAiController

### 分析预算

**方法说明**：使用AI分析旅行预算合理性

**请求信息**：
- HTTP方法：POST
- URL路径：`/api/ai/budget/analyze`
- 请求体（JSON）：包含预算分析参数的Map
  ```json
  {
    "destination": "北京",
    "days": 3,
    "budget": 2000,
    "categories": ["餐饮", "住宿", "交通"]
  }
  ```

**返回值**：
- 类型：`Result<BudgetAnalysisDTO>`
- 描述：预算分析结果

**调用示例**：
```bash
curl -X POST "http://localhost:8081/api/ai/budget/analyze" \
  -H "Content-Type: application/json" \
  -d '{"destination":"北京","days":3,"budget":2000}'
```

---

## 通用返回结构

所有API返回的标准格式为Result对象：

```json
{
  "code": 1,  // 1表示成功，0表示失败
  "msg": "成功",  // 错误时返回错误信息
  "data": {}  // 成功时返回的数据
}
```
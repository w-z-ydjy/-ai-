# 智慧党建平台 - 增强版部署指南

## 概述

本增强版在原静态前端基础上，增加了以下功能：
1. **用户认证系统** - 基于数据库的真实用户登录/注册
2. **动态题库管理** - 从MySQL数据库动态获取题目
3. **答题记录系统** - 记录用户答题历史和成绩
4. **排行榜功能** - 显示用户答题排名
5. **收藏功能** - 用户可以收藏题目

## 系统架构

```
前端页面 (HTML/CSS/JS)
    ↓ (API调用)
Node.js API服务器 (Express)
    ↓ (数据库操作)
MySQL数据库 (party_question_bank)
```

## 部署步骤

### 第一步：环境准备

1. **安装Node.js** (版本14.0.0或以上)
   - 下载地址: https://nodejs.org/

2. **安装MySQL** (版本5.7或以上)
   - 下载地址: https://dev.mysql.com/downloads/mysql/
   - 启动MySQL服务，记住root密码

### 第二步：数据库设置

1. **导入基础题库**
   ```bash
   cd "C:\Users\15391\Downloads\智慧党建平台\智慧党建平台"
   mysql -u root -p < party_question_bank.sql
   ```

2. **导入增强版表结构**
   ```bash
   mysql -u root -p < party_question_bank_extended.sql
   ```

3. **验证数据库**
   ```sql
   USE party_question_bank;
   SHOW TABLES;
   SELECT COUNT(*) FROM questions;
   SELECT COUNT(*) FROM users;
   ```

### 第三步：后端API服务部署

1. **进入API目录**
   ```bash
   cd "C:\Users\15391\Downloads\智慧党建平台\智慧党建平台\quiz-api"
   ```

2. **安装依赖** (两种选择)

   **选项A: 使用增强版依赖（推荐）**
   ```bash
   # 复制增强版package.json
   copy package-enhanced.json package.json
   npm install
   ```

   **选项B: 使用原依赖（功能有限）**
   ```bash
   npm install
   ```

3. **配置数据库连接**
   编辑 `server-enhanced.js`，修改 `DB_CONFIG`：
   ```javascript
   const DB_CONFIG = {
     host: 'localhost',
     user: 'root',
     password: 'your_mysql_password',  // 修改为你的MySQL密码
     database: 'party_question_bank',
     waitForConnections: true,
     connectionLimit: 10,
     queueLimit: 0
   };
   ```

4. **启动API服务**
   ```bash
   # 使用增强版服务
   node server-enhanced.js
   
   # 或使用nodemon（开发模式）
   npm run dev
   ```

5. **验证API服务**
   - 访问 http://localhost:3000 查看API文档
   - 访问 http://localhost:3000/api/health 检查健康状态
   - 访问 http://localhost:3000/api/questions 查看题目列表

### 第四步：前端部署

1. **替换公共JavaScript文件**
   ```bash
   cd "C:\Users\15391\Downloads\智慧党建平台\智慧党建平台\pages"
   copy common-enhanced.js common.js
   ```

2. **更新登录页面**
   ```bash
   copy login-enhanced.html login.html
   ```

3. **更新答题页面**
   ```bash
   
   ```

4. **配置API地址**
   如果需要修改API地址，编辑 `common-enhanced.js`：
   ```javascript
   const API_CONFIG = {
     baseUrl: 'http://localhost:3000/api',  // 根据实际修改
     // ...
   };
   ```

### 第五步：系统测试

1. **测试用户登录**
   - 访问 http://localhost/pages/login.html （或直接打开login.html）
   - 使用默认账号登录：
     - 管理员: admin / 123456
     - 普通用户: user / 123456
   - 测试新用户注册功能

2. **测试在线答题**
   - 访问 http://localhost/pages/quiz.html
   - 验证题目是否从数据库加载
   - 完成答题并查看结果
   - 测试答题记录保存功能

3. **测试其他功能**
   - 个人中心 (profile.html)
   - 学习中心 (study.html)
   - 后台管理 (admin.html) - 需要管理员账号

## 默认账号

| 用户名 | 密码 | 角色 | 姓名 | 说明 |
|--------|------|------|------|------|
| admin | 123456 | admin | 张明远 | 系统管理员 |
| user | 123456 | user | 李小明 | 普通用户 |
| test1 | 123456 | user | 王小红 | 测试用户 |
| test2 | 123456 | user | 赵建国 | 测试用户 |

## API接口说明

### 用户认证
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `GET /api/auth/me` - 获取当前用户信息

### 题目管理
- `GET /api/questions` - 获取所有题目
- `GET /api/questions/:id` - 获取单题
- `GET /api/questions/type/:type` - 按题型获取
- `POST /api/questions` - 添加题目（管理员）
- `PUT /api/questions/:id` - 更新题目（管理员）
- `DELETE /api/questions/:id` - 删除题目（管理员）

### 答题记录
- `POST /api/quiz/records` - 提交答题记录
- `GET /api/quiz/records` - 获取用户答题记录
- `GET /api/quiz/leaderboard` - 获取排行榜

### 收藏功能
- `POST /api/favorites` - 添加收藏
- `DELETE /api/favorites/:id` - 删除收藏
- `GET /api/favorites` - 获取收藏列表

## 数据库表结构

### 1. questions (题目表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 题目ID |
| type | ENUM | 题型：单选/多选/判断 |
| title | VARCHAR | 题干 |
| option_a~d | VARCHAR | 选项 |
| answer | VARCHAR | 正确答案 |
| score | TINYINT | 分值 |
| category | VARCHAR | 分类 |

### 2. users (用户表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 用户ID |
| username | VARCHAR | 用户名 |
| password | VARCHAR | 密码（加密） |
| name | VARCHAR | 真实姓名 |
| role | ENUM | 角色：admin/user/guest |
| email | VARCHAR | 邮箱 |
| phone | VARCHAR | 手机 |
| last_login | DATETIME | 最后登录时间 |
| created_at | TIMESTAMP | 创建时间 |

### 3. quiz_records (答题记录表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 记录ID |
| user_id | INT | 用户ID |
| total_questions | INT | 总题数 |
| correct_answers | INT | 答对题数 |
| score | INT | 得分 |
| time_spent | INT | 耗时（秒） |
| quiz_data | JSON | 答题详情 |
| start_time | DATETIME | 开始时间 |
| end_time | DATETIME | 结束时间 |

### 4. user_favorites (用户收藏表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 收藏ID |
| user_id | INT | 用户ID |
| question_id | INT | 题目ID |
| created_at | TIMESTAMP | 收藏时间 |

## 故障排除

### 1. 数据库连接失败
```
❌ MySQL数据库连接失败: Access denied for user 'root'@'localhost'
```
**解决方案：**
- 检查MySQL服务是否启动
- 确认DB_CONFIG中的用户名和密码
- 确保数据库`party_question_bank`存在

### 2. API服务无法启动
```
❌ 无法启动服务：数据库连接失败
```
**解决方案：**
- 检查Node.js和npm版本
- 运行 `npm install` 重新安装依赖
- 检查端口3000是否被占用

### 3. 前端无法加载题目
```
获取题目失败: NetworkError when attempting to fetch resource
```
**解决方案：**
- 检查API服务是否运行
- 确认common.js中的API地址正确
- 检查浏览器控制台是否有CORS错误

### 4. 用户登录失败
```
用户名或密码错误
```
**解决方案：**
- 确认用户存在于数据库
- 检查密码是否正确（默认密码：123456）
- 查看数据库users表中的数据

## 安全建议

1. **生产环境配置**
   - 修改默认管理员密码
   - 使用HTTPS加密通信
   - 设置数据库访问权限
   - 定期备份数据库

2. **密码安全**
   - 建议使用bcryptjs替代SHA256
   - 密码长度至少8位
   - 启用密码复杂度检查

3. **API安全**
   - 限制API调用频率
   - 验证用户输入
   - 使用JWT令牌过期机制

## 扩展开发

### 添加新功能
1. **邮件验证** - 注册时发送验证邮件
2. **密码重置** - 忘记密码找回功能
3. **题目分类** - 支持多级分类系统
4. **学习计划** - 制定个性化学习计划
5. **考试模式** - 限时考试功能

### 修改前端样式
- 编辑 `pages/styles.css` 文件
- 使用浏览器开发者工具调试
- 保持响应式设计

### 添加新API接口
1. 在 `server-enhanced.js` 中添加路由
2. 实现对应的数据库操作
3. 在前端添加对应的API调用函数

## 技术支持

如遇到问题，请检查：
1. 控制台错误信息
2. 服务器日志输出
3. 数据库连接状态
4. 网络连接情况

如需进一步帮助，请提供：
- 错误日志
- 系统环境信息
- 重现步骤

---
**增强版开发完成时间：2026-04-15**
**技术支持：人工智能协会党建平台开发团队**
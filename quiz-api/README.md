# 党建平台题库 API 服务

## 快速开始

### 1. 安装依赖
```bash
cd quiz-api
npm install
```

### 2. 配置数据库连接
编辑 `server.js`，修改 `DB_CONFIG` 中的 MySQL 连接信息：
```javascript
const DB_CONFIG = {
  host: 'localhost',
  user: 'root',
  password: 'your_password',  // 修改为你的MySQL密码
  database: 'party_question_bank'
};
```

### 3. 导入题库数据库
先在 MySQL 中执行 `party_question_bank.sql` 创建数据库和表：
```bash
mysql -u root -p < ../party_question_bank.sql
```

### 4. 启动服务
```bash
npm start
# 或开发模式（支持热重载）
npm run dev
```

服务启动后访问：`http://localhost:3000`

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/questions` | 获取所有题目 |
| GET | `/api/questions/:id` | 获取单题 |
| GET | `/api/questions/type/:type` | 按题型获取（单选/多选/判断） |
| POST | `/api/questions` | 添加题目 |
| PUT | `/api/questions/:id` | 更新题目 |
| DELETE | `/api/questions/:id` | 删除题目 |
| POST | `/api/questions/batch` | 批量添加 |
| GET | `/api/statistics` | 获取统计 |

## 前端配置

编辑 `zhihui-party-complete.html` 中的 `QUIZ_DB_CONFIG`：
```javascript
const QUIZ_DB_CONFIG = {
  enabled: true,                             // 启用MySQL题库
  apiUrl: 'http://localhost:3000/api'       // API地址
};
```

## 注意事项

- 确保 MySQL 服务已启动
- 如果前端和 API 不在同一端口，需要处理跨域（已配置 cors）
- API 默认使用 3000 端口，如需修改请改 `server.js` 中的 `PORT`

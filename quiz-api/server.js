/**
 * 人工智能协会党建平台 - 题库API服务
 * 连接MySQL数据库 party_question_bank
 */

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const PORT = 3000;

// 中间件
app.use(cors());
app.use(express.json());

// ============================================================
// MySQL 数据库配置
// 请根据实际MySQL服务器信息修改以下配置
// ============================================================
const DB_CONFIG = {
  host: 'localhost',
  user: 'root',
  password: 'your_password',        // 修改为你的MySQL密码
  database: 'party_question_bank',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool;

// 初始化数据库连接池
async function initDB() {
  try {
    pool = mysql.createPool(DB_CONFIG);
    // 测试连接
    const connection = await pool.getConnection();
    console.log('✅ MySQL数据库连接成功');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ MySQL数据库连接失败:', error.message);
    return false;
  }
}

// ============================================================
// API 路由
// ============================================================

// 获取所有题目
app.get('/api/questions', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM questions ORDER BY id');
    res.json({
      success: true,
      data: rows,
      total: rows.length
    });
  } catch (error) {
    console.error('获取题目失败:', error);
    res.status(500).json({
      success: false,
      message: '获取题目失败',
      error: error.message
    });
  }
});

// 按题型获取题目
app.get('/api/questions/type/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const [rows] = await pool.query(
      'SELECT * FROM questions WHERE type = ? ORDER BY id',
      [type]
    );
    res.json({
      success: true,
      data: rows,
      total: rows.length,
      type: type
    });
  } catch (error) {
    console.error('获取题目失败:', error);
    res.status(500).json({
      success: false,
      message: '获取题目失败',
      error: error.message
    });
  }
});

// 获取单题
app.get('/api/questions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      'SELECT * FROM questions WHERE id = ?',
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '题目不存在'
      });
    }
    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('获取题目失败:', error);
    res.status(500).json({
      success: false,
      message: '获取题目失败',
      error: error.message
    });
  }
});

// 添加题目
app.post('/api/questions', async (req, res) => {
  try {
    const { type, title, option_a, option_b, option_c, option_d, answer, score, category } = req.body;
    
    // 验证必填字段
    if (!type || !title || !answer) {
      return res.status(400).json({
        success: false,
        message: '缺少必填字段'
      });
    }
    
    const [result] = await pool.query(
      `INSERT INTO questions (type, title, option_a, option_b, option_c, option_d, answer, score, category) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [type, title, option_a || null, option_b || null, option_c || null, option_d || null, answer, score || 2, category || '党建知识']
    );
    
    res.json({
      success: true,
      message: '题目添加成功',
      insertId: result.insertId
    });
  } catch (error) {
    console.error('添加题目失败:', error);
    res.status(500).json({
      success: false,
      message: '添加题目失败',
      error: error.message
    });
  }
});

// 更新题目
app.put('/api/questions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { type, title, option_a, option_b, option_c, option_d, answer, score, category } = req.body;
    
    const [result] = await pool.query(
      `UPDATE questions SET 
       type = COALESCE(?, type),
       title = COALESCE(?, title),
       option_a = ?,
       option_b = ?,
       option_c = ?,
       option_d = ?,
       answer = COALESCE(?, answer),
       score = COALESCE(?, score),
       category = COALESCE(?, category)
       WHERE id = ?`,
      [type, title, option_a, option_b, option_c, option_d, answer, score, category, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '题目不存在'
      });
    }
    
    res.json({
      success: true,
      message: '题目更新成功'
    });
  } catch (error) {
    console.error('更新题目失败:', error);
    res.status(500).json({
      success: false,
      message: '更新题目失败',
      error: error.message
    });
  }
});

// 删除题目
app.delete('/api/questions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(
      'DELETE FROM questions WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '题目不存在'
      });
    }
    
    res.json({
      success: true,
      message: '题目删除成功'
    });
  } catch (error) {
    console.error('删除题目失败:', error);
    res.status(500).json({
      success: false,
      message: '删除题目失败',
      error: error.message
    });
  }
});

// 批量添加题目
app.post('/api/questions/batch', async (req, res) => {
  try {
    const { questions } = req.body;
    
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请提供有效的题目数组'
      });
    }
    
    const values = questions.map(q => [
      q.type, q.title, q.option_a || null, q.option_b || null,
      q.option_c || null, q.option_d || null, q.answer, q.score || 2, q.category || '党建知识'
    ]);
    
    const [result] = await pool.query(
      `INSERT INTO questions (type, title, option_a, option_b, option_c, option_d, answer, score, category) VALUES ?`,
      [values]
    );
    
    res.json({
      success: true,
      message: `成功添加 ${result.affectedRows} 道题目`,
      insertedCount: result.affectedRows
    });
  } catch (error) {
    console.error('批量添加题目失败:', error);
    res.status(500).json({
      success: false,
      message: '批量添加题目失败',
      error: error.message
    });
  }
});

// 获取题目统计
app.get('/api/statistics', async (req, res) => {
  try {
    const [typeStats] = await pool.query(
      'SELECT type, COUNT(*) as count FROM questions GROUP BY type'
    );
    const [totalResult] = await pool.query(
      'SELECT COUNT(*) as total FROM questions'
    );
    
    res.json({
      success: true,
      data: {
        total: totalResult[0].total,
        byType: typeStats
      }
    });
  } catch (error) {
    console.error('获取统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取统计失败',
      error: error.message
    });
  }
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API服务运行正常',
    timestamp: new Date().toISOString()
  });
});

// 根路径
app.get('/', (req, res) => {
  res.json({
    name: '党建平台题库API服务',
    version: '1.0.0',
    endpoints: [
      'GET  /api/questions          - 获取所有题目',
      'GET  /api/questions/:id      - 获取单题',
      'GET  /api/questions/type/:type - 按题型获取',
      'POST /api/questions          - 添加题目',
      'PUT  /api/questions/:id     - 更新题目',
      'DELETE /api/questions/:id   - 删除题目',
      'POST /api/questions/batch   - 批量添加',
      'GET  /api/statistics        - 获取统计'
    ]
  });
});

// ============================================================
// 启动服务
// ============================================================
async function startServer() {
  const dbConnected = await initDB();
  
  if (!dbConnected) {
    console.error('❌ 无法启动服务：数据库连接失败');
    console.log('请检查MySQL服务是否启动，以及DB_CONFIG配置是否正确');
    process.exit(1);
  }
  
  app.listen(PORT, () => {
    console.log(`✅ 党建题库API服务已启动: http://localhost:${PORT}`);
    console.log(`📋 API文档: http://localhost:${PORT}/api`);
  });
}

startServer();

/**
 * 人工智能协会党建平台 - 增强版API服务
 * 包含用户认证、题库管理和答题记录功能
 */

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const crypto = require('crypto');

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
  password: '123456',        // 修改为你的MySQL密码
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
// 工具函数
// ============================================================

// 密码加密（使用SHA256，简单演示，生产环境建议使用bcrypt）
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// 生成JWT令牌（简化版，实际应使用jsonwebtoken）
function generateToken(user) {
  // 简单实现，实际项目应使用jsonwebtoken库
  const payload = {
    userId: user.id,
    username: user.username,
    role: user.role,
    timestamp: Date.now()
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

// 验证令牌
function verifyToken(token) {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());
    // 简单验证令牌是否过期（24小时）
    if (Date.now() - payload.timestamp > 24 * 60 * 60 * 1000) {
      return null;
    }
    return payload;
  } catch (error) {
    return null;
  }
}

// 认证中间件
async function authenticate(req, res, next) {
  const token = req.headers['authorization']?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      success: false,
      message: '未提供认证令牌'
    });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({
      success: false,
      message: '认证令牌无效或已过期'
    });
  }

  // 验证用户是否仍然存在
  try {
    const [users] = await pool.query(
      'SELECT id, username, role, name FROM users WHERE id = ? AND is_active = TRUE',
      [payload.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: '用户不存在或已被禁用'
      });
    }

    req.user = users[0];
    next();
  } catch (error) {
    console.error('认证查询失败:', error);
    return res.status(500).json({
      success: false,
      message: '认证失败',
      error: error.message
    });
  }
}

// 管理员权限中间件
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: '需要管理员权限'
    });
  }
  next();
}

// ============================================================
// 用户认证API
// ============================================================

// 用户登录
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '请输入用户名和密码'
      });
    }

    const hashedPassword = hashPassword(password);

    const [users] = await pool.query(
      `SELECT id, username, name, role, email, phone, avatar
       FROM users
       WHERE username = ? AND password = ? AND is_active = TRUE`,
      [username, hashedPassword]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    const user = users[0];
    const token = generateToken(user);

    // 更新最后登录时间
    await pool.query(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [user.id]
    );

    res.json({
      success: true,
      message: '登录成功',
      data: {
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar
        },
        token: token
      }
    });

  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({
      success: false,
      message: '登录失败',
      error: error.message
    });
  }
});

// 用户注册
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, name, email, phone } = req.body;

    if (!username || !password || !name) {
      return res.status(400).json({
        success: false,
        message: '用户名、密码和姓名是必填项'
      });
    }

    // 检查用户名是否已存在
    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: '用户名已存在'
      });
    }

    const hashedPassword = hashPassword(password);

    const [result] = await pool.query(
      `INSERT INTO users (username, password, name, email, phone, role)
       VALUES (?, ?, ?, ?, ?, 'user')`,
      [username, hashedPassword, name, email || null, phone || null]
    );

    // 获取新创建的用户
    const [users] = await pool.query(
      `SELECT id, username, name, role, email, phone, avatar
       FROM users WHERE id = ?`,
      [result.insertId]
    );

    const user = users[0];
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: '注册成功',
      data: {
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
          email: user.email,
          phone: user.phone
        },
        token: token
      }
    });

  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({
      success: false,
      message: '注册失败',
      error: error.message
    });
  }
});

// 获取当前用户信息
app.get('/api/auth/me', authenticate, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({
      success: false,
      message: '获取用户信息失败',
      error: error.message
    });
  }
});

// ============================================================
// 用户管理API (需要管理员权限)
// ============================================================

// 获取所有用户
app.get('/api/users', authenticate, requireAdmin, async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT id, username, name, role, email, phone, avatar,
              last_login, created_at, updated_at, is_active
       FROM users
       ORDER BY created_at DESC`
    );

    res.json({
      success: true,
      data: users,
      total: users.length
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取用户列表失败',
      error: error.message
    });
  }
});

// 更新用户信息
app.put('/api/users/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role, is_active } = req.body;

    const [result] = await pool.query(
      `UPDATE users SET
        name = COALESCE(?, name),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        role = COALESCE(?, role),
        is_active = COALESCE(?, is_active)
       WHERE id = ?`,
      [name, email, phone, role, is_active, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      message: '用户信息更新成功'
    });
  } catch (error) {
    console.error('更新用户信息失败:', error);
    res.status(500).json({
      success: false,
      message: '更新用户信息失败',
      error: error.message
    });
  }
});

// ============================================================
// 题目管理API (原有功能，添加认证)
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

// 添加题目 (需要管理员权限)
app.post('/api/questions', authenticate, requireAdmin, async (req, res) => {
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

// 更新题目 (需要管理员权限)
app.put('/api/questions/:id', authenticate, requireAdmin, async (req, res) => {
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

// 删除题目 (需要管理员权限)
app.delete('/api/questions/:id', authenticate, requireAdmin, async (req, res) => {
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

// 批量添加题目 (需要管理员权限)
app.post('/api/questions/batch', authenticate, requireAdmin, async (req, res) => {
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

// ============================================================
// 答题记录API
// ============================================================

// 提交答题记录
app.post('/api/quiz/records', authenticate, async (req, res) => {
  try {
    const { total_questions, correct_answers, score, time_spent, quiz_data } = req.body;
    const userId = req.user.id;

    if (!total_questions || correct_answers === undefined) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      });
    }

    const [result] = await pool.query(
      `INSERT INTO quiz_records
       (user_id, total_questions, correct_answers, score, time_spent, quiz_data, start_time, end_time)
       VALUES (?, ?, ?, ?, ?, ?, NOW() - INTERVAL ? SECOND, NOW())`,
      [userId, total_questions, correct_answers, score || 0, time_spent || null,
       quiz_data ? JSON.stringify(quiz_data) : null, time_spent || 0]
    );

    res.json({
      success: true,
      message: '答题记录保存成功',
      recordId: result.insertId
    });
  } catch (error) {
    console.error('保存答题记录失败:', error);
    res.status(500).json({
      success: false,
      message: '保存答题记录失败',
      error: error.message
    });
  }
});

// 获取用户的答题记录
app.get('/api/quiz/records', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0 } = req.query;

    const [records] = await pool.query(
      `SELECT id, total_questions, correct_answers, score, time_spent,
              start_time, end_time, created_at
       FROM quiz_records
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, parseInt(limit), parseInt(offset)]
    );

    // 获取总记录数
    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM quiz_records WHERE user_id = ?',
      [userId]
    );

    // 获取最高分和平均分
    const [statsResult] = await pool.query(
      `SELECT
         MAX(score) as highest_score,
         AVG(score) as average_score,
         COUNT(*) as total_attempts,
         SUM(total_questions) as total_questions_answered,
         SUM(correct_answers) as total_correct_answers
       FROM quiz_records
       WHERE user_id = ?`,
      [userId]
    );

    res.json({
      success: true,
      data: {
        records: records,
        pagination: {
          total: countResult[0].total,
          limit: parseInt(limit),
          offset: parseInt(offset)
        },
        stats: statsResult[0]
      }
    });
  } catch (error) {
    console.error('获取答题记录失败:', error);
    res.status(500).json({
      success: false,
      message: '获取答题记录失败',
      error: error.message
    });
  }
});

// 获取答题排行榜
app.get('/api/quiz/leaderboard', async (req, res) => {
  try {
    const { limit = 10, period = 'all' } = req.query;

    let dateFilter = '';
    if (period === 'week') {
      dateFilter = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
    } else if (period === 'month') {
      dateFilter = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
    }

    const [leaderboard] = await pool.query(
      `SELECT
         u.id as user_id,
         u.username,
         u.name,
         u.avatar,
         COUNT(DISTINCT r.id) as attempts,
         MAX(r.score) as highest_score,
         AVG(r.score) as average_score,
         SUM(r.correct_answers) as total_correct
       FROM users u
       LEFT JOIN quiz_records r ON u.id = r.user_id
       WHERE u.is_active = TRUE
         ${dateFilter}
       GROUP BY u.id, u.username, u.name, u.avatar
       ORDER BY highest_score DESC, attempts DESC
       LIMIT ?`,
      [parseInt(limit)]
    );

    res.json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    console.error('获取排行榜失败:', error);
    res.status(500).json({
      success: false,
      message: '获取排行榜失败',
      error: error.message
    });
  }
});

// ============================================================
// 收藏功能API
// ============================================================

// 添加收藏
app.post('/api/favorites', authenticate, async (req, res) => {
  try {
    const { question_id } = req.body;
    const userId = req.user.id;

    if (!question_id) {
      return res.status(400).json({
        success: false,
        message: '请提供题目ID'
      });
    }

    // 检查题目是否存在
    const [questions] = await pool.query(
      'SELECT id FROM questions WHERE id = ?',
      [question_id]
    );

    if (questions.length === 0) {
      return res.status(404).json({
        success: false,
        message: '题目不存在'
      });
    }

    // 检查是否已收藏
    const [existingFavorites] = await pool.query(
      'SELECT id FROM user_favorites WHERE user_id = ? AND question_id = ?',
      [userId, question_id]
    );

    if (existingFavorites.length > 0) {
      return res.status(400).json({
        success: false,
        message: '该题目已收藏'
      });
    }

    await pool.query(
      'INSERT INTO user_favorites (user_id, question_id) VALUES (?, ?)',
      [userId, question_id]
    );

    res.json({
      success: true,
      message: '收藏成功'
    });
  } catch (error) {
    console.error('添加收藏失败:', error);
    res.status(500).json({
      success: false,
      message: '添加收藏失败',
      error: error.message
    });
  }
});

// 删除收藏
app.delete('/api/favorites/:question_id', authenticate, async (req, res) => {
  try {
    const { question_id } = req.params;
    const userId = req.user.id;

    const [result] = await pool.query(
      'DELETE FROM user_favorites WHERE user_id = ? AND question_id = ?',
      [userId, question_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '收藏记录不存在'
      });
    }

    res.json({
      success: true,
      message: '取消收藏成功'
    });
  } catch (error) {
    console.error('删除收藏失败:', error);
    res.status(500).json({
      success: false,
      message: '删除收藏失败',
      error: error.message
    });
  }
});

// 获取用户的收藏列表
app.get('/api/favorites', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0 } = req.query;

    const [favorites] = await pool.query(
      `SELECT
         f.id as favorite_id,
         f.created_at as favorited_at,
         q.id as question_id,
         q.type,
         q.title,
         q.option_a,
         q.option_b,
         q.option_c,
         q.option_d,
         q.answer,
         q.score,
         q.category
       FROM user_favorites f
       JOIN questions q ON f.question_id = q.id
       WHERE f.user_id = ?
       ORDER BY f.created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, parseInt(limit), parseInt(offset)]
    );

    // 获取总收藏数
    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM user_favorites WHERE user_id = ?',
      [userId]
    );

    res.json({
      success: true,
      data: {
        favorites: favorites,
        total: countResult[0].total
      }
    });
  } catch (error) {
    console.error('获取收藏列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取收藏列表失败',
      error: error.message
    });
  }
});

// ============================================================
// 系统API
// ============================================================

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API服务运行正常',
    timestamp: new Date().toISOString()
  });
});

// 系统统计
app.get('/api/system/stats', authenticate, requireAdmin, async (req, res) => {
  try {
    const [userStats] = await pool.query(
      'SELECT COUNT(*) as total_users, SUM(is_active = TRUE) as active_users FROM users'
    );
    const [questionStats] = await pool.query(
      'SELECT COUNT(*) as total_questions FROM questions'
    );
    const [recordStats] = await pool.query(
      'SELECT COUNT(*) as total_records, AVG(score) as avg_score FROM quiz_records'
    );

    res.json({
      success: true,
      data: {
        users: userStats[0],
        questions: questionStats[0],
        records: recordStats[0]
      }
    });
  } catch (error) {
    console.error('获取系统统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取系统统计失败',
      error: error.message
    });
  }
});

// 根路径
app.get('/', (req, res) => {
  res.json({
    name: '党建平台增强版API服务',
    version: '2.0.0',
    description: '包含用户认证、题库管理、答题记录和收藏功能',
    endpoints: {
      auth: [
        'POST /api/auth/login      - 用户登录',
        'POST /api/auth/register   - 用户注册',
        'GET  /api/auth/me         - 获取当前用户信息'
      ],
      users: [
        'GET  /api/users           - 获取所有用户（管理员）',
        'PUT  /api/users/:id       - 更新用户信息（管理员）'
      ],
      questions: [
        'GET  /api/questions       - 获取所有题目',
        'GET  /api/questions/:id   - 获取单题',
        'GET  /api/questions/type/:type - 按题型获取',
        'POST /api/questions       - 添加题目（管理员）',
        'PUT  /api/questions/:id   - 更新题目（管理员）',
        'DELETE /api/questions/:id - 删除题目（管理员）',
        'POST /api/questions/batch - 批量添加（管理员）',
        'GET  /api/statistics      - 获取题目统计'
      ],
      quiz: [
        'POST /api/quiz/records    - 提交答题记录',
        'GET  /api/quiz/records    - 获取用户答题记录',
        'GET  /api/quiz/leaderboard - 获取排行榜'
      ],
      favorites: [
        'POST /api/favorites       - 添加收藏',
        'DELETE /api/favorites/:id - 删除收藏',
        'GET  /api/favorites       - 获取收藏列表'
      ],
      system: [
        'GET  /api/health          - 健康检查',
        'GET  /api/system/stats    - 系统统计（管理员）'
      ]
    }
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
    console.log(`✅ 党建平台增强版API服务已启动: http://localhost:${PORT}`);
    console.log(`📋 API文档: http://localhost:${PORT}/`);
    console.log(`📚 数据库: party_question_bank`);
  });
}

startServer();
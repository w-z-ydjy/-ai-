-- ============================================================
-- 人工智能协会党建平台 - 数据库扩展
-- 扩展用户表和答题记录表
-- ============================================================

-- 使用已存在的数据库
USE `party_question_bank`;

-- ============================================================
-- 用户表 (users)
-- 存储系统用户信息
-- ============================================================
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` VARCHAR(50) NOT NULL COMMENT '用户名（登录账号）',
  `password` VARCHAR(255) NOT NULL COMMENT '密码（加密存储）',
  `name` VARCHAR(50) NOT NULL COMMENT '真实姓名',
  `role` ENUM('admin', 'user', 'guest') NOT NULL DEFAULT 'user' COMMENT '角色：admin-管理员, user-普通用户, guest-访客',
  `email` VARCHAR(100) DEFAULT NULL COMMENT '电子邮箱',
  `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号码',
  `avatar` VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
  `last_login` DATETIME DEFAULT NULL COMMENT '最后登录时间',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE COMMENT '是否激活',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  UNIQUE KEY `uk_email` (`email`),
  INDEX `idx_role` (`role`),
  INDEX `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- ============================================================
-- 答题记录表 (quiz_records)
-- 记录用户答题历史和成绩
-- ============================================================
DROP TABLE IF EXISTS `quiz_records`;

CREATE TABLE `quiz_records` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `user_id` INT UNSIGNED NOT NULL COMMENT '用户ID',
  `total_questions` INT UNSIGNED NOT NULL COMMENT '总题数',
  `correct_answers` INT UNSIGNED NOT NULL COMMENT '答对题数',
  `score` INT UNSIGNED NOT NULL COMMENT '得分',
  `time_spent` INT UNSIGNED DEFAULT NULL COMMENT '答题耗时（秒）',
  `quiz_data` JSON DEFAULT NULL COMMENT '答题详情（题目、选项、用户答案、正确答案等）',
  `start_time` DATETIME NOT NULL COMMENT '开始时间',
  `end_time` DATETIME NOT NULL COMMENT '结束时间',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_created_at` (`created_at`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='答题记录表';

-- ============================================================
-- 用户收藏表 (user_favorites)
-- 用户收藏的题目
-- ============================================================
DROP TABLE IF EXISTS `user_favorites`;

CREATE TABLE `user_favorites` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '收藏ID',
  `user_id` INT UNSIGNED NOT NULL COMMENT '用户ID',
  `question_id` INT UNSIGNED NOT NULL COMMENT '题目ID',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_question` (`user_id`, `question_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_question_id` (`question_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户收藏表';

-- ============================================================
-- 初始数据
-- 插入默认管理员账号和测试用户
-- ============================================================

-- 管理员账号：admin / 123456
-- 普通用户：user / 123456
-- 密码使用BCrypt加密，这里使用简单的SHA256哈希作为示例，实际部署时建议使用BCrypt
INSERT INTO `users` (`username`, `password`, `name`, `role`, `email`, `phone`) VALUES
('admin', SHA2('123456', 256), '张明远', 'admin', 'admin@party.com', '13800138000'),
('user', SHA2('123456', 256), '李小明', 'user', 'user@party.com', '13800138001'),
('test1', SHA2('123456', 256), '王小红', 'user', 'test1@party.com', '13800138002'),
('test2', SHA2('123456', 256), '赵建国', 'user', 'test2@party.com', '13800138003');

-- ============================================================
-- 数据验证查询
-- ============================================================
SELECT '=== 用户表统计 ===' AS '';
SELECT COUNT(*) AS '用户总数' FROM users;
SELECT role AS '角色', COUNT(*) AS '数量' FROM users GROUP BY role;

SELECT '=== 用户示例 ===' AS '';
SELECT id, username, name, role, email, created_at FROM users LIMIT 5;

SELECT '=== 表结构验证 ===' AS '';
SELECT TABLE_NAME, TABLE_ROWS, CREATE_TIME FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'party_question_bank' ORDER BY TABLE_NAME;
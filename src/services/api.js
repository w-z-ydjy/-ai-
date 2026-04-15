/* ============================================================
   智慧党建平台 - API服务层
   ============================================================ */

// API基础配置
const API_CONFIG = {
  baseUrl: 'http://localhost:3000/api',

  // 获取认证令牌
  getAuthToken: () => {
    return localStorage.getItem('authToken');
  },

  // 设置认证令牌
  setAuthToken: (token) => {
    localStorage.setItem('authToken', token);
  },

  // 移除认证令牌
  removeAuthToken: () => {
    localStorage.removeItem('authToken');
  },

  // 获取请求头
  getHeaders: (customHeaders = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    const token = API_CONFIG.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  },
};

// 基础API请求函数
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_CONFIG.baseUrl}${endpoint}`;

  // 提取自定义选项
  const { noRedirectOn401 = false, ...requestOptions } = options;

  const defaultOptions = {
    headers: API_CONFIG.getHeaders(options.headers),
    ...requestOptions,
  };

  try {
    const response = await fetch(url, defaultOptions);

    // 检查响应状态
    if (!response.ok) {
      // 处理401未授权错误
      if (response.status === 401) {
        handleUnauthorizedError(noRedirectOn401);
      }

      // 尝试解析错误信息
      let errorMessage = `请求失败: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // 如果响应不是JSON，使用状态文本
        errorMessage = response.statusText || errorMessage;
      }

      throw new Error(errorMessage);
    }

    // 解析响应数据
    return await response.json();
  } catch (error) {
    console.error('API请求错误:', error);
    throw error;
  }
};

// 处理未授权错误
const handleUnauthorizedError = (noRedirectOn401) => {
  // 清除本地存储的认证信息
  API_CONFIG.removeAuthToken();
  localStorage.removeItem('userLoggedIn');
  localStorage.removeItem('userName');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userId');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userPhone');
  localStorage.removeItem('userAvatar');

  // 显示错误提示（通过事件或回调）
  dispatchEvent(new CustomEvent('auth:expired', { detail: { message: '登录已过期，请重新登录' } }));

  // 如果不禁止重定向，则跳转到登录页
  if (!noRedirectOn401 && !window.location.pathname.includes('/login')) {
    setTimeout(() => {
      window.location.href = '/login';
    }, 1500);
  }
};

// 认证相关API
export const authApi = {
  // 用户登录
  login: async (credentials) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  // 用户注册
  register: async (userData) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // 获取当前用户信息
  getProfile: async () => {
    return apiRequest('/auth/me');
  },

  // 退出登录
  logout: () => {
    API_CONFIG.removeAuthToken();
    localStorage.removeItem('userLoggedIn');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userPhone');
    localStorage.removeItem('userAvatar');
  },
};

// 题目相关API
export const questionsApi = {
  // 获取所有题目
  getAll: async () => {
    return apiRequest('/questions');
  },

  // 按题型获取题目
  getByType: async (type) => {
    return apiRequest(`/questions/type/${type}`);
  },

  // 获取单个题目
  getById: async (id) => {
    return apiRequest(`/questions/${id}`);
  },

  // 获取随机题目（前端实现）
  getRandom: async (count = 10) => {
    const data = await apiRequest('/questions');
    if (!data.success) return [];

    const allQuestions = data.data;
    // 随机选择题目
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  },
};

// 答题记录相关API
export const quizApi = {
  // 提交答题记录
  submitRecord: async (record) => {
    return apiRequest('/quiz/records', {
      method: 'POST',
      body: JSON.stringify(record),
    });
  },

  // 获取用户答题记录
  getRecords: async (limit = 20, offset = 0) => {
    return apiRequest(`/quiz/records?limit=${limit}&offset=${offset}`);
  },

  // 获取答题排行榜
  getLeaderboard: async (limit = 10, period = 'all') => {
    return apiRequest(`/quiz/leaderboard?limit=${limit}&period=${period}`);
  },
};

// 收藏功能API
export const favoritesApi = {
  // 添加收藏
  add: async (questionId) => {
    return apiRequest('/favorites', {
      method: 'POST',
      body: JSON.stringify({ question_id: questionId }),
    });
  },

  // 删除收藏
  remove: async (questionId) => {
    return apiRequest(`/favorites/${questionId}`, {
      method: 'DELETE',
    });
  },

  // 获取用户收藏列表
  getAll: async (limit = 20, offset = 0) => {
    return apiRequest(`/favorites?limit=${limit}&offset=${offset}`);
  },
};

// 导出API配置
export default API_CONFIG;
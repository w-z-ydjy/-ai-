/* ============================================================
   智慧党建平台 - 增强版共享JavaScript文件
   支持API集成和动态数据
   ============================================================ */

// API配置
const API_CONFIG = {
  baseUrl: 'http://localhost:3000/api',
  getAuthToken: function() {
    return localStorage.getItem('authToken');
  },
  setAuthToken: function(token) {
    localStorage.setItem('authToken', token);
  },
  removeAuthToken: function() {
    localStorage.removeItem('authToken');
  },
  getHeaders: function() {
    const headers = {
      'Content-Type': 'application/json'
    };
    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }
};

/* ============================================================
   API请求辅助函数
   ============================================================ */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_CONFIG.baseUrl}${endpoint}`;
  const defaultOptions = {
    headers: API_CONFIG.getHeaders(),
    ...options
  };

  // 检查是否禁止401重定向
  const noRedirectOn401 = options.noRedirectOn401 || false;

  try {
    const response = await fetch(url, defaultOptions);
    const data = await response.json();

    if (!response.ok) {
      // 认证失败，清除本地存储
      if (response.status === 401) {
        API_CONFIG.removeAuthToken();
        localStorage.removeItem('userLoggedIn');
        localStorage.removeItem('userName');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userPhone');
        localStorage.removeItem('userAvatar');
        showToast('❌ 登录已过期，请重新登录');

        // 只有不禁止重定向时才跳转到登录页
        if (!noRedirectOn401) {
          setTimeout(() => {
            if (!window.location.href.includes('login.html')) {
              window.location.href = 'login.html';
            }
          }, 1500);
        }
      }

      throw new Error(data.message || `请求失败: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API请求错误:', error);
    showToast(`❌ ${error.message}`, 'error');
    throw error;
  }
}

/* ============================================================
   用户认证API函数
   ============================================================ */

// 用户登录
async function doLogin() {
  const username = document.getElementById('loginUser').value;
  const password = document.getElementById('loginPass').value;

  if (!username || !password) {
    showToast('❌ 请输入用户名和密码');
    return;
  }

  try {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });

    if (data.success) {
      const { user, token } = data.data;

      // 保存用户信息和令牌
      API_CONFIG.setAuthToken(token);
      localStorage.setItem('userLoggedIn', 'true');
      localStorage.setItem('userName', user.name);
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('userId', user.id);
      localStorage.setItem('userEmail', user.email || '');
      localStorage.setItem('userPhone', user.phone || '');
      localStorage.setItem('userAvatar', user.avatar || '');

      showToast(`✅ 登录成功！欢迎回来，${user.name}`);
      updateNavigation();

      setTimeout(() => {
        window.location.href = 'index.html';
      }, 800);
    }
  } catch (error) {
    // 错误已在apiRequest中处理
  }
}

// 用户注册
async function doRegister() {
  const username = document.getElementById('registerUser').value;
  const password = document.getElementById('registerPass').value;
  const confirmPassword = document.getElementById('registerConfirmPass').value;
  const name = document.getElementById('registerName').value;
  const email = document.getElementById('registerEmail').value;
  const phone = document.getElementById('registerPhone').value;

  if (!username || !password || !name) {
    showToast('❌ 用户名、密码和姓名是必填项');
    return;
  }

  if (password !== confirmPassword) {
    showToast('❌ 两次输入的密码不一致');
    return;
  }

  try {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, name, email, phone })
    });

    if (data.success) {
      const { user, token } = data.data;

      // 保存用户信息和令牌
      API_CONFIG.setAuthToken(token);
      localStorage.setItem('userLoggedIn', 'true');
      localStorage.setItem('userName', user.name);
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('userId', user.id);
      localStorage.setItem('userEmail', user.email || '');
      localStorage.setItem('userPhone', user.phone || '');

      showToast(`✅ 注册成功！欢迎加入，${user.name}`);
      updateNavigation();

      setTimeout(() => {
        window.location.href = 'index.html';
      }, 800);
    }
  } catch (error) {
    // 错误已在apiRequest中处理
  }
}

// 用户注销
function doLogout() {
  if (confirm('确定要退出登录吗？')) {
    API_CONFIG.removeAuthToken();
    localStorage.removeItem('userLoggedIn');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userPhone');
    localStorage.removeItem('userAvatar');

    showToast('👋 已成功退出登录');
    updateNavigation();

    setTimeout(() => {
      window.location.href = 'index.html';
    }, 800);
  }
}

// 检查登录状态并获取用户信息
async function checkAuthStatus() {
  const token = API_CONFIG.getAuthToken();
  if (!token) {
    return false;
  }

  try {
    const data = await apiRequest('/auth/me');
    if (data.success) {
      const user = data.data.user;
      // 更新本地存储
      localStorage.setItem('userLoggedIn', 'true');
      localStorage.setItem('userName', user.name);
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('userId', user.id);
      localStorage.setItem('userEmail', user.email || '');
      localStorage.setItem('userPhone', user.phone || '');
      localStorage.setItem('userAvatar', user.avatar || '');
      return true;
    }
  } catch (error) {
    // 认证失败，清除token（用户信息已在apiRequest中清除）
    API_CONFIG.removeAuthToken();
    return false;
  }
}

/* ============================================================
   题目API函数
   ============================================================ */

// 获取所有题目
async function getQuestions() {
  try {
    const data = await apiRequest('/questions');
    return data.success ? data.data : [];
  } catch (error) {
    console.error('获取题目失败:', error);
    return [];
  }
}

// 按题型获取题目
async function getQuestionsByType(type) {
  try {
    const data = await apiRequest(`/questions/type/${type}`);
    return data.success ? data.data : [];
  } catch (error) {
    console.error('获取题目失败:', error);
    return [];
  }
}

// 获取随机题目
async function getRandomQuestions(count = 10) {
  try {
    const data = await apiRequest('/questions');
    if (!data.success) return [];

    const allQuestions = data.data;
    // 随机选择题目
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  } catch (error) {
    console.error('获取随机题目失败:', error);
    return [];
  }
}

/* ============================================================
   答题记录API函数
   ============================================================ */

// 提交答题记录
async function submitQuizRecord(record) {
  try {
    const data = await apiRequest('/quiz/records', {
      method: 'POST',
      body: JSON.stringify(record)
    });
    return data.success;
  } catch (error) {
    console.error('提交答题记录失败:', error);
    return false;
  }
}

// 获取用户的答题记录
async function getUserQuizRecords(limit = 20, offset = 0) {
  try {
    const data = await apiRequest(`/quiz/records?limit=${limit}&offset=${offset}`);
    return data.success ? data.data : { records: [], pagination: { total: 0 }, stats: {} };
  } catch (error) {
    console.error('获取答题记录失败:', error);
    return { records: [], pagination: { total: 0 }, stats: {} };
  }
}

// 获取答题排行榜
async function getQuizLeaderboard(limit = 10, period = 'all') {
  try {
    const data = await apiRequest(`/quiz/leaderboard?limit=${limit}&period=${period}`);
    return data.success ? data.data : [];
  } catch (error) {
    console.error('获取排行榜失败:', error);
    return [];
  }
}

/* ============================================================
   收藏功能API函数
   ============================================================ */

// 添加收藏
async function addFavorite(questionId) {
  try {
    const data = await apiRequest('/favorites', {
      method: 'POST',
      body: JSON.stringify({ question_id: questionId })
    });
    return data.success;
  } catch (error) {
    console.error('添加收藏失败:', error);
    return false;
  }
}

// 删除收藏
async function removeFavorite(questionId) {
  try {
    const data = await apiRequest(`/favorites/${questionId}`, {
      method: 'DELETE'
    });
    return data.success;
  } catch (error) {
    console.error('删除收藏失败:', error);
    return false;
  }
}

// 获取用户的收藏列表
async function getUserFavorites(limit = 20, offset = 0) {
  try {
    const data = await apiRequest(`/favorites?limit=${limit}&offset=${offset}`);
    return data.success ? data.data : { favorites: [], total: 0 };
  } catch (error) {
    console.error('获取收藏列表失败:', error);
    return { favorites: [], total: 0 };
  }
}

/* ============================================================
   题目管理API函数（管理员专用）
   ============================================================ */

// 添加单个题目
async function addQuestion(questionData) {
  try {
    const data = await apiRequest('/questions', {
      method: 'POST',
      body: JSON.stringify(questionData)
    });

    if (data.success) {
      showToast(`✅ 题目添加成功！ID: ${data.insertId}`);
      return { success: true, insertId: data.insertId };
    }
    return { success: false, message: data.message };
  } catch (error) {
    console.error('添加题目失败:', error);
    return { success: false, message: error.message };
  }
}

// 批量添加题目
async function addQuestionsBatch(questionsArray) {
  try {
    const data = await apiRequest('/questions/batch', {
      method: 'POST',
      body: JSON.stringify({ questions: questionsArray })
    });

    if (data.success) {
      showToast(`✅ 成功添加 ${data.insertedCount} 道题目`);
      return { success: true, insertedCount: data.insertedCount };
    }
    return { success: false, message: data.message };
  } catch (error) {
    console.error('批量添加题目失败:', error);
    return { success: false, message: error.message };
  }
}

// 更新题目
async function updateQuestion(questionId, questionData) {
  try {
    const data = await apiRequest(`/questions/${questionId}`, {
      method: 'PUT',
      body: JSON.stringify(questionData)
    });

    if (data.success) {
      showToast('✅ 题目更新成功');
      return { success: true };
    }
    return { success: false, message: data.message };
  } catch (error) {
    console.error('更新题目失败:', error);
    return { success: false, message: error.message };
  }
}

// 删除题目
async function deleteQuestion(questionId) {
  try {
    const data = await apiRequest(`/questions/${questionId}`, {
      method: 'DELETE'
    });

    if (data.success) {
      showToast('✅ 题目删除成功');
      return { success: true };
    }
    return { success: false, message: data.message };
  } catch (error) {
    console.error('删除题目失败:', error);
    return { success: false, message: error.message };
  }
}

// 获取题目详情
async function getQuestionDetail(questionId) {
  try {
    const data = await apiRequest(`/questions/${questionId}`);
    return data.success ? { success: true, question: data.data } : { success: false };
  } catch (error) {
    console.error('获取题目详情失败:', error);
    return { success: false };
  }
}

/* ============================================================
   原common.js功能（保持兼容）
   ============================================================ */

/* Toast */
function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.className = 'toast-' + type;
  toast.style.display = 'block';
  setTimeout(() => { toast.style.display = 'none'; }, 3000);
}

/* Navigation */
function updateNavigation() {
  // 检查登录状态：如果有用户名或userId，认为用户已登录
  const userName = localStorage.getItem('userName');
  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole');
  const hasUserInfo = (userName && userName !== 'undefined') || (userId && userId !== 'undefined');

  let navRight = document.getElementById('navRight');
  if (!navRight) {
    // 回退：通过类名查找
    navRight = document.querySelector('.nav-right');
  }

  if (navRight) {
    const loginBtn = navRight.querySelector('.nav-btn-login');
    const adminBtn = navRight.querySelector('.nav-btn-admin');
    const logoutBtn = navRight.querySelector('.nav-btn-logout');

    if (hasUserInfo) {
      // 用户有信息，显示为已登录状态
      if (loginBtn) {
        loginBtn.textContent = '👤 ' + (userName || '用户');
        loginBtn.onclick = () => window.location.href = 'profile.html';
      }

      if (adminBtn) {
        adminBtn.style.display = (userRole === 'admin') ? 'inline-flex' : 'none';
      }

      // 添加注销按钮（如果不存在）
      if (!logoutBtn && navRight.querySelector('.nav-btn-logout') === null) {
        const logoutBtn = document.createElement('button');
        logoutBtn.className = 'nav-btn nav-btn-logout btn-outline';
        logoutBtn.textContent = '退出登录';
        logoutBtn.onclick = doLogout;
        navRight.appendChild(logoutBtn);
      }
    } else {
      // 用户未登录
      if (loginBtn) {
        loginBtn.textContent = '👤 登录';
        loginBtn.onclick = () => window.location.href = 'login.html';
      }

      if (adminBtn) {
        adminBtn.style.display = 'none';
      }

      // 移除注销按钮
      if (logoutBtn) {
        logoutBtn.remove();
      }
    }
  }
}

/* Theme */
function toggleTheme() {
  const body = document.body;
  const themeToggle = document.getElementById('themeToggle');

  body.classList.toggle('dark-theme');
  const isDark = body.classList.contains('dark-theme');

  if (themeToggle) {
    themeToggle.textContent = isDark ? '☀️ 浅色' : '🌙 深色';
  }

  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  showToast(isDark ? '🌙 已切换到深色主题' : '☀️ 已切换到浅色主题');
}

function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) themeToggle.textContent = '☀️ 浅色';
  }
}

/* Navbar scroll effects */
function initNavbarEffects() {
  const navbar = document.getElementById('topnav');
  if (!navbar) return;

  window.addEventListener('scroll', function() {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

/* Mobile nav */
function toggleMobileNav() {
  const nav = document.getElementById('mobileNav');
  if (nav) nav.classList.toggle('open');
}

/* Font size */
function changeFontSize(action) {
  const root = document.documentElement;
  let currentSize = parseInt(localStorage.getItem('fontSize') || 16);

  switch (action) {
    case 'increase': currentSize = Math.min(currentSize + 2, 24); break;
    case 'decrease': currentSize = Math.max(currentSize - 2, 12); break;
    case 'reset': currentSize = 16; break;
  }

  root.style.setProperty('--font-size-base', currentSize + 'px');
  root.style.setProperty('--font-size-sm', (currentSize - 2) + 'px');
  root.style.setProperty('--font-size-lg', (currentSize + 2) + 'px');
  root.style.setProperty('--font-size-xl', (currentSize + 4) + 'px');
  root.style.setProperty('--font-size-2xl', (currentSize + 8) + 'px');

  localStorage.setItem('fontSize', currentSize);

  const currentFontSizeEl = document.getElementById('currentFontSize');
  if (currentFontSizeEl) currentFontSizeEl.textContent = currentSize;

  showToast(`字体大小已${action === 'increase' ? '增大' : action === 'decrease' ? '减小' : '重置'}`);
}

function initFontSize() {
  const savedSize = parseInt(localStorage.getItem('fontSize') || 16);
  const root = document.documentElement;
  root.style.setProperty('--font-size-base', savedSize + 'px');
  root.style.setProperty('--font-size-sm', (savedSize - 2) + 'px');
  root.style.setProperty('--font-size-lg', (savedSize + 2) + 'px');
  root.style.setProperty('--font-size-xl', (savedSize + 4) + 'px');
  root.style.setProperty('--font-size-2xl', (savedSize + 8) + 'px');
}

/* Search */
async function performSearch() {
  const searchInput = document.getElementById('searchInput');
  const searchTerm = searchInput ? searchInput.value.trim() : '';

  if (!searchTerm) {
    showToast('请输入搜索关键词');
    return;
  }

  // 暂时使用本地数据，后续可改为API搜索
  const searchData = [
    { title: '关于深入开展主题教育学习活动的通知', category: '通知', date: '2024-12-10' },
    { title: '人工智能协会2024年度党员发展大会圆满召开', category: '要闻', date: '2024-12-15' },
    { title: '社团党支部荣获"优秀党支部"称号', category: '荣誉', date: '2024-12-05' },
    { title: '第四季度预备党员宣誓仪式隆重举行', category: '活动', date: '2024-11-28' },
    { title: 'AI赋能党建：智慧党建平台建设工作汇报', category: 'AI党建', date: '2024-11-20' }
  ];

  const results = searchData.filter(item => {
    return item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           item.category.toLowerCase().includes(searchTerm.toLowerCase());
  });

  showSearchResults(results, searchTerm);
}

function showSearchResults(results, searchTerm) {
  const modalContent = `
    <div class="search-results-modal">
      <div class="search-results-header">
        <h3>搜索结果："${searchTerm}"</h3>
        <button class="modal-close" onclick="closeSearchResults()">×</button>
      </div>
      <div class="search-results-body">
        ${results.length > 0 ?
          results.map(item => `
            <div class="search-result-item">
              <div class="search-result-title">${item.title}</div>
              <div class="search-result-meta">
                <span class="tag tag-blue">${item.category}</span>
                <span>${item.date}</span>
              </div>
            </div>
          `).join('') :
          '<div class="alert alert-info">未找到相关内容</div>'
        }
      </div>
    </div>
  `;

  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'modal-overlay open';
  modalOverlay.id = 'searchResultsModal';

  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = modalContent;

  modalOverlay.appendChild(modal);
  document.body.appendChild(modalOverlay);

  modalOverlay.onclick = function(e) {
    if (e.target === modalOverlay) closeSearchResults();
  };
}

function closeSearchResults() {
  const modal = document.getElementById('searchResultsModal');
  if (modal) modal.remove();
}

/* Modal helpers */
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('open');
}

/* Party tabs */
function switchPartyTab(tab, el) {
  document.querySelectorAll('[id^="ptab-"]').forEach(t => t.style.display = 'none');
  const tabEl = document.getElementById('ptab-' + tab);
  if (tabEl) tabEl.style.display = '';
  document.querySelectorAll('#partyNavInner .party-nav-item').forEach(i => i.classList.remove('active'));
  if (el) el.classList.add('active');
}

/* Showcase tabs */
function switchShowcaseTab(tab, el) {
  document.querySelectorAll('[id^="stab-"]').forEach(t => t.style.display = 'none');
  const tabEl = document.getElementById('stab-' + tab);
  if (tabEl) tabEl.style.display = '';
  document.querySelectorAll('#showcaseNavInner .party-nav-item').forEach(i => i.classList.remove('active'));
  if (el) el.classList.add('active');
}

/* Study tabs */
function switchStudyTab(tab, el) {
  document.querySelectorAll('[id^="utab-"]').forEach(t => t.style.display = 'none');
  const tabEl = document.getElementById('utab-' + tab);
  if (tabEl) tabEl.style.display = '';
  document.querySelectorAll('#studyNavInner .party-nav-item').forEach(i => {
    i.classList.remove('active');
    i.style.color = '';
    i.style.borderBottomColor = '';
  });
  if (el) {
    el.classList.add('active');
    el.style.color = 'var(--blue)';
    el.style.borderBottomColor = 'var(--blue)';
  }
}

/* Profile tabs */
function switchProfileTab(tab, el) {
  ['signup', 'study', 'collect', 'achievement', 'download', 'settings'].forEach(t => {
    const tabEl = document.getElementById('ptab-' + t);
    if (tabEl) tabEl.style.display = 'none';
  });
  const tabEl = document.getElementById('ptab-' + tab);
  if (tabEl) tabEl.style.display = '';
  document.querySelectorAll('.profile-tab').forEach(i => i.classList.remove('active'));
  if (el) el.classList.add('active');
}

/* Admin tabs */
function switchAdminPage(page, el) {
  document.querySelectorAll('.admin-page').forEach(p => p.classList.remove('active'));
  const pageEl = document.getElementById('admin-' + page);
  if (pageEl) pageEl.classList.add('active');
  document.querySelectorAll('.admin-nav-item').forEach(i => i.classList.remove('active'));
  if (el) el.classList.add('active');
}

/* Hero slider */
let slideIdx = 0;
let slideCount = 3;

function slideHero(dir) {
  slideIdx = (slideIdx + dir + slideCount) % slideCount;
  updateSlider();
}

function goSlide(i) { slideIdx = i; updateSlider(); }

function updateSlider() {
  const slides = document.getElementById('heroSlides');
  if (slides) slides.style.transform = `translateX(-${slideIdx * 100}%)`;
  document.querySelectorAll('.hero-dot').forEach((d, i) => d.classList.toggle('active', i === slideIdx));
}

/* 访客登录（兼容原有功能） */
function doGuestLogin() {
  let guestName = localStorage.getItem('guestName');
  if (!guestName) {
    guestName = '访客' + String(Math.floor(1000 + Math.random() * 9000));
    localStorage.setItem('guestName', guestName);
  }

  localStorage.setItem('userLoggedIn', 'true');
  localStorage.setItem('userName', guestName);
  localStorage.setItem('userRole', 'guest');

  showToast('👤 ' + guestName + ' 登录成功！您可以浏览公开内容');
  setTimeout(() => { window.location.href = 'index.html'; }, 500);
}

/* 工具函数 */
function isLoggedIn() { return localStorage.getItem('userLoggedIn') === 'true'; }
function getUserRole() { return localStorage.getItem('userRole') || 'guest'; }
function isAdmin() { return getUserRole() === 'admin'; }
function isGuest() { return getUserRole() === 'guest'; }

/* Page loader */
function hidePageLoader() {
  const loader = document.getElementById('pageLoader');
  if (loader) {
    loader.classList.add('hidden');
    setTimeout(() => loader.remove(), 500);
  }
}

/* 初始化 */
document.addEventListener('DOMContentLoaded', async function() {
  initTheme();
  initFontSize();
  initNavbarEffects();

  // 检查认证状态
  await checkAuthStatus();

  updateNavigation();
  hidePageLoader();

  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') performSearch();
    });
  }
});
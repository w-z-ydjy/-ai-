import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { authApi } from '../services/api';

// 创建认证上下文
const AuthContext = createContext();

// 自定义hook以便在组件中使用认证上下文
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth必须在AuthProvider内部使用');
  }
  return context;
};

// 认证提供者组件
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 初始化时检查认证状态
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // 检查认证状态
  const checkAuthStatus = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    const userLoggedIn = localStorage.getItem('userLoggedIn');

    if (!token || userLoggedIn !== 'true') {
      setLoading(false);
      return;
    }

    try {
      const response = await authApi.getProfile();
      if (response.success) {
        const userData = response.data.user;
        setUser(userData);

        // 更新本地存储
        localStorage.setItem('userLoggedIn', 'true');
        localStorage.setItem('userName', userData.name);
        localStorage.setItem('userRole', userData.role);
        localStorage.setItem('userId', userData.id);
        localStorage.setItem('userEmail', userData.email || '');
        localStorage.setItem('userPhone', userData.phone || '');
        localStorage.setItem('userAvatar', userData.avatar || '');
      }
    } catch (err) {
      // 认证失败，清除本地存储
      authApi.logout();
      setUser(null);
      console.error('认证检查失败:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 用户登录
  const login = async (credentials) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authApi.login(credentials);

      if (response.success) {
        const { user: userData, token } = response.data;

        // 保存认证令牌
        localStorage.setItem('authToken', token);

        // 更新用户状态
        setUser(userData);

        // 保存用户信息到本地存储
        localStorage.setItem('userLoggedIn', 'true');
        localStorage.setItem('userName', userData.name);
        localStorage.setItem('userRole', userData.role);
        localStorage.setItem('userId', userData.id);
        localStorage.setItem('userEmail', userData.email || '');
        localStorage.setItem('userPhone', userData.phone || '');
        localStorage.setItem('userAvatar', userData.avatar || '');

        return { success: true, user: userData };
      } else {
        throw new Error(response.message || '登录失败');
      }
    } catch (err) {
      setError(err.message || '登录失败，请检查用户名和密码');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // 用户注册
  const register = async (userData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authApi.register(userData);

      if (response.success) {
        const { user: newUser, token } = response.data;

        // 保存认证令牌
        localStorage.setItem('authToken', token);

        // 更新用户状态
        setUser(newUser);

        // 保存用户信息到本地存储
        localStorage.setItem('userLoggedIn', 'true');
        localStorage.setItem('userName', newUser.name);
        localStorage.setItem('userRole', newUser.role);
        localStorage.setItem('userId', newUser.id);
        localStorage.setItem('userEmail', newUser.email || '');
        localStorage.setItem('userPhone', newUser.phone || '');
        localStorage.setItem('userAvatar', newUser.avatar || '');

        return { success: true, user: newUser };
      } else {
        throw new Error(response.message || '注册失败');
      }
    } catch (err) {
      setError(err.message || '注册失败，请检查输入信息');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // 用户登出
  const logout = () => {
    authApi.logout();
    setUser(null);
    setError(null);

    // 触发认证过期事件
    window.dispatchEvent(new Event('auth:expired'));
  };

  // 更新用户信息
  const updateUser = (updates) => {
    setUser((prevUser) => ({
      ...prevUser,
      ...updates,
    }));

    // 更新本地存储
    if (updates.name) localStorage.setItem('userName', updates.name);
    if (updates.email) localStorage.setItem('userEmail', updates.email);
    if (updates.phone) localStorage.setItem('userPhone', updates.phone);
    if (updates.avatar) localStorage.setItem('userAvatar', updates.avatar);
  };

  // 检查用户角色
  const isAdmin = user?.role === 'admin';
  const isGuest = user?.role === 'guest';

  // 上下文值
  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
    checkAuthStatus,
    isAuthenticated: !!user,
    isAdmin,
    isGuest,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
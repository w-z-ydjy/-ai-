import React, { createContext, useState, useEffect, useContext } from 'react';

// 创建主题上下文
const ThemeContext = createContext();

// 自定义hook以便在组件中使用主题上下文
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme必须在ThemeProvider内部使用');
  }
  return context;
};

// 主题提供者组件
export const ThemeProvider = ({ children }) => {
  // 从localStorage获取初始主题，默认为浅色
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  // 监听系统主题变化
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e) => {
      // 如果用户没有手动设置主题，则跟随系统
      const savedTheme = localStorage.getItem('theme');
      if (!savedTheme) {
        setIsDark(e.matches);
      }
    };

    // 初始检查
    if (!localStorage.getItem('theme')) {
      setIsDark(mediaQuery.matches);
    }

    // 添加监听
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // 切换主题
  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light');

    // 更新文档属性
    updateDocumentTheme(newIsDark);
  };

  // 设置主题
  const setTheme = (darkMode) => {
    setIsDark(darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    updateDocumentTheme(darkMode);
  };

  // 更新文档主题属性
  const updateDocumentTheme = (dark) => {
    if (dark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark-theme');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      document.body.classList.remove('dark-theme');
    }
  };

  // 初始化文档主题
  useEffect(() => {
    updateDocumentTheme(isDark);
  }, [isDark]);

  // 上下文值
  const value = {
    isDark,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
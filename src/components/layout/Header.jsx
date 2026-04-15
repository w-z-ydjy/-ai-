import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import styles from './Header.module.css';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  // 监听滚动事件
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 关闭移动导航当路由改变时
  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [location.pathname]);

  // 导航链接配置
  const navLinks = [
    { path: '/', label: '首 页', active: true },
    {
      path: '/party',
      label: '党建引领专区',
      dropdown: [
        { path: '/party', label: '党建新闻' },
        { path: '/party/policies', label: '政策文件' },
        { path: '/party/history', label: '党史学习' },
      ]
    },
    {
      path: '/showcase',
      label: '社团风采',
      dropdown: [
        { path: '/showcase', label: '社团简介' },
        { path: '/showcase/members', label: '成员风采' },
        { path: '/showcase/honors', label: '荣誉成果' },
      ]
    },
    { path: '/activities', label: '党建活动' },
    { path: '/study', label: '学习中心' },
    { path: '/chat', label: 'AI智能问答' },
    { path: '/message', label: '留言板' },
  ];

  // 移动导航链接
  const mobileNavLinks = [
    { path: '/', label: '🏠 首页' },
    { path: '/party', label: '🚩 党建引领专区' },
    { path: '/showcase', label: '🌟 社团风采' },
    { path: '/activities', label: '📅 党建活动' },
    { path: '/study', label: '📚 学习中心' },
    { path: '/chat', label: '🤖 AI智能问答' },
    { path: '/message', label: '💬 留言板' },
    { path: '/profile', label: '👤 个人中心' },
    { path: '/login', label: user ? '🔓 个人中心' : '🔐 登录' },
  ];

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      // 显示错误提示
      return;
    }
    // 实现搜索功能
    console.log('搜索:', searchQuery);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleLoginClick = () => {
    if (user) {
      navigate('/profile');
    } else {
      navigate('/login');
    }
  };

  const handleAdminClick = () => {
    navigate('/admin');
  };

  const toggleMobileNav = () => {
    setIsMobileNavOpen(!isMobileNavOpen);
  };

  return (
    <>
      {/* 顶部导航栏 */}
      <nav className={`${styles.topnav} ${isScrolled ? styles.scrolled : ''}`}>
        <div className={styles.navWrap}>
          {/* Logo */}
          <div className={styles.navLogo} onClick={handleLogoClick}>
            <div className={styles.navLogoIcon}>★</div>
            <div>
              <div className={styles.navLogoText}>人工智能协会 · 党建文化</div>
              <span className={styles.navLogoSub}></span>
            </div>
          </div>

          {/* 搜索框 */}
          <div className={styles.navSearch}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="搜索党建内容..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button className={styles.searchBtn} onClick={handleSearch}>
              🔍
            </button>
          </div>

          {/* 导航链接 */}
          <div className={styles.navLinks}>
            {navLinks.map((link, index) => (
              <div key={index} className={styles.navLinkContainer}>
                {link.dropdown ? (
                  <div className={styles.navDropdown}>
                    <div
                      className={`${styles.navLink} ${location.pathname.startsWith(link.path) ? styles.active : ''}`}
                      onClick={() => navigate(link.path)}
                    >
                      {link.label}
                    </div>
                    <div className={styles.navDropdownMenu}>
                      {link.dropdown.map((item, idx) => (
                        <div
                          key={idx}
                          className={styles.navDropdownItem}
                          onClick={() => navigate(item.path)}
                        >
                          {item.label}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div
                    className={`${styles.navLink} ${location.pathname === link.path ? styles.active : ''}`}
                    onClick={() => navigate(link.path)}
                  >
                    {link.label}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 右侧按钮 */}
          <div className={styles.navRight}>
            <button className={styles.navBtn} onClick={toggleTheme}>
              {isDark ? '☀️ 浅色' : '🌙 深色'}
            </button>
            <button className={`${styles.navBtn} ${styles.navBtnLogin}`} onClick={handleLoginClick}>
              {user ? `👤 ${user.name}` : '登 录'}
            </button>
            {user?.role === 'admin' && (
              <button className={`${styles.navBtn} ${styles.navBtnAdmin}`} onClick={handleAdminClick}>
                后台管理
              </button>
            )}
            {user && (
              <button
                className={`${styles.navBtn} ${styles.navBtnLogout}`}
                onClick={logout}
              >
                退出登录
              </button>
            )}
          </div>

          {/* 移动端汉堡菜单 */}
          <button className={styles.hamburger} onClick={toggleMobileNav}>
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {/* 移动端导航菜单 */}
      <div className={`${styles.mobileNav} ${isMobileNavOpen ? styles.open : ''}`}>
        {mobileNavLinks.map((link, index) => (
          <div
            key={index}
            className={styles.mobileNavItem}
            onClick={() => {
              navigate(link.path);
              setIsMobileNavOpen(false);
            }}
          >
            {link.label}
          </div>
        ))}
      </div>
    </>
  );
};

export default Header;
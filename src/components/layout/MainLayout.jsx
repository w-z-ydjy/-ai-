import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Toast from '../ui/Toast';
import styles from './MainLayout.module.css';

const MainLayout = () => {
  return (
    <div className={styles.layout}>
      {/* 顶部导航栏 */}
      <Header />

      {/* 主要内容区域 */}
      <main className={styles.mainContent}>
        <Outlet />
      </main>

      {/* 页脚 */}
      <Footer />

      {/* 全局消息提示 */}
      <Toast />
    </div>
  );
};

export default MainLayout;
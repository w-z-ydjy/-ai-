import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Footer.module.css';

const Footer = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  // 快速导航链接
  const quickLinks = [
    { path: '/', label: '首页' },
    { path: '/party', label: '党建引领专区' },
    { path: '/showcase', label: '社团风采' },
    { path: '/activities', label: '党建活动' },
  ];

  // 功能模块链接
  const featureLinks = [
    { path: '/study', label: '学习中心' },
    { path: '/chat', label: 'AI智能问答' },
    { path: '/message', label: '留言板' },
    { path: '/profile', label: '个人中心' },
  ];

  // 联系信息
  const contactInfo = [
    { icon: '📍', text: '武汉市江夏区' },
    { icon: '✉️', text: 'zhihui.ai@wbus.edu.cn' },
    { icon: '💬', text: '微信公众号：人工智能党建' },
  ];

  const handleLinkClick = (path) => {
    navigate(path);
  };

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footerGrid}>
          {/* 品牌介绍 */}
          <div className={styles.footerBrand}>
            <div className={styles.footerBrandTitle}>人工智能协会</div>
            <div className={styles.footerBrandDesc}>
              以党建为引领，以智汇为纽带，以AI为翼，致力于打造现代化、智能化的党建文化平台，凝心铸魂，砥砺奋进。
            </div>
          </div>

          {/* 快速导航 */}
          <div className={styles.footerCol}>
            <div className={styles.footerColTitle}>快速导航</div>
            {quickLinks.map((link, index) => (
              <div
                key={index}
                className={styles.footerLink}
                onClick={() => handleLinkClick(link.path)}
              >
                {link.label}
              </div>
            ))}
          </div>

          {/* 功能模块 */}
          <div className={styles.footerCol}>
            <div className={styles.footerColTitle}>功能模块</div>
            {featureLinks.map((link, index) => (
              <div
                key={index}
                className={styles.footerLink}
                onClick={() => handleLinkClick(link.path)}
              >
                {link.label}
              </div>
            ))}
          </div>

          {/* 联系我们 */}
          <div className={styles.footerCol}>
            <div className={styles.footerColTitle}>联系我们</div>
            {contactInfo.map((info, index) => (
              <div key={index} className={styles.footerLink}>
                {info.icon} {info.text}
              </div>
            ))}
          </div>
        </div>

        {/* 底部版权信息 */}
        <div className={styles.footerBottom}>
          <div className={styles.footerCopy}>
            © {currentYear} <span>人工智能协会</span> · 党建文化平台 · All Rights Reserved
          </div>
          <div className={styles.footerSlogan}>★ 不忘初心 · 牢记使命</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
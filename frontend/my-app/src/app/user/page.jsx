'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Header from '../components/Header';
import Menu from '../components/Menu';
import styles from '../styles/UserPage.module.css';
import { getUserData, getUserTopics, changePassword } from '../utils/userUtils';
import { safeAlert, safeConfirm, showPasswordChangeDialog } from '../utils/dialogs';

export default function UserPage() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('personal');
    const [userData, setUserData] = useState({});
    const [topics, setTopics] = useState([]);

    // 切換選單
    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
        if (!isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    };

    // 關閉選單
    const closeMenu = () => {
        setIsMenuOpen(false);
        document.body.style.overflow = 'auto';
    };

    // 登出功能
    const logout = () => {
        safeConfirm('確定要登出嗎？', () => {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userData');
            closeMenu();
            window.location.href = '/';
        });
    };

    // 切換標籤頁
    const switchTab = (tabName) => {
        setActiveTab(tabName);
    };

    // 更改密碼
    const handleChangePassword = () => {
        showPasswordChangeDialog((oldPassword, newPassword) => {
            if (!oldPassword || !newPassword) return;
            
            const result = changePassword(oldPassword, newPassword);
            safeAlert(result.message);
        });
    };

    // 初始化數據
    useEffect(() => {
        // 確保在客戶端渲染時才執行
        if (typeof window !== 'undefined') {
            const user = getUserData();
            const userTopics = getUserTopics();
            setUserData(user);
            setTopics(userTopics);
        }
    }, []);

    // 鍵盤事件處理
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                closeMenu();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return (
        <>
            {/* 頭部 */}
            <Header 
                showMenu={true}
                isMenuOpen={isMenuOpen}
                onToggleMenu={toggleMenu}
            />

            {/* 主要內容 */}
            <section className={styles.userDashboard}>
                <div className={styles.dashboardContainer}>
                    {/* 個人資料欄 */}
                    <div className={styles.profileColumn}>
                        <div className={styles.profileCard}>
                            <Image 
                                src="/img/Vector-20.png" 
                                alt="Background" 
                                className={styles.profileBg}
                                fill
                                priority
                                sizes="(max-width: 768px) 100vw, 450px"
                                style={{ objectFit: 'cover' }}
                            />
                            
                            <header className={styles.profileHeader}>
                                <Image 
                                    src="/img/Vector-35.png" 
                                    alt="Chart Icon" 
                                    className={styles.profileIcon}
                                    width={75}
                                    height={60}
                                />
                                <h1 className={styles.profileName}>{userData.name}</h1>
                            </header>
                            
                            {/* 標籤頁容器 */}
                            <div className={styles.tabContainer}>
                                <button 
                                    className={`${styles.tabButton} ${activeTab === 'personal' ? styles.active : ''}`}
                                    onClick={() => switchTab('personal')}
                                >
                                    個人資料
                                </button>
                                <button 
                                    className={`${styles.tabButton} ${activeTab === 'familiarity' ? styles.active : ''}`}
                                    onClick={() => switchTab('familiarity')}
                                >
                                    熟悉度
                                </button>
                            </div>
                            
                            {/* 個人資料標籤頁 */}
                            <div className={`${styles.tabPanel} ${activeTab === 'personal' ? styles.active : ''}`}>
                                <div className={styles.personalInfo}>
                                    <div className={styles.infoItem}>
                                        <h3 className={styles.infoTitle}>電子郵件</h3>
                                        <p className={styles.infoContent}>{userData.email}</p>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <h3 className={styles.infoTitle}>註冊時間</h3>
                                        <p className={styles.infoContent}>{userData.registerDate}</p>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <h3 className={styles.infoTitle}>學習時數</h3>
                                        <p className={styles.infoContent}>{userData.studyHours}</p>
                                    </div>
                                    <button 
                                        className={styles.changePasswordBtn}
                                        onClick={handleChangePassword}
                                    >
                                        更改密碼
                                    </button>
                                </div>
                            </div>
                            
                            {/* 熟悉度標籤頁 */}
                            <div className={`${styles.tabPanel} ${activeTab === 'familiarity' ? styles.active : ''}`}>
                                <div className={styles.topicsList}>
                                    {topics.map((topic, index) => (
                                        <div key={index} className={styles.topicItem}>
                                            <h2 className={styles.topicTitle}>{topic.name}</h2>
                                            <div className={styles.progressContainer}>
                                                <span className={styles.progressLabel}>熟悉度：</span>
                                                <div className={styles.progressBar}>
                                                    <div 
                                                        className={styles.progress} 
                                                        style={{ width: `${topic.familiarity}%` }}
                                                    ></div>
                                                </div>
                                                <span className={styles.progressPercentage}>{topic.familiarity}%</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 訂閱方案欄 */}
                    <div className={styles.subscriptionColumn}>
                        <article className={styles.planCard}>
                            <div className={styles.planHeader + ' ' + styles.current}>目前方案</div>
                            <ul className={styles.featureList}>
                                <li className={styles.featureItem}>
                                    <Image src="/img/Vector-22.png" alt="Feature icon" width={20} height={20} loading="lazy" />
                                    <span>排行榜功能</span>
                                </li>
                                <li className={styles.featureItem}>
                                    <Image src="/img/Vector-22.png" alt="Feature icon" width={20} height={20} loading="lazy" />
                                    <span>免費生成10題</span>
                                </li>
                                <li className={styles.featureItem}>
                                    <Image src="/img/Vector-22.png" alt="Feature icon" width={20} height={20} loading="lazy" />
                                    <span>排行榜功能</span>
                                </li>
                                <li className={styles.featureItem}>
                                    <Image src="/img/Vector-22.png" alt="Feature icon" width={20} height={20} loading="lazy" />
                                    <span>免費生成10題</span>
                                </li>
                            </ul>
                        </article>

                        <article className={styles.planCard}>
                            <div className={styles.planHeader + ' ' + styles.upgrade}>升級PLUS</div>
                            <ul className={styles.featureList}>
                                <li className={styles.featureItem}>
                                    <Image src="/img/Vector-22.png" alt="Feature icon" width={20} height={20} loading="lazy" />
                                    <span>訂閱即享更多功能</span>
                                </li>
                                <li className={styles.featureItem}>
                                    <Image src="/img/Vector-22.png" alt="Feature icon" width={20} height={20} loading="lazy" />
                                    <span>30NTD/月</span>
                                </li>
                                <li className={styles.featureItem}>
                                    <Image src="/img/Vector-22.png" alt="Feature icon" width={20} height={20} loading="lazy" />
                                    <span>訂閱即享更多功能</span>
                                </li>
                                <li className={styles.featureItem}>
                                    <Image src="/img/Vector-22.png" alt="Feature icon" width={20} height={20} loading="lazy" />
                                    <span>30NTD/月</span>
                                </li>
                            </ul>
                        </article>
                    </div>
                </div>
            </section>

            {/* 選單 */}
            <Menu 
                isOpen={isMenuOpen}
                onClose={closeMenu}
                onLogout={logout}
            />
        </>
    );
}

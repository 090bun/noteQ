'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from '../styles/HomeGamePage.module.css';
import { safeAlert, safeConfirm } from '../utils/dialogs';
import Header from '../components/Header';
import { safeLogout } from '../utils/auth';
import Menu from '../components/Menu';

export default function HomeGamePage() {
    const [selectedDifficulty, setSelectedDifficulty] = useState(null);
    const [topic, setTopic] = useState('');
    const [questionCount, setQuestionCount] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // 難度選項配置
    const difficultyOptions = [
        { id: 'test', name: '測驗', icon: '/img/Vector-5.png', className: 'difficultyTest' },
        { id: 'master', name: '大師', icon: '/img/Vector-4.png', className: 'difficultyMaster' },
        { id: 'beginner', name: '初級', icon: '/img/Vector.png', className: 'difficultyBeginner' },
        { id: 'intermediate', name: '中級', icon: '/img/Vector-2.png', className: 'difficultyIntermediate' },
        { id: 'advanced', name: '高級', icon: '/img/Vector-3.png', className: 'difficultyAdvanced' }
    ];

    // 選擇難度
    const selectDifficulty = (difficultyId) => {
        setSelectedDifficulty(difficultyId);
    };

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

    // 開始挑戰
    const startChallenge = () => {
        if (!selectedDifficulty) {
            safeAlert('請選擇難度');
            return;
        }
        if (!topic.trim()) {
            safeAlert('請輸入主題');
            return;
        }
        if (!questionCount || questionCount < 1 || questionCount > 50) {
            safeAlert('請輸入有效的題數 (1-50)');
            return;
        }

        // 這裡可以導航到遊戲頁面，並傳遞參數
        console.log('開始挑戰:', {
            difficulty: selectedDifficulty,
            topic: topic,
            questionCount: questionCount
        });
        
        // 導航到遊戲頁面
        // router.push(`/game?difficulty=${selectedDifficulty}&topic=${encodeURIComponent(topic)}&count=${questionCount}`);
    };

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

    // 防止雙擊縮放
    useEffect(() => {
        const handleTouchStart = (event) => {
            const target = event.target;
            const isInteractiveElement = target.tagName === 'BUTTON' || 
                                        target.tagName === 'INPUT' || 
                                        target.tagName === 'TEXTAREA' || 
                                        target.tagName === 'SELECT' ||
                                        target.closest('.custom-select') ||
                                        target.closest('.menu-button') ||
                                        target.closest('.action-item');
            
            if (isInteractiveElement && event.touches.length > 1) {
                event.preventDefault();
            }
        };

        document.addEventListener('touchstart', handleTouchStart, { passive: false });
        return () => {
            document.removeEventListener('touchstart', handleTouchStart);
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
            <main id="game-select" className={styles.gameSelectSection}>
                <div className={styles.pageContainer}>
                    <input 
                        type="text" 
                        className={styles.topicInput} 
                        placeholder="輸入主題"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                    />

                    <div className={styles.difficultyHub}>
                        <Image 
                            src="/img/Vector-19.png" 
                            alt="Hub outline" 
                            className={styles.hubOutline}
                            width={600}
                            height={500}
                        />
                        <h2 className={styles.hubTitle}>難度選擇</h2>

                        {difficultyOptions.map((option) => (
                            <button
                                key={option.id}
                                className={`${styles.difficultyButton} ${styles[option.className]} ${
                                    selectedDifficulty === option.id ? styles.selected : ''
                                }`}
                                onClick={() => selectDifficulty(option.id)}
                            >
                                <Image 
                                    src={option.icon} 
                                    alt={option.name} 
                                    width={24} 
                                    height={24} 
                                />
                                <span>{option.name}</span>
                            </button>
                        ))}
                    </div>

                    <div className={styles.challengeStartForm}>
                        <input 
                            type="number" 
                            className={styles.questionCountInput} 
                            placeholder="輸入題數" 
                            min="1" 
                            max="50"
                            value={questionCount}
                            onChange={(e) => setQuestionCount(e.target.value)}
                        />
                        <button 
                            className={styles.startButton}
                            onClick={startChallenge}
                        >
                            <span>開始挑戰&nbsp;</span>
                            <Image src="/img/Vector-12.png" alt="Arrow right" width={12} height={12} />
                        </button>
                    </div>
                </div>
            </main>

            {/* 選單 */}
            <Menu 
                isOpen={isMenuOpen}
                onClose={closeMenu}
                onLogout={safeLogout}
            />
        </>
    );
} 
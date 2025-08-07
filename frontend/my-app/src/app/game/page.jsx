'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from '../styles/GamePage.module.css';
import { safeAlert, safeConfirm } from '../utils/dialogs';
import Header from '../components/Header';
import Menu from '../components/Menu';


const Game = () => {
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showCompleteButton, setShowCompleteButton] = useState(false);
  const totalQuestions = 5;
  const progressPercent = (currentQuestion / totalQuestions) * 100;
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
        // 使用安全的確認對話框
        safeConfirm('確定要登出嗎？', 
            () => {
                // 清除登入狀態
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('userData');
                
                // 關閉選單
                closeMenu();
                
                // 跳轉到首頁
                window.location.href = '/';
            },
            () => {
                // 取消登出，不做任何操作
            }
        );
    };
  const options = [
    'A 10個',
    'B 17個',
    'C 13個',
    'D 20個'
  ];

const handleOptionClick = (index) => {
  setSelectedOption(index);
  
  if (currentQuestion === totalQuestions) {
    setShowCompleteButton(true);
    return;
  }

  setTimeout(() => {
    setCurrentQuestion(prev => prev + 1);
    setSelectedOption(null); // 清除前一題的選擇樣式
  }, 300); // 0.3 秒延遲，讓選擇樣式有時間顯示
};

// 完成挑戰處理函數
const handleCompleteChallenge = () => {
  window.location.href = '/gameover';
};


  return (
  <>
                <Header 
                    showMenu={true}
                    isMenuOpen={isMenuOpen}
                    onToggleMenu={toggleMenu}
                />
               <Menu 
                    isOpen={isMenuOpen}
                    onClose={closeMenu}
                    onLogout={logout}
                />

    <main className={styles.gameMain}>
      <div className={styles.questionContainer}>
        <h2 className={styles.questionNumber}>第 {currentQuestion} 題 / {totalQuestions}</h2>

        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>

        <p className={styles.questionText}>
          判斷101-200之間有多少個質數,並輸出所有質數
        </p>

        <div className={styles.gameSection}>
          {/* 回上一題按鈕 */}
          {currentQuestion > 1 && (
            <div
              className={styles.backButton}
              onClick={() => {
                setCurrentQuestion((prev) => prev - 1);
                setSelectedOption(null);
              }}
            >
              <Image
                src="/img/Vector-9.png"
                alt="Back"
                width={14}
                height={14}
              />
              <span className={styles.backText}>回上一題</span>
            </div>
          )}

          <div className={styles.answerGrid}>
            {options.map((option, index) => (
              <div
                key={index}
                className={`${styles.answerOption} ${selectedOption === index ? styles.selected : ''}`}
                onClick={() => handleOptionClick(index)}
              >
                {option}
              </div>
            ))}
          </div>

          {/* 完成挑戰按鈕 - 只在最後一題且選擇完後顯示 */}
          {currentQuestion === totalQuestions && showCompleteButton && (
            <div className={styles.completeButtonContainer}>
              <button 
                className={styles.completeButton}
                onClick={handleCompleteChallenge}
              >
                完成挑戰
              </button>
            </div>
          )}
        </div>

      </div>
    </main>
  </>
);

};

export default Game;

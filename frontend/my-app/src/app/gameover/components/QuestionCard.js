'use client';
// 單個問題卡片組件 - 顯示題目詳情、答案狀態和操作按鈕（收藏/分析）

import Image from 'next/image';

export default function QuestionCard({ number, question, onOpenFavoriteModal, onOpenAnalysis, styles }) {
  return (
    <article className={styles['question-card']} data-question={number}>
      <header className={styles['card-header']}>
        <h3 className={styles['card-title']}>題目詳情</h3>
        <div className={`${styles['status-tag']} ${styles[question.status]}`}>
          {question.status === 'correct' ? '✓ 正確' : 'x 錯誤'}
        </div>
      </header>
      <div className={styles['card-body']}>
        <p className="question-number">第 {number} 題</p>
        <p className="question-text">題目: {question.question}</p>
        <p className="answer-text">您的答案: {question.userAnswer}</p>
        <p className="answer-text">正確答案: {question.correctAnswer}</p>
      </div>
      <footer className={styles['card-actions']}>
        <button className={`${styles['action-btn']} ${styles['btn-favorite']}`} onClick={onOpenFavoriteModal}>
          <Image src="/img/Vector-11.png" alt="" width={15} height={15} />
          <span>收藏</span>
        </button>
        <button className={`${styles['action-btn']} ${styles['btn-analysis']}`} onClick={onOpenAnalysis}>
          <Image src="/img/Vector-10.png" alt="" width={15} height={15} />
          <span>解析</span>
        </button>
      </footer>
    </article>
  );
} 
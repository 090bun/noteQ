'use client';
// 遊戲結果摘要卡片組件 - 顯示總分、正確題數等遊戲統計資訊

export default function ResultsCard({ styles }) {
  return (
    <div id="results" className={styles['results-section']}>
      <div className="container">
        <div className={styles['results-card']}>
          <h2 className={styles['results-title']}>挑戰結果</h2>
          <p className={styles['results-summary']}>答對題數3/5<br />熟悉度：5.0%</p>
        </div>
      </div>
    </div>
  );
}
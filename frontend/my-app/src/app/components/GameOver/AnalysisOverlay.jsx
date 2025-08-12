"use client";
// AI 解析側邊欄組件 - 提供題目解析對話介面，支援與 AI 互動討論

import { useState, useEffect } from "react";
import Image from "next/image";

export default function AnalysisOverlay({
  isOpen,
  onClose,
  onOpenAnalysisFavoriteModal,
  onOpenAnalysisFullFavoriteModal,
  styles,
  topicIndex,
}) {
  const [inputValue, setInputValue] = useState("");
  const [currentTopic, setCurrentTopic] = useState(null);

  useEffect(() => {
    if (!isOpen || topicIndex == null) return;
    const raw = sessionStorage.getItem("quizData");
    if (!raw) return;
    const data = JSON.parse(raw);
    if (Array.isArray(data.topics) && data.topics[topicIndex]) {
      setCurrentTopic(data.topics[topicIndex]);
    }
  }, [isOpen, topicIndex]);

  const handleSend = () => {
    if (inputValue.trim()) {
      // 處理發送邏輯
      console.log("發送:", inputValue);
      setInputValue("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <>
      <div
        className={`${styles["overlay-backdrop"]} ${
          isOpen ? styles.active : ""
        }`}
        onClick={onClose}
      />

      <div
        className={`${styles["analysis-overlay"]} ${
          isOpen ? styles.active : ""
        }`}
      >
        <div className={styles["analysis-header"]}>
          <h2 className={styles["analysis-title"]}>解析</h2>
          <button className={styles["close-btn"]} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles["analysis-content"]}>
          <div className={styles["chat-messages"]}>
            <div className={`${styles.message} ${styles.ai}`}>
              {currentTopic?.explanation_text || "正在載入解析..."}
            </div>
            <div className={`${styles.message} ${styles.ai}`}>
              {"對於題目：" + (currentTopic?.title || "") + "還有什麼問題嗎？"}{" "}
            </div>
            <div className={`${styles.message} ${styles.user}`}>
              你打的問題會在這裡
            </div>
            <div className={`${styles.message} ${styles.placeholder}`}>
              <div
                className={styles["placeholder-icon"]}
                onClick={onOpenAnalysisFavoriteModal}
              >
                +
              </div>
              AI的回答在這裡
            </div>
          </div>
        </div>

        <div className={styles["analysis-input"]}>
          <span
            className={styles["add-icon"]}
            onClick={onOpenAnalysisFullFavoriteModal}
          >
            +
          </span>
          <input
            type="text"
            className={styles["input-field"]}
            placeholder="輸入問題"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button className={styles["send-btn"]} onClick={handleSend}>
            <span>→</span>
          </button>
        </div>
      </div>
    </>
  );
}

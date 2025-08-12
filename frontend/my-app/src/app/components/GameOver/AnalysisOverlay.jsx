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
  const [messages, setMessages] = useState([]); // 動態對話訊息
  const [isLoading, setIsLoading] = useState(false); // 送出後等待回覆

  useEffect(() => {
    if (!isOpen || topicIndex == null) return;
    const raw = sessionStorage.getItem("quizData");
    if (!raw) return;
    const data = JSON.parse(raw);
    if (Array.isArray(data.topics) && data.topics[topicIndex]) {
      setCurrentTopic(data.topics[topicIndex]);
    }
  }, [isOpen, topicIndex]);

  // 處理訊息發送
  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text || isLoading) return;

    // 先把使用者訊息推到畫面
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInputValue("");
    setIsLoading(true);

    try {
      // 依後端調整這個路徑
      const API_URL = "http://127.0.0.1:8000/api/chat/";

      // 取得 sessionStorge 資料
      const quizData = JSON.parse(sessionStorage.getItem("quizData"));
      const sender = quizData.quiz.user.username;

      // 若有 token，會自動帶上
      const token = localStorage.getItem("token");

      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          // 送到後端的基本欄位（可依需求擴充）
          user_id: localStorage.getItem("userId") || null,
          message: text,
          sender: sender,
          topic_id: currentTopic?.id ?? null,
        }),
      });

      const data = await res.json();

      // 兼容 data.ai-response.content / data.ai_response.content / data.content
      const aiText =
        data?.ai_response?.content ??
        data?.["ai-response"]?.content ??
        data?.content ??
        "（沒有收到 AI 內容）";

      setMessages((prev) => [...prev, { role: "ai", content: aiText }]);
    } catch (err) {
      console.error("AI 論述請求失敗：", err);
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "抱歉，伺服器忙碌或發生錯誤，稍後再試。" },
      ]);
    } finally {
      setIsLoading(false);
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

            {messages.length === 0 ? (
              <>
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
              </>
            ) : (
              <>
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`${styles.message} ${
                      m.role === "user" ? styles.user : styles.ai
                    }`}
                  >
                    {m.content}
                  </div>
                ))}
                {isLoading && (
                  <div className={`${styles.message} ${styles.placeholder}`}>
                    正在思考中…
                  </div>
                )}
              </>
            )}
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

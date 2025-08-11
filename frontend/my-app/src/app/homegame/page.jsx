"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "../styles/HomeGamePage.module.css";
import { safeAlert, safeConfirm } from "../utils/dialogs";
import Header from "../components/Header";
import { safeLogout } from "../utils/auth";
import Menu from "../components/Menu";

export default function HomeGamePage() {
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [topic, setTopic] = useState("");
  const [questionCount, setQuestionCount] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 初始化路由器
  const router = useRouter();

  // 難度選項配置
  const difficultyOptions = [
    {
      id: "test",
      name: "測驗",
      icon: "/img/Vector-5.png",
      className: "difficultyTest",
    },
    {
      id: "master",
      name: "大師",
      icon: "/img/Vector-4.png",
      className: "difficultyMaster",
    },
    {
      id: "beginner",
      name: "初級",
      icon: "/img/Vector.png",
      className: "difficultyBeginner",
    },
    {
      id: "intermediate",
      name: "中級",
      icon: "/img/Vector-2.png",
      className: "difficultyIntermediate",
    },
    {
      id: "advanced",
      name: "高級",
      icon: "/img/Vector-3.png",
      className: "difficultyAdvanced",
    },
  ];

  // 選擇難度
  const selectDifficulty = (difficultyId) => {
    setSelectedDifficulty(difficultyId);
  };

  // 切換選單
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (!isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  };

  // 關閉選單
  const closeMenu = () => {
    setIsMenuOpen(false);
    document.body.style.overflow = "auto";
  };

  // 開始挑戰
  const startChallenge = async () => {
    const validDifficulties = ["advanced", "intermediate"];

    if (!selectedDifficulty) {
      safeAlert("請選擇難度");
      return;
    }

    if (!topic.trim()) {
      safeAlert("請輸入主題");
      return;
    }

    const count = parseInt(questionCount, 10);
    if (!count || count < 1 || count > 3) {
      safeAlert("請輸入有效的題數（1~3 題）");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      safeAlert("請先登入再開始挑戰");
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/api/quiz/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: localStorage.getItem("userId"),
          topic: topic.trim(),
          difficulty: selectedDifficulty,
          question_count: count,
        }),
      });

      if (!res.ok) {
        throw new Error("後端回傳錯誤");
      }

      const result = await res.json();
      console.log("題目已送出，回傳結果:", result);
      sessionStorage.setItem(
        "quizData",
        JSON.stringify({
          quiz: result.quiz, // 單題形式
          topics: result.topics || [], // 多題陣列形式
          question_count: count, // 設定題數
        })
      );
      router.push("/game"); // 跳轉至 game 頁面
    } catch (err) {
      console.error("發送題目失敗:", err);
      safeAlert("題目發送失敗，請稍後再試");
    }
  };

  // 鍵盤事件處理
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // 防止雙擊縮放
  useEffect(() => {
    const handleTouchStart = (event) => {
      const target = event.target;
      const isInteractiveElement =
        target.tagName === "BUTTON" ||
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.closest(".custom-select") ||
        target.closest(".menu-button") ||
        target.closest(".action-item");

      if (isInteractiveElement && event.touches.length > 1) {
        event.preventDefault();
      }
    };

    document.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
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
                className={`${styles.difficultyButton} ${
                  styles[option.className]
                } ${selectedDifficulty === option.id ? styles.selected : ""}`}
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
            <button className={styles.startButton} onClick={startChallenge}>
              <span>開始挑戰&nbsp;</span>
              <Image
                src="/img/Vector-12.png"
                alt="Arrow right"
                width={12}
                height={12}
              />
            </button>
          </div>
        </div>
      </main>

      {/* 選單 */}
      <Menu isOpen={isMenuOpen} onClose={closeMenu} onLogout={safeLogout} />
    </>
  );
}

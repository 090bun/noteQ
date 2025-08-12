"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "../styles/GamePage.module.css";
import { safeAlert, safeConfirm } from "../utils/dialogs";
import Header from "../components/Header";
import Menu from "../components/Menu";
import { safeLogout } from "../utils/auth";

const Game = () => {
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showCompleteButton, setShowCompleteButton] = useState(false);
  const [totalQuestions, setTotalQuestions] = useState(1);
  const [quizData, setQuizData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 初始化資料
  useEffect(() => {
    const data = sessionStorage.getItem("quizData");
    if (data) {
      try {
        const parsed = JSON.parse(data);
        //console.log(data)
        setQuizData(parsed.quiz || {});
        setQuestions(parsed.topics || []);
        //console.log(parsed.topics)
        setTotalQuestions(parsed.question_count || 1);
      } catch (err) {
        console.error("解析 quizData 失敗：", err);
      }
    } else {
      window.location.href = "/";
    }
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    document.body.style.overflow = !isMenuOpen ? "hidden" : "auto";
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    document.body.style.overflow = "auto";
  };

  const handleOptionClick = (index) => {
    const currentTopic = questions[currentQuestion - 1];
    const optionLetter = ["A", "B", "C", "D"][index];
    
    setUserAnswers((prev) => [
      ...prev,
      {
        topicId: currentTopic.id,
        selected: optionLetter,
      },
    ]);

    setSelectedOption(index);

    if (currentQuestion === totalQuestions) {
      setShowCompleteButton(true);
      return;
    }

    setTimeout(() => {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedOption(null);
    }, 300);
  };

  const handleCompleteChallenge = () => {
    sessionStorage.setItem("userAnswers", JSON.stringify(userAnswers));
    window.location.href = "/gameover";
  };

  const options = questions.length
    ? [
        `A ${questions[currentQuestion - 1]?.option_A}`,
        `B ${questions[currentQuestion - 1]?.option_B}`,
        `C ${questions[currentQuestion - 1]?.option_C}`,
        `D ${questions[currentQuestion - 1]?.option_D}`,
      ]
    : [];

  const progressPercent = (currentQuestion / totalQuestions) * 100;

  return (
    <>
      <Header
        showMenu={true}
        isMenuOpen={isMenuOpen}
        onToggleMenu={toggleMenu}
      />
      <Menu isOpen={isMenuOpen} onClose={closeMenu} onLogout={safeLogout} />

      <main className={styles.gameMain}>
        <div className={styles.questionContainer}>
          <h2 className={styles.questionNumber}>
            第 {currentQuestion} 題 / {totalQuestions} 題
          </h2>

          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>

          <p className={styles.questionText}>
            {questions[currentQuestion - 1]?.title || "題目載入中..."}
          </p>

          <div className={styles.gameSection}>
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
                  className={`${styles.answerOption} ${
                    selectedOption === index ? styles.selected : ""
                  }`}
                  onClick={() => handleOptionClick(index)}
                >
                  {option}
                </div>
              ))}
            </div>

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

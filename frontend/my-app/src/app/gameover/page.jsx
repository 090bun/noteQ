"use client";

import { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import Menu from "../components/Menu";
import ResultsCard from "../components/GameOver/ResultsCard";
import QuestionsGrid from "../components/GameOver/QuestionsGrid";
import AnalysisOverlay from "../components/GameOver/AnalysisOverlay";
import FavoriteModal from "../components/GameOver/FavoriteModal";
import AnalysisFavoriteModal from "../components/GameOver/AnalysisFavoriteModal";
import AnalysisFullFavoriteModal from "../components/GameOver/AnalysisFullFavoriteModal";
import CustomAlertModal from "../components/GameOver/CustomAlertModal";
import CustomPromptModal from "../components/GameOver/CustomPromptModal";
import { useGameoverUtils } from "./hooks/useGameoverUtils";
import styles from "../styles/GameOverPage.module.css";
import { safeLogout } from "../utils/auth";

export default function GameOverPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [isFavoriteModalOpen, setIsFavoriteModalOpen] = useState(false);
  const [isAnalysisFavoriteModalOpen, setIsAnalysisFavoriteModalOpen] =
    useState(false);
  const [isAnalysisFullFavoriteModalOpen, setIsAnalysisFullFavoriteModalOpen] =
    useState(false);
  const [isCustomAlertOpen, setIsCustomAlertOpen] = useState(false);
  const [isCustomPromptOpen, setIsCustomPromptOpen] = useState(false);
  const [customAlertMessage, setCustomAlertMessage] = useState("");
  const [customPromptTitle, setCustomPromptTitle] = useState("");
  const [customPromptCallback, setCustomPromptCallback] = useState(null);
  const [currentQuestionData, setCurrentQuestionData] = useState(null);
  // gameover 資料狀態
  const [quizMeta, setQuizMeta] = useState(null); // 測驗基本資訊（quiz.id / quiz_topic / created_at...）
  const [questions, setQuestions] = useState([]); // 視圖用的「每題資料」陣列（整合題目＋作答＋對錯）
  const [userAnswers, setUserAnswers] = useState([]); // 使用者作答
  const [stats, setStats] = useState({
    // 成績摘要
    total: 0,
    correct: 0,
    wrong: 0,
    accuracy: 0,
  });

  const {
    questionData,
    subjects,
    notes,
    isPlusSubscribed,
    checkPlusSubscription,
    showUpgradeAlert,
    addNoteToSystem,
    showCustomAlert,
    showCustomPrompt,
    parseMarkdown,
    updateContentPreview,
  } = useGameoverUtils();

  const handleToggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleCloseMenu = () => {
    setIsMenuOpen(false);
  };

  const handleOpenAnalysis = () => {
    if (!checkPlusSubscription()) {
      showUpgradeAlert();
      return;
    }
    setIsAnalysisOpen(true);
  };

  const handleCloseAnalysis = () => {
    setIsAnalysisOpen(false);
  };

  const handleOpenFavoriteModal = (questionNumber) => {
    if (!checkPlusSubscription()) {
      showUpgradeAlert();
      return;
    }

    const question = questionData[questionNumber];
    if (question) {
      setCurrentQuestionData({
        number: questionNumber,
        ...question,
      });
      setIsFavoriteModalOpen(true);
    }
  };

  const handleCloseFavoriteModal = () => {
    setIsFavoriteModalOpen(false);
    setCurrentQuestionData(null);
  };

  const handleOpenAnalysisFavoriteModal = () => {
    if (!checkPlusSubscription()) {
      showUpgradeAlert();
      return;
    }
    setIsAnalysisFavoriteModalOpen(true);
  };

  const handleCloseAnalysisFavoriteModal = () => {
    setIsAnalysisFavoriteModalOpen(false);
  };

  const handleOpenAnalysisFullFavoriteModal = () => {
    if (!checkPlusSubscription()) {
      showUpgradeAlert();
      return;
    }
    setIsAnalysisFullFavoriteModalOpen(true);
  };

  const handleCloseAnalysisFullFavoriteModal = () => {
    setIsAnalysisFullFavoriteModalOpen(false);
  };

  const handleShowCustomAlert = (message) => {
    setCustomAlertMessage(message);
    setIsCustomAlertOpen(true);
  };

  const handleCloseCustomAlert = () => {
    setIsCustomAlertOpen(false);
  };

  const handleShowCustomPrompt = (title, callback) => {
    setCustomPromptTitle(title);
    setCustomPromptCallback(() => callback);
    setIsCustomPromptOpen(true);
  };

  const handleCloseCustomPrompt = () => {
    setIsCustomPromptOpen(false);
    if (customPromptCallback) {
      customPromptCallback(null);
    }
  };

  const handleConfirmCustomPrompt = (value) => {
    setIsCustomPromptOpen(false);
    if (customPromptCallback) {
      customPromptCallback(value);
    }
  };

  // 把 topics + userAnswers 合併成畫面要用的資料，並計算成績
  const buildViewModel = (topics = [], answers = []) => {
    const answerMap = new Map(answers.map((a) => [a.topicId, a.selected])); // topicId -> "A|B|C|D"
    const merged = topics.map((t, i) => {
      const userSelected = answerMap.get(t.id) ?? null;
      const isCorrect = userSelected ? userSelected === t.Ai_answer : false;
      return {
        number: i + 1,
        id: t.id,
        title: t.title,
        options: { A: t.option_A, B: t.option_B, C: t.option_C, D: t.option_D },
        aiAnswer: t.Ai_answer,
        userSelected,
        isCorrect,
        status: isCorrect ? 'correct' : 'wrong'
      };
    });
    const correct = merged.filter((q) => q.isCorrect).length;
    const total = merged.length;
    const wrong = total - correct;
    const accuracy = total ? Math.round((correct / total) * 100) : 0;
    return { merged, summary: { total, correct, wrong, accuracy } };
  };

  // 將工具函數暴露給全域
  useEffect(() => {
    window.showCustomAlert = handleShowCustomAlert;
    window.showGameoverCustomPrompt = handleShowCustomPrompt;
    window.addNoteToSystem = addNoteToSystem;
    window.parseMarkdown = parseMarkdown;
    window.updateContentPreview = updateContentPreview;
    window.subjects = subjects;
    window.notes = notes;

    return () => {
      delete window.showCustomAlert;
      delete window.showGameoverCustomPrompt;
      delete window.addNoteToSystem;
      delete window.parseMarkdown;
      delete window.updateContentPreview;
      delete window.subjects;
      delete window.notes;
    };
  }, [
    handleShowCustomAlert,
    handleShowCustomPrompt,
    addNoteToSystem,
    parseMarkdown,
    updateContentPreview,
    subjects,
    notes,
  ]);

  // 載入 sessionStorage 並初始化頁面資料
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("quizData");
      const rawAns = sessionStorage.getItem("userAnswers");
      if (!raw || !rawAns) {
        console.warn("找不到 quizData 或 userAnswers，將導回首頁");
        // 如需強制導回可打開下一行
        // window.location.href = '/';
        return;
      }

      const { quiz, topics, question_count } = JSON.parse(raw);
      const answers = JSON.parse(rawAns) ?? [];

      setQuizMeta(quiz ?? null);
      setUserAnswers(answers);

      const { merged, summary } = buildViewModel(topics ?? [], answers);
      setQuestions(merged);

      // total 以 question_count 優先，沒有就用 merged.length
      setStats({
        total: Number.isFinite(question_count) ? question_count : merged.length,
        correct: summary.correct,
        wrong: summary.wrong,
        accuracy: summary.accuracy,
      });

      // 檢查用（不影響畫面）
      console.log("quizMeta:", quiz);
      console.log("questions:", merged);
      console.log("stats:", {
        total: Number.isFinite(question_count) ? question_count : merged.length,
        ...summary,
      });
    } catch (e) {
      console.error("初始化 gameover 資料失敗：", e);
    }
  }, []);

  return (
    <>
      <Header
        showMenu={true}
        isMenuOpen={isMenuOpen}
        onToggleMenu={handleToggleMenu}
      />

      <main>
        <ResultsCard quiz={quizMeta} stats={stats} styles={styles} />{" "}
        <QuestionsGrid
          questionData={questions}
          onOpenFavoriteModal={handleOpenFavoriteModal}
          onOpenAnalysis={handleOpenAnalysis}
          styles={styles}
          isPlusSubscribed={isPlusSubscribed}
        />
      </main>

      <Menu
        isOpen={isMenuOpen}
        onClose={handleCloseMenu}
        onLogout={safeLogout}
      />

      <AnalysisOverlay
        isOpen={isAnalysisOpen}
        onClose={handleCloseAnalysis}
        onOpenAnalysisFavoriteModal={handleOpenAnalysisFavoriteModal}
        onOpenAnalysisFullFavoriteModal={handleOpenAnalysisFullFavoriteModal}
        styles={styles}
      />

      <FavoriteModal
        isOpen={isFavoriteModalOpen}
        onClose={handleCloseFavoriteModal}
        questionData={currentQuestionData}
        subjects={subjects}
        notes={notes}
        onShowCustomAlert={handleShowCustomAlert}
        onShowCustomPrompt={handleShowCustomPrompt}
        styles={styles}
      />

      <AnalysisFavoriteModal
        isOpen={isAnalysisFavoriteModalOpen}
        onClose={handleCloseAnalysisFavoriteModal}
        subjects={subjects}
        notes={notes}
        onShowCustomAlert={handleShowCustomAlert}
        onShowCustomPrompt={handleShowCustomPrompt}
        styles={styles}
      />

      <AnalysisFullFavoriteModal
        isOpen={isAnalysisFullFavoriteModalOpen}
        onClose={handleCloseAnalysisFullFavoriteModal}
        subjects={subjects}
        notes={notes}
        onShowCustomAlert={handleShowCustomAlert}
        onShowCustomPrompt={handleShowCustomPrompt}
        styles={styles}
      />

      <CustomAlertModal
        isOpen={isCustomAlertOpen}
        message={customAlertMessage}
        onClose={handleCloseCustomAlert}
        styles={styles}
      />

      <CustomPromptModal
        isOpen={isCustomPromptOpen}
        title={customPromptTitle}
        onClose={handleCloseCustomPrompt}
        onConfirm={handleConfirmCustomPrompt}
        styles={styles}
      />
    </>
  );
}

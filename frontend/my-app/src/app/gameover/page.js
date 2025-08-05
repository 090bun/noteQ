'use client';

import { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import Menu from '../components/Menu';
import ResultsCard from './components/ResultsCard';
import QuestionsGrid from './components/QuestionsGrid';
import AnalysisOverlay from './components/AnalysisOverlay';
import FavoriteModal from './components/FavoriteModal';
import AnalysisFavoriteModal from './components/AnalysisFavoriteModal';
import AnalysisFullFavoriteModal from './components/AnalysisFullFavoriteModal';
import CustomAlertModal from './components/CustomAlertModal';
import CustomPromptModal from './components/CustomPromptModal';
import { useGameoverUtils } from './hooks/useGameoverUtils';
import styles from '../styles/GameOverPage.module.css';

export default function GameOverPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [isFavoriteModalOpen, setIsFavoriteModalOpen] = useState(false);
  const [isAnalysisFavoriteModalOpen, setIsAnalysisFavoriteModalOpen] = useState(false);
  const [isAnalysisFullFavoriteModalOpen, setIsAnalysisFullFavoriteModalOpen] = useState(false);
  const [isCustomAlertOpen, setIsCustomAlertOpen] = useState(false);
  const [isCustomPromptOpen, setIsCustomPromptOpen] = useState(false);
  const [customAlertMessage, setCustomAlertMessage] = useState('');
  const [customPromptTitle, setCustomPromptTitle] = useState('');
  const [customPromptCallback, setCustomPromptCallback] = useState(null);
  const [currentQuestionData, setCurrentQuestionData] = useState(null);

  const {
    questionData,
    subjects,
    notes,
    addNoteToSystem,
    showCustomAlert,
    showCustomPrompt,
    parseMarkdown,
    updateContentPreview
  } = useGameoverUtils();

  const handleToggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleCloseMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    // 登出邏輯
    console.log('登出');
  };

  const handleOpenAnalysis = () => {
    setIsAnalysisOpen(true);
  };

  const handleCloseAnalysis = () => {
    setIsAnalysisOpen(false);
  };

  const handleOpenFavoriteModal = (questionNumber) => {
    const question = questionData[questionNumber];
    if (question) {
      setCurrentQuestionData({
        number: questionNumber,
        ...question
      });
      setIsFavoriteModalOpen(true);
    }
  };

  const handleCloseFavoriteModal = () => {
    setIsFavoriteModalOpen(false);
    setCurrentQuestionData(null);
  };

  const handleOpenAnalysisFavoriteModal = () => {
    setIsAnalysisFavoriteModalOpen(true);
  };

  const handleCloseAnalysisFavoriteModal = () => {
    setIsAnalysisFavoriteModalOpen(false);
  };

  const handleOpenAnalysisFullFavoriteModal = () => {
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
  }, [handleShowCustomAlert, handleShowCustomPrompt, addNoteToSystem, parseMarkdown, updateContentPreview, subjects, notes]);

  return (
    <>
      <Header 
        showMenu={true}
        isMenuOpen={isMenuOpen}
        onToggleMenu={handleToggleMenu}
      />
      
      <main>
        <ResultsCard styles={styles} />
        <QuestionsGrid 
          questionData={questionData}
          onOpenFavoriteModal={handleOpenFavoriteModal}
          onOpenAnalysis={handleOpenAnalysis}
          styles={styles}
        />
      </main>

      <Menu 
        isOpen={isMenuOpen}
        onClose={handleCloseMenu}
        onLogout={handleLogout}
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

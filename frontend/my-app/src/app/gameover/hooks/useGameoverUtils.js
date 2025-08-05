'use client';
// 遊戲結束頁面工具 Hook - 提供題目資料管理、筆記操作、Markdown 解析等核心功能

import { useState, useEffect } from 'react';

export function useGameoverUtils() {
  // 題目數據（模擬從遊戲結果中獲取）
  const [questionData] = useState({
    1: {
      question: "判斷101-200之間有多少個質數並輸出所有質數",
      userAnswer: "A10個",
      correctAnswer: "B17個",
      status: "incorrect"
    },
    2: {
      question: "計算1到100的和",
      userAnswer: "5050",
      correctAnswer: "5050",
      status: "correct"
    },
    3: {
      question: "求斐波那契數列第10項",
      userAnswer: "34",
      correctAnswer: "55",
      status: "incorrect"
    },
    4: {
      question: "判斷一個數是否為回文數",
      userAnswer: "是",
      correctAnswer: "是",
      status: "correct"
    },
    5: {
      question: "求最大公約數",
      userAnswer: "6",
      correctAnswer: "12",
      status: "incorrect"
    }
  });

  const [subjects, setSubjects] = useState(["數學", "英文", "程式設計", "物理"]);
  const [notes, setNotes] = useState([]);

  // 簡單的Markdown解析函數
  const parseMarkdown = (text) => {
    return text
      // 標題
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // 粗體
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // 斜體
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // 程式碼
      .replace(/`(.*?)`/g, '<code>$1</code>')
      // 列表
      .replace(/^- (.*$)/gim, '<li>$1</li>')
      // 分隔線
      .replace(/^---$/gim, '<hr>')
      // 換行
      .replace(/\n/g, '<br>');
  };

  // 更新內容預覽
  const updateContentPreview = (textareaId, previewId) => {
    const textarea = document.getElementById(textareaId);
    const preview = document.getElementById(previewId);
    
    if (textarea && preview) {
      const content = textarea.value;
      const parsedContent = parseMarkdown(content);
      preview.innerHTML = parsedContent;
    }
  };

  // 添加筆記到系統
  const addNoteToSystem = (note) => {
    try {
      // 檢查是否已經存在相同的筆記（基於內容和主題）
      const existingNote = notes.find(n => 
        n.content.includes(note.content.split('\n')[0]) && 
        n.subject === note.subject
      );
      
      if (existingNote) {
        if (window.showCustomAlert) {
          window.showCustomAlert('此內容已經收藏過了！');
        }
        return;
      }
      
      // 添加新筆記
      setNotes(prevNotes => [...prevNotes, note]);
      
      // 同步主題數據
      if (!subjects.includes(note.subject)) {
        setSubjects(prevSubjects => [...prevSubjects, note.subject]);
      }
      
    } catch (error) {
      console.error('添加筆記失敗:', error);
      if (window.showCustomAlert) {
        window.showCustomAlert('保存失敗，請重試！');
      }
    }
  };

  // 顯示自定義提示
  const showCustomAlert = (message) => {
    if (window.showCustomAlert) {
      window.showCustomAlert(message);
    }
  };

  // 顯示自定義輸入
  const showCustomPrompt = (title, callback) => {
    if (window.showGameoverCustomPrompt) {
      window.showGameoverCustomPrompt(title, callback);
    }
  };

  return {
    questionData,
    subjects,
    notes,
    addNoteToSystem,
    showCustomAlert,
    showCustomPrompt,
    parseMarkdown,
    updateContentPreview
  };
} 
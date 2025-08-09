'use client';
// 題目收藏模態框組件 - 允許用戶將題目收藏到指定的筆記本中

import { useState, useEffect } from 'react';
import Image from 'next/image';
import SubjectSelector from './SubjectSelector';
import NoteSelector from './NoteSelector';
import ContentEditor from './ContentEditor';

export default function FavoriteModal({ 
  isOpen, 
  onClose, 
  questionData, 
  subjects, 
  notes, 
  onShowCustomAlert, 
  onShowCustomPrompt,
  styles
}) {
  const [currentSubject, setCurrentSubject] = useState('數學');
  const [currentNoteId, setCurrentNoteId] = useState(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [questionContent, setQuestionContent] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(true);

  useEffect(() => {
    if (isOpen && questionData) {
      const content = `# ${questionData.question}

**您的答案：** ${questionData.userAnswer}
**正確答案：** ${questionData.correctAnswer}`;
      setQuestionContent(content);
      setNoteTitle(`收藏題目 - 第${questionData.number}題`);
      
      // 重置選擇器
      setCurrentSubject('數學');
      setCurrentNoteId(null);
    }
  }, [isOpen, questionData]);

  const handleConfirm = () => {
    if (!questionData) {
      onShowCustomAlert('沒有要收藏的題目數據！');
      return;
    }

    try {
      if (currentNoteId === 'add_note' || currentNoteId === null) {
        // 新增筆記
        const userTitle = noteTitle.trim();
        const finalTitle = userTitle || `收藏題目 - 第${questionData.number}題`;

        const newNote = {
          id: Date.now(),
          title: finalTitle,
          content: questionContent,
          subject: currentSubject
        };

        if (window.addNoteToSystem) {
          window.addNoteToSystem(newNote);
        }

        onShowCustomAlert(`題目已收藏到「${currentSubject}」主題！`);
      } else {
        // 添加到現有筆記
        const targetNote = notes.find(note => note.id === currentNoteId);
        
        if (targetNote) {
          const updatedContent = `${targetNote.content}

---

## 新增題目

${questionContent}`;

          targetNote.content = updatedContent;
          
          onShowCustomAlert(`題目已添加到筆記「${targetNote.title}」中！`);
        } else {
          onShowCustomAlert('找不到選中的筆記！');
          return;
        }
      }

      onClose();
    } catch (error) {
      console.error('收藏失敗:', error);
      onShowCustomAlert('收藏失敗，請重試！');
    }
  };

  const filteredNotes = notes.filter(note => note.subject === currentSubject);

  return (
    <div className={`${styles['favorite-modal']} ${isOpen ? styles.active : ''}`}>
      <div className={styles['favorite-modal-content']}>
        <div className={styles['favorite-modal-header']}>
          <h2 className={styles['favorite-modal-title']}>收藏題目</h2>
          <button className={styles['favorite-modal-close']} onClick={onClose}>×</button>
        </div>
        
        <div className={styles['favorite-modal-body']}>
          <div className={styles['favorite-question-info']}>
            <h3>題目內容</h3>
            <ContentEditor
              content={questionContent}
              onChange={setQuestionContent}
              isPreviewMode={isPreviewMode}
              onTogglePreview={() => setIsPreviewMode(!isPreviewMode)}
              styles={styles}
            />
          </div>
          
          <SubjectSelector
            subjects={subjects}
            currentSubject={currentSubject}
            onSubjectChange={setCurrentSubject}
            onShowCustomPrompt={onShowCustomPrompt}
            onShowCustomAlert={onShowCustomAlert}
            styles={styles}
          />
          
          <NoteSelector
            notes={filteredNotes}
            currentNoteId={currentNoteId}
            onNoteChange={setCurrentNoteId}
            styles={styles}
            currentSubject={currentSubject}
          />
          
          {(currentNoteId === 'add_note' || currentNoteId === null) && (
            <div className={styles['favorite-note-title-input']}>
              <label htmlFor="favorite-note-title" className={styles['favorite-filter-label']}>筆記標題</label>
              <input
                type="text"
                id="favorite-note-title"
                className={styles['favorite-note-title-field']}
                placeholder="請輸入筆記標題..."
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
              />
            </div>
          )}
        </div>
        
        <div className={styles['favorite-modal-footer']}>
          <button className={`${styles['favorite-modal-btn']} ${styles['favorite-modal-btn-secondary']}`} onClick={onClose}>
            取消
          </button>
          <button className={`${styles['favorite-modal-btn']} ${styles['favorite-modal-btn-primary']}`} onClick={handleConfirm}>
            收藏
          </button>
        </div>
      </div>
    </div>
  );
} 
'use client';
// 解析內容收藏模態框組件 - 允許用戶將 AI 解析內容收藏到筆記本中

import { useState, useEffect } from 'react';
import SubjectSelector from './SubjectSelector';
import NoteSelector from './NoteSelector';
import ContentEditor from './ContentEditor';

export default function AnalysisFavoriteModal({ 
  isOpen, 
  onClose, 
  subjects, 
  notes, 
  onShowCustomAlert, 
  onShowCustomPrompt,
  styles
}) {
  const [currentSubject, setCurrentSubject] = useState('數學');
  const [currentNoteId, setCurrentNoteId] = useState(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(true);

  useEffect(() => {
    if (isOpen) {
      // 模擬從解析對話中獲取的內容
      const analysisContent = 'AI的回答在這裡';
      const formattedContent = `## ${analysisContent}`;
      setContent(formattedContent);
      setNoteTitle(`解析內容收藏 - ${new Date().toLocaleDateString('zh-TW')}`);
      setCurrentSubject('數學');
      setCurrentNoteId(null);
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (!content.trim()) {
      onShowCustomAlert('沒有要收藏的內容！');
      return;
    }

    try {
      if (currentNoteId === 'add_note' || currentNoteId === null) {
        // 新增筆記
        const userTitle = noteTitle.trim();
        const finalTitle = userTitle || `解析內容收藏 - ${new Date().toLocaleDateString('zh-TW')}`;

        const newNote = {
          id: Date.now(),
          title: finalTitle,
          content: content,
          subject: currentSubject
        };

        if (window.addNoteToSystem) {
          window.addNoteToSystem(newNote);
        }

        onShowCustomAlert(`內容已收藏到「${currentSubject}」主題！`);
      } else {
        // 添加到現有筆記
        const targetNote = notes.find(note => note.id === currentNoteId);
        
        if (targetNote) {
          const updatedContent = `${targetNote.content}

---

## 新增內容

${content}`;

          targetNote.content = updatedContent;
          
          onShowCustomAlert(`內容已添加到筆記「${targetNote.title}」中！`);
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
    <div className={`${styles['analysis-favorite-modal']} ${isOpen ? styles.active : ''}`}>
      <div className={styles['analysis-favorite-modal-content']}>
        <div className={styles['analysis-favorite-modal-header']}>
          <h2 className={styles['analysis-favorite-modal-title']}>收藏對話內容</h2>
          <button className={styles['analysis-favorite-modal-close']} onClick={onClose}>×</button>
        </div>
        
        <div className={styles['analysis-favorite-modal-body']}>
          <div className={styles['analysis-favorite-content-info']}>
            <h3>收藏內容</h3>
            <ContentEditor
              content={content}
              onChange={setContent}
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
            type="analysis-favorite"
          />
          
          <NoteSelector
            notes={filteredNotes}
            currentNoteId={currentNoteId}
            onNoteChange={setCurrentNoteId}
            styles={styles}
            type="analysis-favorite"
            currentSubject={currentSubject}
          />
          
          {(currentNoteId === 'add_note' || currentNoteId === null) && (
            <div className={styles['analysis-favorite-note-title-input']}>
              <label className={styles['analysis-favorite-filter-label']}>筆記標題</label>
              <input
                type="text"
                className={styles['analysis-favorite-note-title-field']}
                placeholder="請輸入筆記標題..."
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
              />
            </div>
          )}
        </div>
        
        <div className={styles['analysis-favorite-modal-footer']}>
          <button className={`${styles['analysis-favorite-modal-btn']} ${styles['analysis-favorite-modal-btn-secondary']}`} onClick={onClose}>
            取消
          </button>
          <button className={`${styles['analysis-favorite-modal-btn']} ${styles['analysis-favorite-modal-btn-primary']}`} onClick={handleConfirm}>
            收藏
          </button>
        </div>
      </div>
    </div>
  );
} 
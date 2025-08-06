'use client';
// 筆記本選擇器組件 - 提供下拉選單讓用戶選擇要收藏的筆記本

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getNotesBySubject } from '../../utils/noteUtils';

export default function NoteSelector({ 
  notes, 
  currentNoteId, 
  onNoteChange, 
  styles, 
  type = 'favorite',
  currentSubject = '數學' // 添加當前主題參數
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedText, setSelectedText] = useState('新增筆記');
  const [filteredNotes, setFilteredNotes] = useState([]);

  // 根據當前主題過濾筆記
  useEffect(() => {
    if (currentSubject) {
      const subjectNotes = getNotesBySubject(currentSubject);
      setFilteredNotes(subjectNotes);
    } else {
      setFilteredNotes([]);
    }
  }, [currentSubject]);

  useEffect(() => {
    if (filteredNotes.length > 0 && currentNoteId === null) {
      onNoteChange(filteredNotes[0].id);
    } else if (filteredNotes.length === 0) {
      onNoteChange('add_note');
    }
  }, [filteredNotes, currentNoteId, onNoteChange]);

  useEffect(() => {
    if (currentNoteId === 'add_note') {
      setSelectedText('新增筆記');
    } else {
      const selectedNote = filteredNotes.find(note => note.id === currentNoteId);
      if (selectedNote) {
        const title = selectedNote.title.length > 20 
          ? selectedNote.title.substring(0, 20) + '...' 
          : selectedNote.title;
        setSelectedText(title);
      } else {
        setSelectedText('新增筆記');
      }
    }
  }, [currentNoteId, filteredNotes]);

  const handleNoteSelect = (noteId) => {
    onNoteChange(noteId);
    setIsDropdownOpen(false);
  };

  // 根據類型選擇正確的樣式類名
  const getStyleClass = (baseClass) => {
    if (type === 'analysis-favorite') {
      return styles[`analysis-favorite-${baseClass}`];
    } else if (type === 'analysis-full-favorite') {
      return styles[`analysis-full-favorite-${baseClass}`];
    }
    return styles[`favorite-${baseClass}`];
  };

  return (
    <div className={getStyleClass('note-selector')}>
      <label className={getStyleClass('filter-label')}>選擇筆記</label>
      <div className={getStyleClass('note-select-wrapper')}>
        <div className={getStyleClass('note-select-container')}>
          <div 
            className={getStyleClass('note-select')} 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span>{selectedText}</span>
            <Image 
              src="/img/Vector-17.png" 
              className={getStyleClass('note-select-arrow')} 
              width={16} 
              height={16} 
              alt=""
            />
          </div>
          
          <div className={`${getStyleClass('note-dropdown')} ${isDropdownOpen ? styles.active : ''}`}>
            {filteredNotes.length > 0 ? (
              filteredNotes.map(note => (
                <button
                  key={note.id}
                  className={`${getStyleClass('note-dropdown-option')} ${note.id === currentNoteId ? styles.selected : ''}`}
                  onClick={() => handleNoteSelect(note.id)}
                >
                  <span className={getStyleClass('note-option-text')}>
                    {note.title.length > 20 ? note.title.substring(0, 20) + '...' : note.title}
                  </span>
                </button>
              ))
            ) : (
              <div style={{ padding: '14px 18px', color: '#999', textAlign: 'center' }}>
                該主題下暫無筆記
              </div>
            )}
            
            <div style={{ height: '1px', backgroundColor: '#eee', margin: '8px 16px' }} />
            
            <button
              className={`${getStyleClass('note-dropdown-option')} ${currentNoteId === 'add_note' ? styles.selected : ''}`}
              onClick={() => handleNoteSelect('add_note')}
            >
              <span className={getStyleClass('note-option-text')}>新增筆記</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 
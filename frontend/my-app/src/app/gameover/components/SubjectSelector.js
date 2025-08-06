'use client';
// 科目選擇器組件 - 提供下拉選單讓用戶選擇要收藏的科目分類

import { useState } from 'react';
import Image from 'next/image';
import { getSubjects, addSubject } from '../../utils/noteUtils';

export default function SubjectSelector({ 
  subjects, 
  currentSubject, 
  onSubjectChange, 
  onShowCustomPrompt, 
  onShowCustomAlert,
  styles,
  type = 'favorite' // 可以是 'favorite', 'analysis-favorite', 'analysis-full-favorite'
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSubjectSelect = (subject) => {
    onSubjectChange(subject);
    setIsDropdownOpen(false);
  };

  const handleAddNewSubject = () => {
    onShowCustomPrompt('請輸入新主題名稱：', (newSubject) => {
      if (newSubject && newSubject.trim()) {
        const trimmedSubject = newSubject.trim();
        
        if (subjects.includes(trimmedSubject)) {
          onShowCustomAlert('主題已存在！');
          return;
        }
        
        // 使用 noteUtils 的 addSubject 函數來添加新主題
        try {
          addSubject(trimmedSubject);
          onSubjectChange(trimmedSubject);
          onShowCustomAlert(`主題「${trimmedSubject}」新增成功！`);
        } catch (error) {
          console.error('添加主題失敗:', error);
          onShowCustomAlert('添加主題失敗，請重試！');
        }
      }
    });
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
    <div className={getStyleClass('subject-selector')}>
      <label className={getStyleClass('filter-label')}>選擇主題</label>
      <div className={getStyleClass('select-wrapper')}>
        <div className={getStyleClass('custom-select-container')}>
          <div 
            className={getStyleClass('custom-select')} 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span>{currentSubject}</span>
            <Image 
              src="/img/Vector-17.png" 
              className={getStyleClass('select-arrow')} 
              width={16} 
              height={16} 
              alt=""
            />
          </div>
          
          <div className={`${getStyleClass('custom-dropdown')} ${isDropdownOpen ? styles.active : ''}`}>
            {subjects.map(subject => (
              <button
                key={subject}
                className={`${getStyleClass('dropdown-option')} ${subject === currentSubject ? styles.selected : ''}`}
                onClick={() => handleSubjectSelect(subject)}
              >
                <span className={getStyleClass('option-text')}>{subject}</span>
              </button>
            ))}
            
            <div style={{ height: '1px', backgroundColor: '#eee', margin: '8px 16px' }} />
            
            <button
              className={getStyleClass('dropdown-option')}
              onClick={handleAddNewSubject}
            >
              <span className={getStyleClass('option-text')}>新增主題</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 
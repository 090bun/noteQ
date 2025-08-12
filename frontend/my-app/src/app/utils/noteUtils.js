// 筆記系統工具函數

// 模擬資料庫
let notes = [];

let subjects = [];

// 清理文字內容 - 保留換行符
export function cleanTextContent(text) {
    return text
        .replace(/\r\n/g, '\n')  // 統一換行符
        .replace(/\r/g, '\n')    // 統一換行符
        .replace(/\n\s*\n\s*\n+/g, '\n\n')  // 多個連續換行符合併為兩個
        .trim();                 // 移除首尾空白
}

// 本地Markdown解析函數
export function parseMarkdown(text) {
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
}

// 獲取筆記數據
export function getNotes() {
    return notes;
}

// 獲取主題數據
export function getSubjects() {
    return subjects;
}

// 添加筆記
export function addNote(note) {
    try {
        // 檢查是否已經存在相同的筆記（基於內容和主題）
        const existingNote = notes.find(n => 
            n.content.includes(note.content.split('\n')[0]) && 
            n.subject === note.subject
        );
        
        if (existingNote) {
            return { success: false, message: '此內容已經收藏過了！' };
        }
        
        // 添加新筆記
        notes.push(note);
        
        // 同步主題數據
        if (!subjects.includes(note.subject)) {
            subjects.push(note.subject);
        }
        
        return { success: true, message: '筆記添加成功！' };
        
    } catch (error) {
        console.error('添加筆記失敗:', error);
        return { success: false, message: '保存失敗，請重試！' };
    }
}

// 刪除筆記
export function deleteNote(noteId) {
    notes = notes.filter(note => note.id !== noteId);
    return { success: true, message: '筆記已刪除！' };
}

// 更新筆記
export function updateNote(noteId, updatedNote) {
    const index = notes.findIndex(note => note.id === noteId);
    if (index !== -1) {
        notes[index] = { ...notes[index], ...updatedNote };
        return { success: true, message: '筆記更新成功！' };
    }
    return { success: false, message: '找不到要編輯的筆記！' };
}

// 搬移筆記
export function moveNote(noteId, newSubject) {
    if (!newSubject || newSubject.trim() === '') {
        return { success: false, message: '請輸入有效的主題名稱！' };
    }
    
    const note = notes.find(n => n.id === noteId);
    if (!note) {
        return { success: false, message: '找不到要搬移的筆記！' };
    }
    
    // 更新筆記的主題
    note.subject = newSubject.trim();
    
    // 如果新主題不存在，添加到主題列表
    if (!subjects.includes(newSubject.trim())) {
        subjects.push(newSubject.trim());
    }
    
    return { success: true, message: `筆記已搬移到「${newSubject.trim()}」主題！` };
}

// 添加主題
export function addSubject(subjectName) {
    if (subjects.includes(subjectName)) {
        return { success: false, message: '此主題已存在！' };
    }
    
    subjects.push(subjectName);
    return { success: true, message: `主題「${subjectName}」新增成功！` };
}

// 刪除主題
export function deleteSubject(subjectName) {
    // 刪除該主題的所有筆記
    notes = notes.filter(note => note.subject !== subjectName);
    
    // 刪除主題
    subjects = subjects.filter(subject => subject !== subjectName);
    
    return { success: true, message: `主題「${subjectName}」已刪除！` };
}

// 根據主題篩選筆記
export function getNotesBySubject(subject) {
    return notes.filter(note => note.subject === subject);
}

// 生成題目（模擬功能）
export function generateQuestions(noteId) {
    const note = notes.find(n => n.id === noteId);
    if (note) {
        return {
            success: true,
            message: `正在根據筆記「${note.title}」生成題目...\n\n題目已生成完成！\n\n題目：基於${note.subject}的相關練習題\n\n請前往遊戲頁面查看新生成的題目。`
        };
    }
    return { success: false, message: '找不到要生成題目的筆記！' };
} 
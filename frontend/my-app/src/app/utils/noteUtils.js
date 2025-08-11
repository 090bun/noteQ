// 筆記系統工具函數

// 模擬資料庫
let notes = [
    {
        id: 1,
        title: "質數判斷練習",
        content: "題目:判斷101-200之間有多少個質數\n並輸出所有質數\n正確答案:17個\n解析:質數是指大於1且只能被1和自己整除的正整數。在101-200之間，共有17個質數：101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 191, 193, 197, 199。",
        subject: "數學"
    },
    {
        id: 2,
        title: "二次方程式求解",
        content: "題目:求解二次方程式 x² - 5x + 6 = 0\n\n正確答案:x = 2 或 x = 3\n\n解析:使用因式分解法，將 x² - 5x + 6 分解為 (x - 2)(x - 3) = 0\n因此 x - 2 = 0 或 x - 3 = 0\n所以 x = 2 或 x = 3\n\n驗證:\n當 x = 2 時：2² - 5×2 + 6 = 4 - 10 + 6 = 0 ✓\n當 x = 3 時：3² - 5×3 + 6 = 9 - 15 + 6 = 0 ✓",
        subject: "數學"
    },
    {
        id: 3,
        title: "圓的面積與周長計算",
        content: "題目:計算圓的面積和周長，已知半徑 r = 5\n\n正確答案:\n面積 = 25π ≈ 78.54\n周長 = 10π ≈ 31.42\n\n解析:\n圓的面積公式：A = πr²\n圓的周長公式：C = 2πr\n\n計算過程：\n面積 = π × 5² = π × 25 = 25π ≈ 78.54\n周長 = 2π × 5 = 10π ≈ 31.42\n\n注意：π ≈ 3.14159",
        subject: "數學"
    },
    {
        id: 4,
        title: "線性方程組求解",
        content: "題目:求解線性方程組\n2x + 3y = 8\n4x - y = 7\n\n正確答案:x = 2, y = 1\n\n解析:使用代入法或消元法求解\n\n方法一：代入法\n從第二個方程式：y = 4x - 7\n代入第一個方程式：2x + 3(4x - 7) = 8\n2x + 12x - 21 = 8\n14x = 29\nx = 2\n代入 y = 4×2 - 7 = 1\n\n驗證：\n2×2 + 3×1 = 4 + 3 = 7 ✓\n4×2 - 1 = 8 - 1 = 7 ✓",
        subject: "數學"
    }
];

let subjects = [""];

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
        return { success: true, message: '筆記編輯成功！' };
    }
    return { success: false, message: '找不到要編輯的筆記！' };
}

// 搬移筆記
export function moveNote(noteId, newSubject) {
    const note = notes.find(n => n.id === noteId);
    if (note) {
        note.subject = newSubject;
        
        // 如果新主題不存在，添加到主題列表
        if (!subjects.includes(newSubject)) {
            subjects.push(newSubject);
        }
        
        return { success: true, message: `筆記已搬移到 ${newSubject} 主題！` };
    }
    return { success: false, message: '找不到要搬移的筆記！' };
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
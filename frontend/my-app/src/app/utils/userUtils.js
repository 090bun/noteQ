// 用戶系統工具函數

// 模擬用戶數據
let userData = {
    name: 'Aaron',
    email: 'aaron@example.com',
    registerDate: '2025年8月15日',
    studyHours: '總計：4小時',
    topics: [
        { name: '累了', familiarity: 35 },
        { name: '多益', familiarity: 35 },
        { name: '數學', familiarity: 35 },
        { name: '物理', familiarity: 35 },
        { name: '累了', familiarity: 35 },
        { name: '多益', familiarity: 35 },
        { name: '數學', familiarity: 35 },
        { name: '物理', familiarity: 35 }
    ]
};

// 從 localStorage 或 API 初始化用戶數據
export function initializeUserData() {
    try {
        const storedData = localStorage.getItem('userData');
        if (storedData) {
            const parsedData = JSON.parse(storedData);
            userData = { ...userData, ...parsedData };
        }
    } catch (error) {
        console.log('無法從 localStorage 讀取用戶數據，使用默認數據');
    }
}

// 保存用戶數據到 localStorage
export function saveUserData() {
    try {
        localStorage.setItem('userData', JSON.stringify(userData));
    } catch (error) {
        console.log('無法保存用戶數據到 localStorage');
    }
}

// 獲取用戶數據
export function getUserData() {
    return userData;
}

// 更新用戶數據
export function updateUserData(newData) {
    userData = { ...userData, ...newData };
    saveUserData();
    return { success: true, message: '用戶數據更新成功！' };
}

// 獲取用戶主題熟悉度
export function getUserTopics() {
    return userData.topics;
}

// 更新主題熟悉度
export function updateTopicFamiliarity(topicName, newFamiliarity) {
    const topicIndex = userData.topics.findIndex(topic => topic.name === topicName);
    if (topicIndex !== -1) {
        userData.topics[topicIndex].familiarity = Math.max(0, Math.min(100, newFamiliarity));
        saveUserData();
        return { success: true, message: '熟悉度更新成功！' };
    }
    return { success: false, message: '找不到該主題！' };
}

// 添加新主題
export function addUserTopic(topicName) {
    const existingTopic = userData.topics.find(topic => topic.name === topicName);
    if (existingTopic) {
        return { success: false, message: '該主題已存在！' };
    }
    
    userData.topics.push({
        name: topicName,
        familiarity: 0
    });
    
    saveUserData();
    return { success: true, message: '主題添加成功！' };
}

// 刪除主題
export function removeUserTopic(topicName) {
    const topicIndex = userData.topics.findIndex(topic => topic.name === topicName);
    if (topicIndex !== -1) {
        userData.topics.splice(topicIndex, 1);
        saveUserData();
        return { success: true, message: '主題刪除成功！' };
    }
    return { success: false, message: '找不到該主題！' };
}

// 計算總學習時數
export function calculateTotalStudyHours() {
    // 這裡可以根據實際需求計算學習時數
    return userData.studyHours;
}

// 更新學習時數
export function updateStudyHours(hours) {
    userData.studyHours = `總計：${hours}小時`;
    saveUserData();
    return { success: true, message: '學習時數更新成功！' };
}

// 更改密碼（模擬）
export function changePassword(oldPassword, newPassword) {
    // 這裡應該連接到後端 API 進行密碼驗證和更改
    if (!oldPassword || !newPassword) {
        return { success: false, message: '請輸入舊密碼和新密碼！' };
    }
    
    if (newPassword.length < 6) {
        return { success: false, message: '新密碼長度至少需要6位！' };
    }
    
    if (oldPassword === newPassword) {
        return { success: false, message: '新密碼不能與舊密碼相同！' };
    }
    
    // 模擬成功
    return { success: true, message: '密碼更改成功！' };
}

// 獲取用戶統計數據
export function getUserStats() {
    const totalTopics = userData.topics.length;
    const averageFamiliarity = totalTopics > 0 
        ? Math.round(userData.topics.reduce((sum, topic) => sum + topic.familiarity, 0) / totalTopics)
        : 0;
    
    return {
        totalTopics,
        averageFamiliarity,
        studyHours: userData.studyHours,
        registerDate: userData.registerDate
    };
}

// 初始化用戶數據
initializeUserData(); 
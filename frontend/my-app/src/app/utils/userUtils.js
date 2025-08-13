// 用戶系統工具函數

// 從API獲取用戶熟悉度數據
export async function getUserFamiliarityFromAPI() {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("找不到 token");
            return [];
        }

        const res = await fetch("http://127.0.0.1:8000/api/user_quiz_and_notes/", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (!res.ok) {
            console.error("獲取熟悉度數據失敗：", res.status, await res.text());
            return [];
        }

        const data = await res.json();
        
        // 從 favorite_quiz_topics 中提取熟悉度數據
        const familiarityData = Array.isArray(data?.favorite_quiz_topics)
            ? data.favorite_quiz_topics.map((quiz) => {
                // 使用真實的API數據，如果沒有熟悉度則設為0
                return {
                    name: quiz.quiz_topic || "未命名主題",
                    familiarity: 0, // 暫時設為0，因為現有API沒有熟悉度字段
                    quizId: quiz.id
                };
            })
            : [];

        return familiarityData;
    } catch (error) {
        console.error('獲取熟悉度數據失敗:', error);
        return [];
    }
}

// 獲取用戶主題熟悉度
export async function getUserTopics() {
    try {
        // 使用API數據
        const apiData = await getUserFamiliarityFromAPI();
        return apiData;
    } catch (error) {
        console.error('獲取主題熟悉度失敗:', error);
        return [];
    }
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
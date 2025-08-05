// 自定義對話框系統
export const showCustomAlert = (message, callback) => {
    const alertModal = document.createElement('div');
    alertModal.className = 'custom-alert-modal';
    alertModal.innerHTML = `
        <div class="custom-alert-content">
            <div class="custom-alert-message">${message}</div>
            <button class="custom-alert-btn" onclick="closeCustomAlert()">確定</button>
        </div>
    `;
    
    document.body.appendChild(alertModal);
    
    // 存儲回調函數
    window.customAlertCallback = callback;
    
    // 禁用背景滾動
    document.body.style.overflow = 'hidden';
    
    // 添加動畫
    setTimeout(() => {
        alertModal.classList.add('active');
    }, 10);
};

export const showCustomConfirm = (message, onConfirm, onCancel) => {
    const confirmModal = document.createElement('div');
    confirmModal.className = 'custom-confirm-modal';
    confirmModal.innerHTML = `
        <div class="custom-confirm-content">
            <div class="custom-confirm-message">${message}</div>
            <div class="custom-confirm-buttons">
                <button class="custom-confirm-btn custom-confirm-cancel" onclick="closeCustomConfirm(false)">取消</button>
                <button class="custom-confirm-btn custom-confirm-ok" onclick="closeCustomConfirm(true)">確定</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(confirmModal);
    
    // 存儲回調函數
    window.customConfirmCallbacks = { onConfirm, onCancel };
    
    // 禁用背景滾動
    document.body.style.overflow = 'hidden';
    
    // 添加動畫
    setTimeout(() => {
        confirmModal.classList.add('active');
    }, 10);
};

export const showCustomPrompt = (title, callback) => {
    const promptModal = document.createElement('div');
    promptModal.className = 'custom-prompt-modal';
    promptModal.innerHTML = `
        <div class="custom-prompt-content">
            <div class="custom-prompt-title">${title}</div>
            <input type="text" class="custom-prompt-input" id="customPromptInput" placeholder="請輸入...">
            <div class="custom-prompt-buttons">
                <button class="custom-prompt-btn custom-prompt-btn-secondary" onclick="closeCustomPrompt()">取消</button>
                <button class="custom-prompt-btn custom-prompt-btn-primary" onclick="confirmCustomPrompt()">確定</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(promptModal);
    
    // 存儲回調函數
    window.customPromptCallback = callback;
    
    // 禁用背景滾動
    document.body.style.overflow = 'hidden';
    
    // 添加動畫
    setTimeout(() => {
        promptModal.classList.add('active');
        // 聚焦到輸入框
        const input = document.getElementById('customPromptInput');
        if (input) {
            input.focus();
        }
    }, 10);
};

// 關閉對話框函數
export const closeCustomAlert = () => {
    const modal = document.querySelector('.custom-alert-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
            // 恢復背景滾動
            document.body.style.overflow = 'auto';
            if (window.customAlertCallback) {
                window.customAlertCallback();
                window.customAlertCallback = null;
            }
        }, 300);
    }
};

export const closeCustomConfirm = (result) => {
    const modal = document.querySelector('.custom-confirm-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
            // 恢復背景滾動
            document.body.style.overflow = 'auto';
            if (window.customConfirmCallbacks) {
                if (result && window.customConfirmCallbacks.onConfirm) {
                    window.customConfirmCallbacks.onConfirm();
                } else if (!result && window.customConfirmCallbacks.onCancel) {
                    window.customConfirmCallbacks.onCancel();
                }
                window.customConfirmCallbacks = null;
            }
        }, 300);
    }
};

export const closeCustomPrompt = () => {
    const modal = document.querySelector('.custom-prompt-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
            // 恢復背景滾動
            document.body.style.overflow = 'auto';
            if (window.customPromptCallback) {
                window.customPromptCallback(null);
                window.customPromptCallback = null;
            }
        }, 300);
    }
};

export const confirmCustomPrompt = () => {
    const input = document.getElementById('customPromptInput');
    const value = input ? input.value.trim() : '';
    
    const modal = document.querySelector('.custom-prompt-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
            // 恢復背景滾動
            document.body.style.overflow = 'auto';
            if (window.customPromptCallback) {
                window.customPromptCallback(value);
                window.customPromptCallback = null;
            }
        }, 300);
    }
};

// 安全的對話框函數
export const safeAlert = (message, callback) => {
    showCustomAlert(message, callback);
};

export const safeConfirm = (message, onConfirm, onCancel) => {
    showCustomConfirm(message, onConfirm, onCancel);
};

// 將函數掛載到全局對象
if (typeof window !== 'undefined') {
    window.showCustomAlert = showCustomAlert;
    window.showCustomConfirm = showCustomConfirm;
    window.showCustomPrompt = showCustomPrompt;
    window.closeCustomAlert = closeCustomAlert;
    window.closeCustomConfirm = closeCustomConfirm;
    window.closeCustomPrompt = closeCustomPrompt;
    window.confirmCustomPrompt = confirmCustomPrompt;
    window.safeAlert = safeAlert;
    window.safeConfirm = safeConfirm;
} 
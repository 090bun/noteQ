'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Header from '../components/Header';
import Menu from '../components/Menu';
import styles from '../styles/NotePage.module.css';
import { 
    getNotes, 
    getSubjects, 
    addNote, 
    deleteNote, 
    updateNote, 
    moveNote, 
    addSubject, 
    deleteSubject, 
    getNotesBySubject,
    generateQuestions,
    cleanTextContent,
    parseMarkdown
} from '../utils/noteUtils';
import { safeAlert, safeConfirm } from '../utils/dialogs';
import { safeLogout } from '../utils/auth';

export default function NotePage() {
    const [notes, setNotes] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [currentSubject, setCurrentSubject] = useState('數學');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMoveDropdownOpen, setIsMoveDropdownOpen] = useState(false);
    const [selectedMoveSubject, setSelectedMoveSubject] = useState('');
    const [activeActionBar, setActiveActionBar] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalContent, setModalContent] = useState('');
    const [modalType, setModalType] = useState(''); // 'add', 'edit', 'view', 'move', 'addSubject', 'deleteSubject'
    const [editingNote, setEditingNote] = useState(null);
    const [movingNote, setMovingNote] = useState(null);
    const [isPlusSubscribed, setIsPlusSubscribed] = useState(false);

    // 初始化數據
    useEffect(() => {
        const notesData = getNotes();
        const subjectsData = getSubjects();
        const subscriptionStatus = localStorage.getItem('isPlusSubscribed');
        setNotes(notesData);
        setSubjects(subjectsData);
        setIsPlusSubscribed(subscriptionStatus === 'true');
        
        if (subjectsData.length > 0) {
            if (!subjectsData.includes(currentSubject)) {
                setCurrentSubject(subjectsData[0]);
            }
        } else {
            setCurrentSubject(''); // 沒有主題時重置為空字符串
        }
    }, []);

    // 檢查是否為Plus用戶
    const checkPlusSubscription = () => {
        return isPlusSubscribed;
    };

    // 顯示升級提示
    const showUpgradeAlert = () => {
        safeAlert('此功能僅限Plus用戶使用，請升級到Plus方案！');
    };

    // 切換選單
    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
        if (!isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    };

    // 關閉選單
    const closeMenu = () => {
        setIsMenuOpen(false);
        document.body.style.overflow = 'auto';
    };

    // 獲取當前主題的筆記
    const getCurrentSubjectNotes = () => {
        return getNotesBySubject(currentSubject);
    };

    // 切換下拉選單
    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    // 選擇主題
    const selectSubject = (subject) => {
        setCurrentSubject(subject);
        setIsDropdownOpen(false);
    };

    // 新增主題
    const handleAddSubject = () => {
        if (!checkPlusSubscription()) {
            showUpgradeAlert();
            return;
        }
        setModalType('addSubject');
        setModalContent('');
        setShowModal(true);
    };

    const confirmAddSubject = () => {
        if (!checkPlusSubscription()) {
            showUpgradeAlert();
            return;
        }
        if (modalContent.trim()) {
            addSubject(modalContent.trim());
            const updatedSubjects = getSubjects();
            setSubjects(updatedSubjects);
            setCurrentSubject(modalContent.trim());
            setShowModal(false);
            setModalContent('');
            safeAlert('主題新增成功！');
        }
    };

    // 刪除主題
    const handleDeleteSubject = (subject, event) => {
        if (!checkPlusSubscription()) {
            showUpgradeAlert();
            return;
        }
        event.stopPropagation();
        setModalType('deleteSubject');
        setModalContent(subject);
        setShowModal(true);
    };

    const confirmDeleteSubject = () => {
        if (!checkPlusSubscription()) {
            showUpgradeAlert();
            return;
        }
        deleteSubject(modalContent);
        const updatedSubjects = getSubjects();
        const updatedNotes = getNotes();
        setSubjects(updatedSubjects);
        setNotes(updatedNotes);
        if (currentSubject === modalContent) {
            if (updatedSubjects.length > 0) {
                setCurrentSubject(updatedSubjects[0]);
            } else {
                setCurrentSubject(''); // 重置為空字符串
            }
        }
        setShowModal(false);
        setModalContent('');
        safeAlert('主題刪除成功！');
    };

// 新增筆記
const handleAddNote = () => {
    if (!checkPlusSubscription()) {
        showUpgradeAlert();
        return;
    }
    if (subjects.length === 0) {
        safeAlert('請先新增主題！');
        return;
    }
    setModalType('add');
    setModalContent('');
    setShowModal(true);
};


    const confirmAddNote = () => {
        if (!checkPlusSubscription()) {
            showUpgradeAlert();
            return;
        }
        if (modalContent.trim()) {
            const newNote = {
                id: Date.now(),
                title: modalContent.split('\n')[0],
                content: modalContent,
                subject: currentSubject,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            addNote(newNote);
            const updatedNotes = getNotes();
            setNotes(updatedNotes);
            setShowModal(false);
            setModalContent('');
            safeAlert('筆記新增成功！');
        }
    };

    // 編輯筆記
    const handleEditNote = (note) => {
        if (!checkPlusSubscription()) {
            showUpgradeAlert();
            return;
        }
        setModalType('edit');
        setModalContent(note.content);
        setEditingNote(note);
        setShowModal(true);
    };

    const confirmEditNote = () => {
        if (!checkPlusSubscription()) {
            showUpgradeAlert();
            return;
        }
        if (modalContent.trim() && editingNote) {
            const updatedNote = {
                ...editingNote,
                title: modalContent.split('\n')[0],
                content: modalContent,
                updatedAt: new Date().toISOString()
            };
            updateNote(updatedNote);
            const updatedNotes = getNotes();
            setNotes(updatedNotes);
            setShowModal(false);
            setModalContent('');
            setEditingNote(null);
            safeAlert('筆記更新成功！');
        }
    };

    // 查看筆記
    const handleViewNote = (note) => {
        if (!checkPlusSubscription()) {
            showUpgradeAlert();
            return;
        }
        setModalType('view');
        setModalContent(note.content);
        setShowModal(true);
    };

    // 刪除筆記
    const handleDeleteNote = (note) => {
        if (!checkPlusSubscription()) {
            showUpgradeAlert();
            return;
        }
        safeConfirm('確定要刪除這則筆記嗎？', 
            () => {
                deleteNote(note.id);
                const updatedNotes = getNotes();
                setNotes(updatedNotes);
                safeAlert('筆記刪除成功！');
            },
            () => {}
        );
    };

    // 搬移筆記
    const handleMoveNote = (note) => {
        if (!checkPlusSubscription()) {
            showUpgradeAlert();
            return;
        }
        setModalType('move');
        setMovingNote(note);
        setSelectedMoveSubject(currentSubject);
        setShowModal(true);
    };

    const confirmMoveNote = () => {
        if (!checkPlusSubscription()) {
            showUpgradeAlert();
            return;
        }
        if (movingNote && selectedMoveSubject) {
            const updatedNote = {
                ...movingNote,
                subject: selectedMoveSubject,
                updatedAt: new Date().toISOString()
            };
            moveNote(updatedNote);
            const updatedNotes = getNotes();
            setNotes(updatedNotes);
            setShowModal(false);
            setMovingNote(null);
            setSelectedMoveSubject('');
            safeAlert('筆記移動成功！');
        }
    };

    // 生成題目
    const handleGenerateQuestions = (note) => {
        if (!checkPlusSubscription()) {
            showUpgradeAlert();
            return;
        }
        const questions = generateQuestions(note.content);
        safeAlert(`已生成 ${questions.length} 道題目！`);
    };

    // 切換動作欄
    const toggleActionBar = (noteId) => {
        setActiveActionBar(activeActionBar === noteId ? null : noteId);
    };

    // 關閉所有動作欄
    const closeAllActionBars = () => {
        setActiveActionBar(null);
    };

    // 關閉模態框
    const closeModal = () => {
        setShowModal(false);
        setModalContent('');
        setModalType('');
        setEditingNote(null);
        setMovingNote(null);
        setSelectedMoveSubject('');
    };

    // 鍵盤事件處理
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                closeMenu();
                closeAllActionBars();
                if (showModal) {
                    closeModal();
                }
                setIsDropdownOpen(false);
                setIsMoveDropdownOpen(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [showModal]);

    // 點擊外部關閉下拉選單
    useEffect(() => {
        const handleClickOutside = (event) => {
            // 檢查是否點擊了下拉選單容器或其子元素
            const dropdownContainer = event.target.closest('[data-dropdown-container]');
            if (!dropdownContainer) {
                setIsDropdownOpen(false);
            }
            
            // 檢查是否點擊了搬移下拉選單容器或其子元素
            const moveDropdownContainer = event.target.closest('[data-move-dropdown-container]');
            if (!moveDropdownContainer) {
                setIsMoveDropdownOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    // 渲染筆記卡片
    const renderNoteCard = (note) => {
        const cleanedContent = cleanTextContent(note.content);
        const parsedContent = parseMarkdown(cleanedContent);
        
        return (
            <article key={note.id} className={styles.noteCard} data-note-id={note.id}>
                <div className={styles.cardContent}>
                    <h3 className={styles.noteTitle}>{note.title}</h3>
                    <div 
                        className={styles.noteText} 
                        dangerouslySetInnerHTML={{ __html: parsedContent }}
                    />
                </div>

                <div className={styles.addButton}>
                    <div 
                        className={styles.generateButton} 
                        onClick={() => handleGenerateQuestions(note)}
                    >
                        <span className={styles.arrowUp}>↑</span>
                        <span className={styles.generateText}>生成題目</span>
                    </div>
                    <span 
                        className={styles.addPlus} 
                        onClick={() => toggleActionBar(note.id)}
                    >
                        <Image src="/img/Vector-31.png" alt="Add" width={15} height={15} />
                    </span>
                    <div className={`${styles.actionBar} ${activeActionBar === note.id ? styles.active : ''}`}>
                        <span 
                            className={styles.actionItem} 
                            onClick={() => handleDeleteNote(note)}
                        >
                            刪除
                        </span>
                        <span 
                            className={styles.actionItem} 
                            onClick={() => handleMoveNote(note)}
                        >
                            搬移
                        </span>
                        <span 
                            className={styles.actionItem} 
                            onClick={() => handleViewNote(note)}
                        >
                            查看
                        </span>
                        <span 
                            className={styles.actionItem} 
                            onClick={() => handleEditNote(note)}
                        >
                            編輯
                        </span>
                    </div>
                </div>
            </article>
        );
    };

    // 渲染模態框
    const renderModal = () => {
        if (!showModal) return null;

        const currentNotes = getCurrentSubjectNotes();

        return (
            <div className={styles.modal} onClick={closeModal}>
                <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                    {modalType === 'add' && (
                        <>
                            <div className={styles.modalHeader}>
                                <h2 className={styles.modalTitle}>新增筆記</h2>
                                <button className={styles.modalClose} onClick={closeModal}>&times;</button>
                            </div>
                            <div className={styles.modalBody}>
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#333' }}>
                                        筆記名稱：
                                    </label>
                                    <input 
                                        type="text" 
                                        placeholder="請輸入筆記名稱" 
                                        style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }}
                                        value={modalContent.split('\n---\n')[0] || ''}
                                        onChange={(e) => {
                                            const [_, content] = modalContent.split('\n---\n');
                                            setModalContent(`${e.target.value}\n---\n${content || ''}`);
                                        }}
                                    />
                                </div>
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#333' }}>
                                        筆記內容：
                                    </label>
                                    <p style={{ marginBottom: '10px', color: '#666', fontSize: '14px' }}>支援 Markdown 語法</p>
                                    <textarea 
                                        className={styles.modalTextarea}
                                        placeholder={
                                            "請輸入筆記內容...\n範例格式：**\n- 粗體：**文字**\n- 斜體：*文字*\n- 標題：# ## ###\n- 列表：- 項目\n- 程式碼：`code`"
                                        }
                                        value={modalContent.split('\n---\n')[1] || ''}
                                        onChange={(e) => {
                                            const [title] = modalContent.split('\n---\n');
                                            setModalContent(`${title || ''}\n---\n${e.target.value}`);
                                        }}
                                    />
                                </div>
                            </div>
                            <div className={styles.modalFooter}>
                                <button className={`${styles.modalBtn} ${styles.modalBtnSecondary}`} onClick={closeModal}>
                                    取消
                                </button>
                                <button className={`${styles.modalBtn} ${styles.modalBtnPrimary}`} onClick={confirmAddNote}>
                                    儲存筆記
                                </button>
                            </div>
                        </>
                    )}

                    {modalType === 'edit' && (
                        <>
                            <div className={styles.modalHeader}>
                                <h2 className={styles.modalTitle}>編輯筆記</h2>
                                <button className={styles.modalClose} onClick={closeModal}>&times;</button>
                            </div>
                            <div className={styles.modalBody}>
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#333' }}>
                                        筆記名稱：
                                    </label>
                                    <input 
                                        type="text" 
                                        style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }}
                                        value={modalContent.split('\n---\n')[0] || ''}
                                        onChange={(e) => {
                                            const [_, content] = modalContent.split('\n---\n');
                                            setModalContent(`${e.target.value}\n---\n${content || ''}`);
                                        }}
                                    />
                                </div>
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#333' }}>
                                        筆記內容：
                                    </label>
                                    <p style={{ marginBottom: '10px', color: '#666', fontSize: '14px' }}>支援 Markdown 語法</p>
                                    <textarea 
                                        className={styles.modalTextarea}
                                        value={modalContent.split('\n---\n')[1] || ''}
                                        onChange={(e) => {
                                            const [title] = modalContent.split('\n---\n');
                                            setModalContent(`${title || ''}\n---\n${e.target.value}`);
                                        }}
                                    />
                                </div>
                            </div>
                            <div className={styles.modalFooter}>
                                <button className={`${styles.modalBtn} ${styles.modalBtnSecondary}`} onClick={closeModal}>
                                    取消
                                </button>
                                <button className={`${styles.modalBtn} ${styles.modalBtnPrimary}`} onClick={confirmEditNote}>
                                    儲存修改
                                </button>
                            </div>
                        </>
                    )}

                    {modalType === 'view' && (
                        <>
                            <div className={styles.modalHeader}>
                                <h2 className={styles.modalTitle}>查看筆記</h2>
                                <button className={styles.modalClose} onClick={closeModal}>&times;</button>
                            </div>
                            <div className={styles.modalBody}>
                                <div style={{ marginBottom: '20px' }}>
                                    <p><strong>{modalContent.title}</strong></p>
                                </div>
                                <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', lineHeight: '1.6' }}
                                     dangerouslySetInnerHTML={{ __html: parseMarkdown(cleanTextContent(modalContent.content)) }}>
                                </div>
                            </div>
                            <div className={styles.modalFooter}>
                                <button className={`${styles.modalBtn} ${styles.modalBtnPrimary}`} onClick={closeModal}>
                                    關閉
                                </button>
                            </div>
                        </>
                    )}

                    {modalType === 'move' && (
                        <>
                            <div className={styles.modalHeader}>
                                <h2 className={styles.modalTitle}>搬移筆記</h2>
                                <button className={styles.modalClose} onClick={closeModal}>&times;</button>
                            </div>
                            <div className={styles.modalBody}>
                                <p style={{ marginBottom: '15px' }}>選擇要搬移到的主題：</p>
                                <div className={styles.moveCustomSelectContainer} data-move-dropdown-container style={{ marginBottom: '15px' }}>
                                    <div 
                                        className={styles.moveCustomSelect} 
                                        onClick={() => setIsMoveDropdownOpen(!isMoveDropdownOpen)}
                                    >
                                        <span>{selectedMoveSubject}</span>
                                        <Image src="/img/Vector-17.png" alt="Arrow" width={16} height={16} />
                                    </div>
                                    {isMoveDropdownOpen && (
                                        <div className={styles.moveCustomDropdown}>
                                            {subjects.map(subject => (
                                                <button
                                                    key={subject}
                                                    className={`${styles.moveDropdownOption} ${subject === selectedMoveSubject ? styles.selected : ''}`}
                                                    onClick={() => {
                                                        setSelectedMoveSubject(subject);
                                                        setIsMoveDropdownOpen(false);
                                                    }}
                                                >
                                                    <span className={styles.moveOptionText}>{subject}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <p style={{ color: '#666', fontSize: '14px' }}>或輸入新主題名稱：</p>
                                <input 
                                    type="text" 
                                    placeholder="輸入新主題名稱" 
                                    style={{ width: '100%', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px' }}
                                    value={selectedMoveSubject}
                                    onChange={(e) => setSelectedMoveSubject(e.target.value)}
                                />
                            </div>
                            <div className={styles.modalFooter}>
                                <button className={`${styles.modalBtn} ${styles.modalBtnSecondary}`} onClick={closeModal}>
                                    取消
                                </button>
                                <button className={`${styles.modalBtn} ${styles.modalBtnPrimary}`} onClick={confirmMoveNote}>
                                    確認搬移
                                </button>
                            </div>
                        </>
                    )}

                    {modalType === 'addSubject' && (
                        <>
                            <div className={styles.modalHeader}>
                                <h2 className={styles.modalTitle}>新增主題</h2>
                                <button className={styles.modalClose} onClick={closeModal}>&times;</button>
                            </div>
                            <div className={styles.modalBody}>
                                <p style={{ marginBottom: '15px' }}>請輸入新主題名稱：</p>
                                <input 
                                    type="text" 
                                    placeholder="例如：程式設計、英文、數學..." 
                                    style={{ width: '100%', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px' }}
                                    value={modalContent}
                                    onChange={(e) => setModalContent(e.target.value)}
                                />
                            </div>
                            <div className={styles.modalFooter}>
                                <button className={`${styles.modalBtn} ${styles.modalBtnSecondary}`} onClick={closeModal}>
                                    取消
                                </button>
                                <button className={`${styles.modalBtn} ${styles.modalBtnPrimary}`} onClick={confirmAddSubject}>
                                    新增主題
                                </button>
                            </div>
                        </>
                    )}

                    {modalType === 'deleteSubject' && (
                        <>
                            <div className={styles.modalHeader}>
                                <h2 className={styles.modalTitle}>刪除主題</h2>
                                <button className={styles.modalClose} onClick={closeModal}>&times;</button>
                            </div>
                            <div className={styles.modalBody}>
                                <p style={{ marginBottom: '15px', color: '#d32f2f' }}>確定要刪除主題「{modalContent}」嗎？</p>
                                <p style={{ marginBottom: '15px', color: '#d32f2f' }}>此操作會刪除該主題的所有筆記，且無法復原！</p>
                            </div>
                            <div className={styles.modalFooter}>
                                <button className={`${styles.modalBtn} ${styles.modalBtnSecondary}`} onClick={closeModal}>
                                    取消
                                </button>
                                <button 
                                    className={`${styles.modalBtn} ${styles.modalBtnPrimary}`} 
                                    onClick={confirmDeleteSubject}
                                    style={{ background: '#d32f2f', color: 'white' }}
                                >
                                    確認刪除
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    };

    return (
        <>
            {/* 頭部 */}
            <Header 
                showMenu={true}
                isMenuOpen={isMenuOpen}
                onToggleMenu={toggleMenu}
            />

            {/* 主要內容 */}
            <main className={styles.mainContent}>
                <div className={styles.filterContainer}>
                    <label className={styles.filterLabel}>選擇主題</label>
                    <div className={styles.filterRow}>
                        <div className={styles.selectWrapper}>
                            <div className={styles.customSelectContainer} data-dropdown-container>
                                <div 
                                    className={styles.customSelect} 
                                    onClick={toggleDropdown}
                                >
                                    <span>{currentSubject || '新增主題'}</span>
                                </div>
                                <Image 
                                    src="/img/Vector-17.png" 
                                    className={styles.selectArrow} 
                                    alt="Arrow"
                                    width={16}
                                    height={16}
                                />
                                <div className={`${styles.customDropdown} ${isDropdownOpen ? styles.active : ''}`}>
                                    {subjects.length === 0 ? (
                                        <button 
                                            className={styles.customDropdownOption}
                                            onClick={handleAddSubject}
                                        >
                                            <span className={styles.optionText}>新增主題</span>
                                        </button>
                                    ) : (
                                        <>
                                            {subjects.map(subject => (
                                                <div
                                                    key={subject}
                                                    className={`${styles.customDropdownOption} ${subject === currentSubject ? styles.selected : ''}`}
                                                >
                                                    <span 
                                                        className={styles.optionText}
                                                        onClick={() => selectSubject(subject)}
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        {subject}
                                                    </span>
                                                    <button 
                                                        className={styles.deleteOptionBtn}
                                                        onClick={(e) => handleDeleteSubject(subject, e)}
                                                    >
                                                        <Image src="/img/Vector-25.png" alt="刪除" width={16} height={16} />
                                                    </button>
                                                </div>
                                            ))}
                                            <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.2)', margin: '8px 16px' }}></div>
                                            <button 
                                                className={styles.customDropdownOption}
                                                onClick={handleAddSubject}
                                            >
                                                <span className={styles.optionText}>新增主題</span>
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        <button className={styles.addNoteButton} onClick={handleAddNote} disabled={!isPlusSubscribed}>
                            新增筆記
                        </button>
                    </div>
                </div>

                <div className={styles.notesGrid}>
                    {!isPlusSubscribed ? (
                        <div className={styles.upgradeState}>
                            <div className={styles.upgradeIcon}>
                                <Image src="/img/Vector-41.png" alt="升級" width={64} height={64} />
                            </div>
                            <h3>升級Plus方案</h3>
                            <p>筆記功能僅限Plus用戶使用，請升級到Plus方案！</p>
                            <button 
                                className={styles.upgradeButton}
                                onClick={() => window.location.href = '/user'}
                            >
                                立即升級
                            </button>
                        </div>
                    ) : subjects.length === 0 ? (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>
                                <Image src="/img/Vector-32.png" alt="主題" width={64} height={64} />
                            </div>
                            <h3>還沒有主題</h3>
                            <p>點擊「新增主題」開始創建你的學習主題吧！</p>
                        </div>
                    ) : getCurrentSubjectNotes().length === 0 ? (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>
                                <Image src="/img/Vector-32.png" alt="筆記" width={64} height={64} />
                            </div>
                            <h3>還沒有筆記</h3>
                            <p>點擊「新增筆記」開始記錄你的學習筆記吧！</p>
                        </div>
                    ) : (
                        getCurrentSubjectNotes().map(renderNoteCard)
                    )}
                </div>
            </main>

            {/* 選單 */}
            <Menu 
                isOpen={isMenuOpen}
                onClose={closeMenu}
                onLogout={safeLogout}
            />

            {/* 動作背景 */}
            <div 
                className={`${styles.actionBackdrop} ${activeActionBar ? styles.active : ''}`} 
                onClick={closeAllActionBars}
            />

            {/* 模態框 */}
            {renderModal()}
        </>
    );
}
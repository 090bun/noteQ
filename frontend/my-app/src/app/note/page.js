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

    // 初始化數據
    useEffect(() => {
        const notesData = getNotes();
        const subjectsData = getSubjects();
        setNotes(notesData);
        setSubjects(subjectsData);
        
        if (subjectsData.length > 0 && !subjectsData.includes(currentSubject)) {
            setCurrentSubject(subjectsData[0]);
        }
    }, []);

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

    // 登出功能
    const logout = () => {
        safeConfirm('確定要登出嗎？', 
            () => {
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('userData');
                closeMenu();
                window.location.href = '/';
            },
            () => {}
        );
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
        setModalType('addSubject');
        setModalContent('');
        setShowModal(true);
        setIsDropdownOpen(false);
    };

    // 確認新增主題
    const confirmAddSubject = () => {
        if (!modalContent.trim()) {
            safeAlert('請輸入主題名稱！');
            return;
        }
        
        const result = addSubject(modalContent.trim());
        if (result.success) {
            setSubjects(getSubjects());
            setCurrentSubject(modalContent.trim());
            setShowModal(false);
            safeAlert(result.message);
        } else {
            safeAlert(result.message);
        }
    };

    // 刪除主題
    const handleDeleteSubject = (subject, event) => {
        event.stopPropagation();
        setModalType('deleteSubject');
        setModalContent(subject);
        setShowModal(true);
        setIsDropdownOpen(false);
    };

    // 確認刪除主題
    const confirmDeleteSubject = () => {
        safeConfirm(`確定要刪除主題「${modalContent}」嗎？\n\n此操作會刪除該主題的所有筆記，且無法復原！`, 
            () => {
                const result = deleteSubject(modalContent);
                setNotes(getNotes());
                setSubjects(getSubjects());
                
                if (currentSubject === modalContent) {
                    const newSubjects = getSubjects();
                    setCurrentSubject(newSubjects.length > 0 ? newSubjects[0] : '');
                }
                
                setShowModal(false);
                safeAlert(result.message);
            },
            () => {}
        );
    };

    // 新增筆記
    const handleAddNote = () => {
        if (!currentSubject || subjects.length === 0) {
            safeAlert('請新增主題！');
            return;
        }
        
        setModalType('add');
        setModalContent('');
        setShowModal(true);
    };

    // 確認新增筆記
    const confirmAddNote = () => {
        const [title, content] = modalContent.split('\n---\n');
        
        if (!title?.trim()) {
            safeAlert('請輸入筆記名稱！');
            return;
        }
        
        if (!content?.trim()) {
            safeAlert('請輸入筆記內容！');
            return;
        }
        
        const newNote = {
            id: Date.now(),
            title: title.trim(),
            content: content.trim(),
            subject: currentSubject
        };
        
        const result = addNote(newNote);
        if (result.success) {
            setNotes(getNotes());
            setSubjects(getSubjects());
            setShowModal(false);
            safeAlert(result.message);
        } else {
            safeAlert(result.message);
        }
    };

    // 編輯筆記
    const handleEditNote = (note) => {
        setEditingNote(note);
        setModalType('edit');
        setModalContent(`${note.title}\n---\n${note.content}`);
        setShowModal(true);
        setActiveActionBar(null);
    };

    // 確認編輯筆記
    const confirmEditNote = () => {
        const [title, content] = modalContent.split('\n---\n');
        
        if (!title?.trim()) {
            safeAlert('請輸入筆記名稱！');
            return;
        }
        
        if (!content?.trim()) {
            safeAlert('請輸入筆記內容！');
            return;
        }
        
        const updatedNote = {
            title: title.trim(),
            content: content.trim()
        };
        
        const result = updateNote(editingNote.id, updatedNote);
        if (result.success) {
            setNotes(getNotes());
            setShowModal(false);
            setEditingNote(null);
            safeAlert(result.message);
        } else {
            safeAlert(result.message);
        }
    };

    // 查看筆記
    const handleViewNote = (note) => {
        setModalType('view');
        setModalContent(note);
        setShowModal(true);
        setActiveActionBar(null);
    };

    // 刪除筆記
    const handleDeleteNote = (note) => {
        safeConfirm('確定要刪除這則筆記嗎？', 
            () => {
                const result = deleteNote(note.id);
                setNotes(getNotes());
                setActiveActionBar(null);
                safeAlert(result.message);
            },
            () => {}
        );
    };

    // 搬移筆記
    const handleMoveNote = (note) => {
        setMovingNote(note);
        setSelectedMoveSubject(note.subject);
        setModalType('move');
        setShowModal(true);
        setActiveActionBar(null);
    };

    // 確認搬移筆記
    const confirmMoveNote = () => {
        if (!selectedMoveSubject) {
            safeAlert('請選擇或輸入主題名稱！');
            return;
        }
        
        const result = moveNote(movingNote.id, selectedMoveSubject);
        if (result.success) {
            setNotes(getNotes());
            setSubjects(getSubjects());
            setShowModal(false);
            setMovingNote(null);
            safeAlert(result.message);
        } else {
            safeAlert(result.message);
        }
    };

    // 生成題目
    const handleGenerateQuestions = (note) => {
        const result = generateQuestions(note.id);
        safeAlert(result.message);
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
            if (!event.target.closest('.custom-select-container')) {
                setIsDropdownOpen(false);
            }
            if (!event.target.closest('.move-custom-select-container')) {
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
                    {activeActionBar === note.id && (
                        <div className={styles.actionBar}>
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
                    )}
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
                                        placeholder="請輸入筆記內容..."
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
                                <div className={styles.moveCustomSelectContainer} style={{ marginBottom: '15px' }}>
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
                            <div className={styles.customSelectContainer}>
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
                                {isDropdownOpen && (
                                    <div className={styles.customDropdown}>
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
                                                    <button
                                                        key={subject}
                                                        className={`${styles.customDropdownOption} ${subject === currentSubject ? styles.selected : ''}`}
                                                        onClick={() => selectSubject(subject)}
                                                    >
                                                        <span className={styles.optionText}>{subject}</span>
                                                        <button 
                                                            className={styles.deleteOptionBtn}
                                                            onClick={(e) => handleDeleteSubject(subject, e)}
                                                        >
                                                            <Image src="/img/Vector-25.png" alt="刪除" width={16} height={16} />
                                                        </button>
                                                    </button>
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
                                )}
                            </div>
                        </div>
                        <button className={styles.addNoteButton} onClick={handleAddNote}>
                            新增筆記
                        </button>
                    </div>
                </div>

                <div className={styles.notesGrid}>
                    {getCurrentSubjectNotes().length === 0 ? (
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
                onLogout={logout}
            />

            {/* 動作背景 */}
            {activeActionBar && (
                <div 
                    className={styles.actionBackdrop} 
                    onClick={closeAllActionBars}
                />
            )}

            {/* 模態框 */}
            {renderModal()}
        </>
    );
}
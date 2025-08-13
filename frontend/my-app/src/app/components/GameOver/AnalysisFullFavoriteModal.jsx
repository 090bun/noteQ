"use client";
// 完整對話收藏模態框組件 - 允許用戶將整個 AI 對話記錄收藏到筆記本中

import { useState, useEffect } from "react";
import SubjectSelector from "./SubjectSelector";
import NoteSelector from "./NoteSelector";
import ContentEditor from "./ContentEditor";

export default function AnalysisFullFavoriteModal({
  isOpen,
  onClose,
  subjects,
  notes,
  onShowCustomAlert,
  onShowCustomPrompt,
  styles,
}) {
  const [currentSubject, setCurrentSubject] = useState("數學");
  const [currentNoteId, setCurrentNoteId] = useState(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPreviewMode, setIsPreviewMode] = useState(true);
  const [apiSubjects, setApiSubjects] = useState(null);
  const [apiNotes, setApiNotes] = useState(null);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  // quizData 中的預設值
  function getQuizSessionDefaults() {
    try {
      const raw =
        typeof window !== "undefined"
          ? window.sessionStorage.getItem("quizData")
          : null;
      if (!raw) return { subject: null, noteId: null, title: null };
      const data = JSON.parse(raw);

      // ★ quizData 結構調整時，改這裡
      const subject =
        data?.quiz?.quiz_topic ??
        (Array.isArray(data?.quizzes) && data.quizzes[0]?.quiz_topic) ??
        (Array.isArray(data?.topics) && data.topics[0]?.subject) ??
        null;

      const noteId = (Array.isArray(data?.notes) && data.notes[0]?.id) ?? null;

      const title =
        (Array.isArray(data?.notes) && data.notes[0]?.title) ??
        (Array.isArray(data?.topics) && data.topics[0]?.title) ??
        null;

      return { subject, noteId, title };
    } catch {
      return { subject: null, noteId: null, title: null };
    }
  }

  // API → subjects 的映射
  function mapApiToSubjects(apiData) {
    // ★ 未來 API 變更時，改這裡
    // 優先使用 favorite_quiz_topics（與 noteUtils 保持一致）
    if (apiData?.favorite_quiz_topics && Array.isArray(apiData.favorite_quiz_topics)) {
      return apiData.favorite_quiz_topics.map((q) => q?.quiz_topic).filter(Boolean);
    }
    
    // 後備方案：允許 data.subjects: ["數學","英文"] 或 [{name:"數學"}] 或從 quizzes 推導
    const rawSubjects = apiData?.subjects ?? apiData?.quizzes ?? [];
    return rawSubjects.map((s) =>
      typeof s === "string" ? s : s.name ?? s.quiz_topic ?? s.title ?? "未分類"
    );
  }

  // API → notes 的映射
  function mapApiToNotes(apiData) {
    // ★ 未來 API 變更時，改這裡
    // 優先使用 favorite_notes（與 noteUtils 保持一致）
    if (apiData?.favorite_notes && Array.isArray(apiData.favorite_notes)) {
      // 建立 id -> 名稱 對照
      const topics = Array.isArray(apiData?.favorite_quiz_topics)
        ? apiData.favorite_quiz_topics
        : [];
      const topicMap = new Map(
        topics.map((t) => [Number(t?.id), String(t?.quiz_topic || "").trim()])
      );

      return apiData.favorite_notes.map((n) => {
        // 決定標題：優先 title，其次 content 第一行，再不行給預設
        const rawTitle = n?.title ?? "";
        const fallbackFromContent = String(n?.content || "").split("\n")[0];
        const title =
          String(rawTitle).trim() || fallbackFromContent || "未命名筆記";

        // 獲取主題名稱
        const quizTopicId = n?.quiz_topic_id;
        const subject = topicMap.get(Number(quizTopicId)) || "";

        return {
          id: Number(n?.id),
          title,
          subject,
        };
      });
    }
    
    // 後備方案：允許 notes item: { id, title, subject } 或 subject 欄位名為 subject_name/topic/quiz_topic
    const rawNotes = apiData?.notes ?? [];
    return rawNotes.map((n) => ({
      id: n.id,
      title: n.title ?? n.name ?? `未命名筆記 ${n.id}`,
      subject:
        n.subject ?? n.subject_name ?? n.topic ?? n.quiz_topic ?? "未分類",
    }));
  }

  // 初始化時套用 quizData 預設值
  useEffect(() => {
    if (isOpen) {
      const ext =
        typeof window !== "undefined" ? window.__analysisFullContent : null;
      const fullContent =
        ext?.content ??
        `# 完整對話記錄

## 你打的問題會在這裡

## AI的回答在這裡`;

      setContent(fullContent);
      setNoteTitle(
        ext?.title ?? `完整對話收藏 - ${new Date().toLocaleDateString("zh-TW")}`
      );
      setCurrentSubject("數學");
      setCurrentNoteId(null);

      if (typeof window !== "undefined") {
        window.__analysisFullContent = null;
      }

      // ★ 追加：quizData 覆蓋預設
      const { subject, noteId, title } = getQuizSessionDefaults();
      if (subject) setCurrentSubject(subject);
      if (noteId !== null && noteId !== undefined) setCurrentNoteId(noteId);
      if (title) setNoteTitle(title);
    }
  }, [isOpen]);

  // 打 API 取得選項（在 isOpen 時觸發）
  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        setIsLoadingOptions(true);
        const token = localStorage.getItem("token");
        const res = await fetch(
          "http://127.0.0.1:8000/api/user_quiz_and_notes/",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );
        const data = await res.json();

        const subjectsFromApi = mapApiToSubjects(data);
        const notesFromApi = mapApiToNotes(data);

        setApiSubjects(subjectsFromApi);
        setApiNotes(notesFromApi);

        if (
          subjectsFromApi.length > 0 &&
          !subjectsFromApi.includes(currentSubject)
        ) {
          setCurrentSubject(subjectsFromApi[0]);
        }
      } catch (e) {
        console.error("取得主題/筆記選項失敗：", e);
        setApiSubjects(null);
        setApiNotes(null);
      } finally {
        setIsLoadingOptions(false);
      }
    })();
  }, [isOpen]);

  const handleConfirm = () => {
    if (!content.trim()) {
      onShowCustomAlert("沒有要收藏的對話內容！");
      return;
    }

    try {
      if (currentNoteId === "add_note" || currentNoteId === null) {
        // 新增筆記
        const userTitle = noteTitle.trim();
        const finalTitle =
          userTitle ||
          `完整對話收藏 - ${new Date().toLocaleDateString("zh-TW")}`;

        const newNote = {
          id: Date.now(),
          title: finalTitle,
          content: content,
          subject: currentSubject,
        };

        if (window.addNoteToSystem) {
          window.addNoteToSystem(newNote);
        }

        onShowCustomAlert(`完整對話已收藏到「${currentSubject}」主題！`);
      } else {
        // 添加到現有筆記
        const targetNote = Array.isArray(notes) ? notes.find((note) => note.id === currentNoteId) : null;

        if (targetNote) {
          const updatedContent = `${targetNote.content}

---

## 新增完整對話

${content}`;

          targetNote.content = updatedContent;

          onShowCustomAlert(`完整對話已添加到筆記「${targetNote.title}」中！`);
        } else {
          onShowCustomAlert("找不到選中的筆記！");
          return;
        }
      }

      onClose();
    } catch (error) {
      console.error("收藏失敗:", error);
      onShowCustomAlert("收藏失敗，請重試！");
    }
  };

  const effectiveSubjects = apiSubjects ?? subjects;
  const effectiveNotes = apiNotes ?? notes;

  const filteredNotes = Array.isArray(effectiveNotes) ? effectiveNotes.filter(
    (note) => note.subject === currentSubject
  ) : [];
  return (
    <div
      className={`${styles["analysis-full-favorite-modal"]} ${
        isOpen ? styles.active : ""
      }`}
    >
      <div className={styles["analysis-full-favorite-modal-content"]}>
        <div className={styles["analysis-full-favorite-modal-header"]}>
          <h2 className={styles["analysis-full-favorite-modal-title"]}>
            收藏完整對話
          </h2>
          <button
            className={styles["analysis-full-favorite-modal-close"]}
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className={styles["analysis-full-favorite-modal-body"]}>
          <div className={styles["analysis-full-favorite-content-info"]}>
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
            subjects={effectiveSubjects}
            currentSubject={currentSubject}
            onSubjectChange={setCurrentSubject}
            onShowCustomPrompt={onShowCustomPrompt}
            onShowCustomAlert={onShowCustomAlert}
            styles={styles}
            type="analysis-full-favorite"
          />

          <NoteSelector
            notes={filteredNotes}
            currentNoteId={currentNoteId}
            onNoteChange={setCurrentNoteId}
            styles={styles}
            type="analysis-full-favorite"
            currentSubject={currentSubject}
          />

          {(currentNoteId === "add_note" || currentNoteId === null) && (
            <div className={styles["analysis-full-favorite-note-title-input"]}>
              <label className={styles["analysis-full-favorite-filter-label"]}>
                筆記標題
              </label>
              <input
                type="text"
                className={styles["analysis-full-favorite-note-title-field"]}
                placeholder="請輸入筆記標題..."
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className={styles["analysis-full-favorite-modal-footer"]}>
          <button
            className={`${styles["analysis-full-favorite-modal-btn"]} ${styles["analysis-full-favorite-modal-btn-secondary"]}`}
            onClick={onClose}
          >
            取消
          </button>
          <button
            className={`${styles["analysis-full-favorite-modal-btn"]} ${styles["analysis-full-favorite-modal-btn-primary"]}`}
            onClick={handleConfirm}
          >
            收藏
          </button>
        </div>
      </div>
    </div>
  );
}

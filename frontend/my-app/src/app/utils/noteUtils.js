// 筆記系統工具函數

// 模擬資料庫（保留用於向後兼容）
let notes = [];
let subjects = [];

// 清理文字內容 - 保留換行符
export function cleanTextContent(text) {
  return text
    .replace(/\r\n/g, "\n") // 統一換行符
    .replace(/\r/g, "\n") // 統一換行符
    .replace(/\n\s*\n\s*\n+/g, "\n\n") // 多個連續換行符合併為兩個
    .trim(); // 移除首尾空白
}

// 本地Markdown解析函數
export function parseMarkdown(text) {
  return (
    text
      // 標題
      .replace(/^### (.*$)/gim, "<h3>$1</h3>")
      .replace(/^## (.*$)/gim, "<h2>$1</h2>")
      .replace(/^# (.*$)/gim, "<h1>$1</h1>")
      // 粗體
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      // 斜體
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      // 程式碼
      .replace(/`(.*?)`/g, "<code>$1</code>")
      // 列表
      .replace(/^- (.*$)/gim, "<li>$1</li>")
      // 分隔線
      .replace(/^---$/gim, "<hr>")
      // 換行
      .replace(/\n/g, "<br>")
  );
}

// 獲取筆記數據
export async function getNotes() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/user_quiz_and_notes/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
    });

    if (!res.ok) {
      console.error("獲取筆記失敗：", res.status, await res.text());
      return [];
    }

    const data = await res.json();

    // 轉換 favorite_notes 為標準格式
    const apiNotes = Array.isArray(data?.favorite_notes)
      ? data.favorite_notes.map((n) => {
          // 決定標題：優先 title，其次 content 第一行，再不行給預設
          const rawTitle = n?.title ?? "";
          const fallbackFromContent = String(n?.content || "").split("\n")[0];
          const title =
            String(rawTitle).trim() || fallbackFromContent || "未命名筆記";

          // 嘗試解析 content
          let parsedContent = "";
          if (typeof n?.content === "string") {
            try {
              const obj = JSON.parse(n.content.replace(/'/g, '"'));
              parsedContent = obj.explanation_text || "";
            } catch {
              parsedContent = n.content;
            }
          } else if (typeof n?.content === "object" && n?.content !== null) {
            parsedContent = n.content.explanation_text || "";
          }

          return {
            id: Number(n?.id),
            title,
            content: parsedContent,
            subject: n?.quiz_topic || "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        })
      : [];

    return apiNotes;
  } catch (error) {
    console.error("獲取筆記失敗:", error);
    return [];
  }
}

// 獲取主題數據
export async function getSubjects() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/user_quiz_and_notes/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
    });

    if (!res.ok) {
      console.error("獲取主題失敗：", res.status, await res.text());
      return [];
    }

    const data = await res.json();
    const apiSubjects = Array.isArray(data?.favorite_quiz_topics)
      ? data.favorite_quiz_topics.map((q) => q?.quiz_topic).filter(Boolean)
      : [];

    return apiSubjects;
  } catch (error) {
    console.error("獲取主題失敗:", error);
    return [];
  }
}

// 添加筆記
export async function addNote(note) {
  try {
    // 構建API請求數據
    const apiData = {
      quiz_topic: note.subject, // 主題ID
      content: note.content, // 筆記內容
    };

    const res = await fetch("http://127.0.0.1:8000/api/notes/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
      body: JSON.stringify(apiData),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("新增筆記失敗：", res.status, errorText);
      return { success: false, message: `新增筆記失敗：${res.status}` };
    }

    const result = await res.json();
    return { success: true, message: "筆記添加成功！", data: result };
  } catch (error) {
    console.error("新增筆記失敗:", error);
    return { success: false, message: "保存失敗，請重試！" };
  }
}

// 刪除筆記
export async function deleteNote(noteId) {
  try {
    const res = await fetch(`http://127.0.0.1:8000/api/notes/${noteId}/`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("刪除筆記失敗：", res.status, errorText);
      return { success: false, message: `刪除筆記失敗：${res.status}` };
    }

    return { success: true, message: "筆記已刪除！" };
  } catch (error) {
    console.error("刪除筆記失敗:", error);
    return { success: false, message: "刪除失敗，請重試！" };
  }
}

// 編輯筆記
export async function updateNote(noteId, updatedNote) {
  try {
    // 構建API請求數據
    const apiData = {
      title: updatedNote.title,
      content: updatedNote.content,
    };

    const res = await fetch(`http://127.0.0.1:8000/api/notes/${noteId}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
      body: JSON.stringify(apiData),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("編輯筆記失敗：", res.status, errorText);
      return { success: false, message: `編輯筆記失敗：${res.status}` };
    }

    const result = await res.json();
    return { success: true, message: "筆記更新成功！", data: result };
  } catch (error) {
    console.error("編輯筆記失敗:", error);
    return { success: false, message: "編輯失敗，請重試！" };
  }
}

// 搬移筆記
export async function moveNote(noteId, newSubject) {
  try {
    // 構建API請求數據
    const apiData = {
      quiz_topic: newSubject,
    };

    const res = await fetch(`http://127.0.0.1:8000/api/notes/${noteId}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
      body: JSON.stringify(apiData),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("搬移筆記失敗：", res.status, errorText);
      return { success: false, message: `搬移筆記失敗：${res.status}` };
    }

    const result = await res.json();
    return {
      success: true,
      message: `筆記已搬移到「${newSubject}」主題！`,
      data: result,
    };
  } catch (error) {
    console.error("搬移筆記失敗:", error);
    return { success: false, message: "搬移失敗，請重試！" };
  }
}

// 添加主題
export async function addSubject(subjectName) {
  const name = String(subjectName || "").trim();
  if (!name) {
    return { success: false, message: "請輸入有效的主題名稱！" };
  }
  try {
    const res = await fetch("http://127.0.0.1:8000/api/create_quiz/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
      body: JSON.stringify({ quiz_topic: name }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("新增主題失敗：", res.status, text);
      return {
        success: false,
        message: `新增主題失敗（${res.status}）${text ? "：" + text : ""}`,
      };
    }
    // 後端成功 -> 同步本地暫存（保持舊行為，不影響前端現有流程）
    if (!subjects.includes(name)) subjects.push(name);
    return { success: true, message: `主題「${name}」新增成功！` };
  } catch (err) {
    console.error("新增主題發生錯誤：", err);
    return { success: false, message: "新增失敗，請稍後再試。" };
  }
}

// 刪除主題
export async function deleteSubject(subjectName) {
  try {
    // 先向後端查詢主題清單，找出要刪除的主題 id
    const lookupRes = await fetch(
      "http://127.0.0.1:8000/api/user_quiz_and_notes/",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      }
    );
    if (!lookupRes.ok) {
      const text = await lookupRes.text().catch(() => "");
      console.error("查詢主題清單失敗：", lookupRes.status, text);
      return {
        success: false,
        message: `查詢主題清單失敗（${lookupRes.status}）`,
      };
    }
    const data = await lookupRes.json();
    const topics = Array.isArray(data?.favorite_quiz_topics)
      ? data.favorite_quiz_topics
      : [];
    const target = topics.find(
      (t) => String(t?.quiz_topic || "").trim() === String(subjectName).trim()
    );
    const topicId = Number(target?.id);
    if (!Number.isFinite(topicId)) {
      return { success: false, message: "找不到對應的主題 ID，無法刪除！" };
    }

    // 呼叫後端軟刪除 API
    const delRes = await fetch(
      `http://127.0.0.1:8000/api/quiz/${topicId}/soft-delete/`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      }
    );
    if (!delRes.ok) {
      const text = await delRes.text().catch(() => "");
      console.error("刪除主題失敗：", delRes.status, text);
      return {
        success: false,
        message: `刪除失敗（${delRes.status}）${text ? "：" + text : ""}`,
      };
    }

    // 後端刪除成功 -> 同步本地暫存
    notes = notes.filter((note) => note.subject !== subjectName);
    subjects = subjects.filter((subject) => subject !== subjectName);
    return { success: true, message: `主題「${subjectName}」已刪除！` };
  } catch (error) {
    console.error("刪除主題發生錯誤：", error);
    return { success: false, message: "刪除失敗，請稍後再試。" };
  }
}

// 根據主題篩選筆記
export async function getNotesBySubject(subject) {
  const allNotes = await getNotes();
  return allNotes.filter((note) => note.subject === subject);
}

// 生成題目
export function generateQuestions(noteId) {
  // 這個功能暫時保留本地邏輯
  const note = notes.find((n) => n.id === noteId);
  if (note) {
    return {
      success: true,
      message: `正在根據筆記「${note.title}」生成題目...\n\n題目已生成完成！\n\n題目：基於${note.subject}的相關練習題\n\n請前往遊戲頁面查看新生成的題目。`,
    };
  }
  return { success: false, message: "找不到要生成題目的筆記！" };
}

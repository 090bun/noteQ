from flask import Flask, request, jsonify
# 更新 OpenAI 導入方式
from openai import OpenAI
import os
import json
from dotenv import load_dotenv  
import requests

# 載入 .env 檔案
load_dotenv()  

app = Flask(__name__)


def generate_questions_with_ai(topic, difficulty, count):
    """使用 AI 生成題目"""
    print(f"=== 開始生成題目 ===")
    print(f"主題: {topic}, 難度: {difficulty}, 數量: {count}")

    # 檢查 API Key
    api_key = os.getenv('OPENAI_API_KEY', 'your-api-key-here')

    if api_key == 'your-api-key-here' or not api_key:
        return generate_mock_questions(topic, count)

    # 使用新版 OpenAI 客戶端
    client = OpenAI(api_key=api_key)

    prompt = f"""
你是一位擁有跨領域知識的「全能出題專家」，精通各式各樣的領域。你能根據任何主題快速理解核心概念，並創造出貼近該主題、具有啟發性與準確性的題目。題目必須知識正確、邏輯嚴謹、無語病。
請根據以下條件生成 {count} 道選擇題：

特殊規則：
1. 如果主題為純數字或數字組合，請生成數學計算相關題目，並確保答案正確。
2. 如果主題為如果主題為無意義字串（與任何已知領域無關），請直接回傳：
"主題無法產生合理題目。"
不要輸出其他內容。
3. 答案不能是疑問句
4. 題數必須精確為 {count} 題，不可少於或多於該數量。
5. 如果{topic}是數學題的話請務必先計算出正確答案，再將正確答案填入 correct_answer 欄位。請勿猜測或隨意填寫，必保證答案正確。

難度說明：
題目必須與設定的難度相符，避免過於簡單或過於困難。
- beginner: 基礎概念，適合初學者
- intermediate: 中等難度，需要一定理解力  
- advanced: 進階內容，需要深入思考
- master: 專家級別，需要精熟此{topic}主題才能回答得出來
- test: 測試題目，由beginner intermediate advanced master四種難度平均組成

輸入參數：
主題：{topic} 
難度：{difficulty}
題目數量：{count} 題（必須生成完整的 {count} 題，且不會有重複的題目）


每道題目需包含：
1. 題目描述 (title) - 請使用繁體中文
2. 四個選項 (option_A, option_B, option_C, option_D) - 請使用繁體中文
3. 正確答案 (correct_answer: A/B/C/D)
4. 題目解析 (explanation_text) - 請使用繁體中文
請回傳json format, do not use markdown syntax only text，格式如下：
[
    {{
        "title": "題目描述（繁體中文）",
        "option_A": "選項A",
        "option_B": "選項B", 
        "option_C": "選項C",
        "option_D": "選項D",
        "correct_answer": "A",
        "explanation_text": "這是題目的解析"(繁體中文)
    }}
]
"""

    try:
        # 使用新版 API 語法
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "你是一個題目生成助手，請根據使用者的需求生成題目。"},
                {"role": "user", "content": prompt}
            ],
            temperature=0.9,
            max_tokens=4000  # 增加最大 token 數以支持更多題目
        )

        ai_response = response.choices[0].message.content
        print(f"=== OpenAI API 回應詳情 ===")
        print(f"使用的 tokens: {response.usage.total_tokens if hasattr(response, 'usage') else '未知'}")
        print(f"完成原因: {response.choices[0].finish_reason if hasattr(response.choices[0], 'finish_reason') else '未知'}")
        print(f"回應長度: {len(ai_response)} 字元")
        print(f"AI 回應: {ai_response}")

        return parse_ai_response(ai_response, count)

    except Exception as e:
        print(f"❌ OpenAI API 錯誤: {str(e)}")
        print(f"錯誤類型: {type(e).__name__}")
        return generate_mock_questions(topic, count)


def parse_ai_response(ai_text, count=1):
    """解析 AI 回應格式化為標準格式"""
    try:
        # 先印出 AI 的原始回應來除錯
        print(f"AI 原始回應: {ai_text}")
        print(f"回應長度: {len(ai_text)} 字元")

        # 嘗試直接解析 JSON
        questions = json.loads(ai_text)

        # 驗證格式並補充缺失欄位
        formatted_questions = []
        for q in questions:
            formatted_q = {
                "title": q.get("title", "預設題目"),
                "option_A": q.get("option_A", "選項A"),
                "option_B": q.get("option_B", "選項B"),
                "option_C": q.get("option_C", "選項C"),
                "option_D": q.get("option_D", "選項D"),
                "correct_answer": q.get("correct_answer", "A"),
                "User_answer": "",  # 預設空值
                "explanation_text": q.get("explanation_text", "這是題目的解析"),
                "Ai_answer": q.get("correct_answer", "A")
            }
            formatted_questions.append(formatted_q)

        return formatted_questions

    except json.JSONDecodeError as e:
        # 如果解析失敗，回傳模擬資料
        print(f"JSON 解析錯誤: {str(e)}")
        print(f"無法解析的內容: {ai_text[:200]}...")  # 只顯示前200字元
        return generate_mock_questions("解析失敗", count)

def generate_mock_questions(topic, count):
    """生成模擬題目（當 AI 服務不可用時使用）"""
    mock_questions = []
    for i in range(count):
        mock_q = {
            "title": f"伺服器維修中",
            "option_A": "錯誤",
            "option_B": "錯誤", 
            "option_C": "錯誤",
            "option_D": "錯誤",
            "correct_answer": "錯誤",
            "User_answer": "",
            "Ai_answer": "X",
            "explanation_text": "錯誤"
        }
        mock_questions.append(mock_q)
    
    return mock_questions
    


@app.route('/api/quiz', methods=['POST'])
def create_quiz():
    """使用 AI 生成題目"""
    try:
        data = request.json
        print(f"=== Flask 接收到的請求 ===")
        print(f"完整請求數據: {data}")
        print(f"請求來源: {request.headers.get('User-Agent', 'Unknown')}")
        
        # 檢查字符編碼
        topic_raw = data.get('topic', '')
        print(f"原始 topic: {repr(topic_raw)}")
        print(f"topic 類型: {type(topic_raw)}")
        print(f"topic 編碼: {topic_raw.encode('utf-8') if isinstance(topic_raw, str) else 'N/A'}")
        print("=" * 50)
        
        # 強制輸出到控制台
        import sys
        sys.stdout.flush()
        
        topic = data.get('topic', '')
        difficulty = data.get('difficulty', 'test')
        question_count = data.get('question_count', 1)
        
        print(f"解析的參數:")
        print(f"  topic: {topic}")
        print(f"  difficulty: {difficulty}")
        print(f"  question_count: {question_count}")
        print("=" * 50)

        # 驗證難度等級
        valid_difficulties = ['beginner', 'intermediate', 'advanced', 'master', 'test']
        if difficulty not in valid_difficulties:
            return jsonify({
                "error": f"Invalid difficulty level. Valid options are: {', '.join(valid_difficulties)}"
            }), 400

        if not topic:
            return jsonify({"error": "Topic is required"}), 400
        
        # 呼叫 AI 生成題目
        generated_questions = generate_questions_with_ai(topic, difficulty, question_count)
        
        # 直接返回生成的題目，讓 Django 處理儲存
        return jsonify({
            "quiz_topic": topic,
            "questions": generated_questions,
            "message": "Questions generated successfully"
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/quiz_list', methods=['GET'])
def get_quiz():
    """從 Django API 獲取 quiz 和相關的 topic 數據"""
    try:
        # 調用 Django API 而不是直接連接資料庫
        
        # 這裡需要一個有效的 JWT token 來調用 Django API
        # 你可能需要根據實際情況調整認證方式
        django_response = requests.get('http://localhost:8000/api/create_quiz/')
        
        if django_response.status_code != 200:
            return jsonify({
                "error": f"Django API error: {django_response.status_code}",
                "details": django_response.text
            }), 500
        
        # 直接返回 Django 的響應
        return jsonify(django_response.json())
        
    except requests.exceptions.ConnectionError:
        return jsonify({
            "error": "Cannot connect to Django service. Make sure it is running on port 8000."
        }), 503
    except Exception as e:
        return jsonify({"error": f"Flask service error: {str(e)}"}), 500

@app.route('/api/get_quiz/', methods=['GET'])
def get_quiz_alt():
    # 重定向到 Django API
    try:
        django_response = requests.get('http://localhost:8000/api/quiz/')
        
        if django_response.status_code != 200:
            return jsonify({
                "error": f"Django API error: {django_response.status_code}",
                "details": django_response.text
            }), 500
        
        return jsonify(django_response.json())
        
    except Exception as e:
        return jsonify({"error": f"Error: {str(e)}"}), 500


@app.route('/api/chat', methods=['POST'])
def chat_with_ai():
    """處理 AI 聊天請求，支援歷史對話"""
    try:
        data = request.json
        topic_id = data.get('topic_id')
        user_id = data.get('user_id')
        content = data.get('content')
        chat_history = data.get('chat_history', [])

        if not topic_id or not user_id or not content:
            return jsonify({"error": "topic_id, user_id, and content are required"}), 400

        print(f"=== 處理聊天請求 ===")
        print(f"用戶ID: {user_id}, 主題ID: {topic_id}")
        print(f"用戶訊息: {content}")
        print(f"歷史對話數量: {len(chat_history)}")

        # 檢查 API Key
        api_key = os.getenv('OPENAI_API_KEY', 'your-api-key-here')

        if api_key == 'your-api-key-here' or not api_key:
            # 使用假資料回應
            mock_response = {
                "topic_id": topic_id,
                "user_id": user_id,
                "response": f"這是針對您的問題「{content}」的 AI 回應。基於您的對話歷史，我理解您想了解更多相關內容。",
                "sender": "ai"
            }
            return jsonify(mock_response), 200

        # 使用真實 OpenAI API
        try:
            client = OpenAI(api_key=api_key)
            
            # 構建對話上下文
            messages = [
                {
                    "role": "system", 
                    "content": "你是一個有用的學習助手，專門協助學生理解題目和相關知識。請用繁體中文回答，並根據對話歷史提供連貫的回應。"
                }
            ]
            
            # 添加歷史對話
            for chat in chat_history[:-1]:  # 排除最後一條（當前用戶訊息）
                role = "user" if chat['sender'] == 'user' else "assistant"
                messages.append({
                    "role": role,
                    "content": chat['content']
                })
            
            # 添加當前用戶訊息
            messages.append({
                "role": "user",
                "content": content
            })
            
            print(f"發送給 OpenAI 的訊息數量: {len(messages)}")
            
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages,
                temperature=0.7,
                max_tokens=500
            )
            
            ai_response = response.choices[0].message.content
            
            return jsonify({
                "topic_id": topic_id,
                "user_id": user_id,
                "response": ai_response,
                "sender": "ai",
                "tokens_used": response.usage.total_tokens if hasattr(response, 'usage') else 0
            }), 200
            
        except Exception as e:
            print(f"❌ OpenAI API 錯誤: {str(e)}")
            # 如果 API 失敗，回退到智能假資料
            smart_mock_response = generate_smart_response(content, chat_history)
            return jsonify({
                "topic_id": topic_id,
                "user_id": user_id,
                "response": smart_mock_response,
                "sender": "ai",
                "note": "使用本地回應（OpenAI API 不可用）"
            }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


def generate_smart_response(user_content, chat_history):
    """基於用戶輸入和歷史生成智能假回應"""
    # 分析用戶問題類型
    if any(keyword in user_content.lower() for keyword in ['什麼', '如何', '怎麼', '為什麼']):
        response_type = "解釋"
    elif any(keyword in user_content.lower() for keyword in ['舉例', '例子', '範例']):
        response_type = "舉例"
    elif any(keyword in user_content.lower() for keyword in ['步驟', '流程', '過程']):
        response_type = "步驟說明"
    else:
        response_type = "一般回應"
    
    # 檢查歷史對話是否有相關內容
    context = ""
    if chat_history:
        context = f"根據我們之前的討論，"
    
    # 生成對應的回應
    responses = {
        "解釋": f"{context}關於「{user_content}」，我來為您詳細解釋。這個概念涉及多個層面，讓我一步步為您說明其核心要點和應用場景。",
        "舉例": f"{context}針對您提到的「{user_content}」，我可以提供一些具體的例子來幫助您理解。",
        "步驟說明": f"{context}對於「{user_content}」的流程，我建議按照以下步驟進行：1) 先分析問題 2) 制定策略 3) 執行方案 4) 檢查結果。",
        "一般回應": f"{context}感謝您的問題「{user_content}」。讓我基於相關知識為您提供有用的見解和建議。"
    }
    
    return responses.get(response_type, f"我理解您關於「{user_content}」的問題，讓我為您提供相關的資訊和建議。")



# GPT統整note content 資料

def parse_note_content(content):
    print("----content內容------")
    print(content)
    print("----content內容------")
    api_key = os.getenv('OPENAI_API_KEY', '')
    if api_key == '' or not api_key:
        print("API key is missing.")
        return content  # 直接返回原始內容

    print("~~~~~~~~~~~~~~~~~")
    try:
        client = OpenAI(api_key=api_key)
        prompt = f"""
        1. 分析文章內容，提取關鍵主題。
        2. 根據主題，設計一個測驗標題。
        3. 測驗標題需簡短、有吸引力，且字數不超過30字。
        4. 只輸出測驗標題，不需要多餘解釋。
        需整理內容：{content}

        請直接回傳整理後的內容，不要使用任何格式標記。
        """
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "user", "content": prompt}
            ],
            temperature=0.8
        )
        
        processed_content = response.choices[0].message.content.strip()
        print("----以下GPT彙整content內容----")
        print(processed_content)
        print("----以上GPT彙整content內容 END------")

        return processed_content  # 返回處理後的純文字內容
        
    except Exception as e:
        print(f"GPT 處理錯誤: {str(e)}")
        return content  # 如果出錯，返回原始內容


@app.route('/api/retest',methods=['POST'])
def retest():
    # 取出django輸入的 content
    try:
        data=request.json
        content = data.get('content', '內容未提供')

        if content =="內容未提供" :
            return jsonify({"error": "內容未提供"}), 400

        # 進行重新測試的content整理
        parse_content = parse_note_content(content)
        return jsonify({"content": parse_content}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# GPT 解析題目
# 目前整合在一起 暫時保留
# -----------------------------------
@app.route('/api/parse_answer', methods=['POST'])
def parse_answer():
    print("=== 開始解析答案 ===")
    data = request.json
    title = data.get('title')
    Ai_answer = data.get('Ai_answer')
    print(f"接收到 {title} {Ai_answer}")
    if not title or not Ai_answer:
        return jsonify({"error": "Title and AI answer are required"}), 400

    # Call OpenAI API to parse the question
    api_key = os.getenv('OPENAI_API_KEY', '')
    if not api_key:
        return jsonify({"error": "API key is missing"}), 400

    try:
        client = OpenAI(api_key=api_key)
        prompt = f"""
        你是一個題目解析專家，請根據以下內容進行詳細解釋：
        題目:{title},解答:{Ai_answer}
        直接回傳整理後的內容，不要使用任何格式標記。
        """
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "user", 
                    "content":
                      f"""
                        題目:{title}
                        解答:{Ai_answer}
                        解析:{prompt}
                    """
                }
            ]
        )

        parsed_answer = response.choices[0].message.content.strip()
        return jsonify({"parsed_answer": parsed_answer}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
# -----------------------------------
# 目前整合在一起 暫時保留
# GPT 解析題目

if __name__ == '__main__':
    app.run(debug=True, port=5000)


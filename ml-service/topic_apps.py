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
    請用繁體中文回答，請根據以下條件生成 {count} 道選擇題：
    主題：{topic}
    難度：{difficulty}

    每道題目需包含：
    1. 題目描述 (title) - 請使用繁體中文
    2. 四個選項 (option_a, option_b, option_c, option_d) - 請使用繁體中文
    3. 正確答案 (correct_answer: A/B/C/D)

    請回傳json format, do not use markdown syntax only text，格式如下：
    [
        {{
            "title": "題目描述（繁體中文）",
            "option_a": "選項A",
            "option_b": "選項B", 
            "option_c": "選項C",
            "option_d": "選項D",
            "correct_answer": "A"
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
            temperature=0.7
        )

        ai_response = response.choices[0].message.content
        print(ai_response)

        return parse_ai_response(ai_response)

    except Exception as e:
        print(f"❌ OpenAI API 錯誤: {str(e)}")
        print(f"錯誤類型: {type(e).__name__}")
        return generate_mock_questions(topic, count)


def parse_ai_response(ai_text):
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
                "option_a": q.get("option_a", "選項A"),
                "option_b": q.get("option_b", "選項B"),
                "option_c": q.get("option_c", "選項C"),
                "option_d": q.get("option_d", "選項D"),
                "correct_answer": q.get("correct_answer", "A"),
                "User_answer": "",  # 預設空值
                "Ai_answer": q.get("correct_answer", "A")
            }
            formatted_questions.append(formatted_q)

        return formatted_questions

    except json.JSONDecodeError as e:
        # 如果解析失敗，回傳模擬資料
        print(f"JSON 解析錯誤: {str(e)}")
        print(f"無法解析的內容: {ai_text[:200]}...")  # 只顯示前200字元
        return generate_mock_questions("解析失敗", 1)

def generate_mock_questions(topic, count):
    """生成模擬題目（當 AI 服務不可用時使用）"""
    mock_questions = []
    for i in range(count):
        mock_q = {
            "title": f"關於 {topic} 的題目 {i+1}",
            "option_a": "選項 A",
            "option_b": "選項 B", 
            "option_c": "選項 C",
            "option_d": "選項 D",
            "correct_answer": "A",
            "User_answer": "",
            "Ai_answer": "A"
        }
        mock_questions.append(mock_q)
    
    return mock_questions

@app.route('/api/quiz', methods=['POST'])
def create_quiz():
    """使用 AI 生成題目"""
    try:
        data = request.json
        topic = data.get('topic', '')
        difficulty = data.get('difficulty', 'medium')
        question_count = data.get('question_count', 1)

        if not topic:
            return jsonify({"error": "Topic is required"}), 400
        
        # 呼叫 AI 生成題目
        generated_questions = generate_questions_with_ai(topic, difficulty, question_count)
        
        # 透過 Django API 存入資料庫
        django_response = save_to_django_api( topic, difficulty, generated_questions)

        if django_response.get('success'):
            return jsonify({
                "quiz_topic": topic,
                "questions": generated_questions,
                "message": "Questions generated and saved to database successfully",
                "quiz_id": django_response.get('quiz_id')
            }), 201
        else:
            return jsonify({
                "quiz_topic": topic,
                "questions": generated_questions,
                "message": "Questions generated but failed to save to database",
                "error": django_response.get('error')
            }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def save_to_django_api( topic, difficulty, questions):
    #透過 Django API 存入資料庫
    try:
        django_data = {
            "topic": topic,
            "difficulty": difficulty,
            "questions": questions
        }
        print(f"~~~~~ 傳送到 Django API 的資料: {django_data} ~~~~~")
        response = requests.post(
            'http://localhost:8000/api/quiz/',
            json=django_data,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 201:
            return {"success": True, "quiz_id": response.json().get('id')}
        else:
            return {"success": False, "error": response.text}
            
    except Exception as e:
        return {"success": False, "error": str(e)}

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


if __name__ == '__main__':
    app.run(debug=True, port=5000)
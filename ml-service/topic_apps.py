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
        
        # 新增：透過 Django API 存入資料庫
        django_response = save_to_django_api(topic, difficulty, generated_questions)
        return jsonify({
                "quiz_topic": topic,
                "questions": generated_questions,
                "message": "Questions generated and saved to database successfully",
                "quiz_id": django_response.get('quiz_id')
            }), 201
        
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
    
def save_to_django_api(topic, difficulty, questions):
    #透過 Django API 存入資料庫
    try:
        django_data = {
            "topic": topic,
            "difficulty": difficulty,
            "questions": questions
        }
        
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

# 加入收藏&筆記 暫時放這
# @app.route('api/add_favorite/', methods=['POST'])
# def add_favorite():
#     try:




if __name__ == '__main__':
    app.run(debug=True, port=5000)
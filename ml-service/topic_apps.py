from flask import Flask, request, jsonify

app = Flask(__name__)



@app.route('/api/quiz', methods=['POST'])
def create_quiz():
    # 模擬從請求中獲取數據
    data = request.json
    
    # 這裡可以添加邏輯來處理數據並生成主題
    topic = {
        'title': data.get('title', 'Default Title'),
        'subtitle': data.get('subtitle', 'Default Subtitle'),
        'option_a': data.get('option_a', 'Default Option A'),
        'option_b': data.get('option_b', 'Default Option B'),
        'option_c': data.get('option_c', 'Default Option C'),
        'option_d': data.get('option_d', 'Default Option D'),
        'User_answer': data.get('User_answer', 'A'),
        'Ai_answer': data.get('Ai_answer', 'A')
    }
    quiz_topic ={
        'quiz_topic': data.get('quiz_topic', 'Default Quiz Topic'),
        # 如果需要其他字段，可以在這裡添加
    }

    return jsonify({
        "quiz_topic": quiz_topic['quiz_topic'],
        "title": topic['title'],
        "subtitle": topic['subtitle'],
        "option_a": topic['option_a'],
        "option_b": topic['option_b'],
        "option_c": topic['option_c'],
        "option_d": topic['option_d'],
        "User_answer": topic['User_answer'],
        "Ai_answer": topic['Ai_answer'],
        "message": "Topic created successfully"
    }), 201

@app.route('/api/quiz', methods=['GET'])
def get_quiz():
    """從 Django API 獲取 quiz 和相關的 topic 數據"""
    try:
        # 調用 Django API 而不是直接連接資料庫
        import requests
        
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
        import requests
        django_response = requests.get('http://localhost:8000/api/quiz/')
        
        if django_response.status_code != 200:
            return jsonify({
                "error": f"Django API error: {django_response.status_code}",
                "details": django_response.text
            }), 500
        
        return jsonify(django_response.json())
        
    except Exception as e:
        return jsonify({"error": f"Error: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
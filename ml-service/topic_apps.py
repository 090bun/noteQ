from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/api/create_quiz', methods=['POST'])
def create_quiz():
    # 模擬從請求中獲取數據
    data = request.json
    
    # 這裡可以添加邏輯來處理數據並生成主題
    topic = {
        'title': data.get('title', 'Default Title'),
        'subtitle': data.get('subtitle', 'Default Subtitle'),
        'User_answer': data.get('User_answer', 'Default User Answer'),
        'Ai_answer': data.get('Ai_answer', 'Default AI Answer')
    }
    quiz_topic ={
        'quiz_topic': data.get('quiz_topic', 'Default Quiz Topic'),
        # 如果需要其他字段，可以在這裡添加
    }

    return jsonify({
        "quiz_topic": quiz_topic['quiz_topic'],
        "title": topic['title'],
        "subtitle": topic['subtitle'],
        "User_answer": topic['User_answer'],
        "Ai_answer": topic['Ai_answer'],
        "message": "Topic created successfully"
    }), 201



if __name__ == '__main__':
    app.run(debug=True, port=5000)
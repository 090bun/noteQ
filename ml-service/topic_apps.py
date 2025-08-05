from flask import Flask, request, jsonify
import mysql.connector
from mysql.connector import Error

app = Flask(__name__)

# 資料庫連接配置
DB_CONFIG = {
    'host': '34.69.89.228',
    'database': 'noteQ',
    'user': 'bun',
    'password': '145879',
    'port': 3306
}

def get_db_connection():
    """獲取資料庫連接"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

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
    """從資料庫獲取 quiz 和相關的 topic 數據"""
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        
        # 獲取所有 Quiz
        cursor.execute("SELECT * FROM Quiz WHERE deleted_at IS NULL")
        quizzes = cursor.fetchall()
        
        quiz_list = []
        for quiz in quizzes:
            quiz_data = {
                'id': quiz['id'],
                'quiz_topic': quiz['quiz_topic'],
                'created_at': quiz['created_at'].isoformat() if quiz['created_at'] else None
            }
            
            # 獲取該 Quiz 相關的 Topics
            cursor.execute("""
                SELECT * FROM Topic 
                WHERE quiz_topic_id = %s AND deleted_at IS NULL
            """, (quiz['id'],))
            topics = cursor.fetchall()
            
            topic_list = []
            for topic in topics:
                topic_data = {
                    'id': topic['id'],
                    'title': topic['title'],
                    'subtitle': topic['subtitle'],
                    'option_a': topic['option_a'],
                    'option_b': topic['option_b'],
                    'option_c': topic['option_c'],
                    'option_d': topic['option_d'],
                    'User_answer': topic['User_answer'],
                    'Ai_answer': topic['Ai_answer'],
                    'created_at': topic['created_at'].isoformat() if topic['created_at'] else None
                }
                topic_list.append(topic_data)
            
            quiz_data['topics'] = topic_list
            quiz_list.append(quiz_data)
        
        return jsonify(quiz_list)
        
    except Error as e:
        return jsonify({"error": f"Database query failed: {str(e)}"}), 500
    
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/get_quiz/', methods=['GET'])
def get_quiz_alt():
    # 為了匹配您使用的 URL /api/get_quiz/
    return get_quiz()

if __name__ == '__main__':
    app.run(debug=True, port=5000)
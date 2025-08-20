# /topic_apps/wsgi.py
# 你的 Flask 主程式在 topic_apps.py，裡面有 app = Flask(__name__)
from topic_apps import app

# 本地單獨跑用，不影響 gunicorn
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)

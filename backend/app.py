"""
GESTAR+ - Backend API
Flask + SQLAlchemy (MySQL)
"""
import os

from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS

from extensions import db
from routes import register_routes

from sqlalchemy import create_engine

load_dotenv()

DB_HOST = os.environ.get("DB_HOST", "127.0.0.1")
DB_PORT = os.environ.get("DB_PORT", "3306")
DB_USER = os.environ.get("DB_USER", "root")
DB_PASSWORD = os.environ.get("DB_PASSWORD", "")
DB_NAME = os.environ.get("DB_NAME", "gestar")
FRONTEND_ORIGIN = os.environ.get("FRONTEND_ORIGIN", "http://localhost:5173")

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "gestar-development-secret")

# supports_credentials + origin explícito (no "*") son necesarios para que la
# cookie de sesión del login de enfermeros viaje entre localhost:5173 y :5000.
CORS(app, supports_credentials=True, origins=[FRONTEND_ORIGIN])

# Build MySQL URI from environment
mysql_uri = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Try to connect to MySQL; if it fails, fall back to a local SQLite file so the
# app can run without requiring the user's MySQL credentials during development.
db_uri = mysql_uri
try:
    # short connection test
    test_engine = create_engine(mysql_uri, connect_args={"connect_timeout": 5})
    conn = test_engine.connect()
    conn.close()
    print("Connected to MySQL, using MySQL for persistence.")
except Exception as e:
    fallback_path = os.path.join(os.path.dirname(__file__), "gestar_local.db")
    db_uri = f"sqlite:///{fallback_path}"
    print("Warning: could not connect to MySQL, falling back to SQLite at:", fallback_path)
    print("MySQL connect error:", e)

app.config["SQLALCHEMY_DATABASE_URI"] = db_uri
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)
register_routes(app)

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)

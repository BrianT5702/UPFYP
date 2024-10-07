from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import subprocess
import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:5702Tci123@localhost/cold_room_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['STATIC_FOLDER'] = 'C:/Users/brian/OneDrive/Desktop/UPFYP/Start/cold_room_project/models'
db = SQLAlchemy(app)

# Enable CORS for the entire app
CORS(app, resources={r"/*": {"origins": "http://localhost:3001"}})

@app.route('/')
def home():
    return {"message": "Welcome to the Cold Room API"}

@app.route('/create_model', methods=['POST'])
def create_model():
    data = request.get_json()
    length = data['length']
    width = data['width']
    height = data['height']
    unit = data['unit']  # Get the unit

    # Handle different units
    if unit == 'cm':
        length *= 10  # Convert to mm
        width *= 10   # Convert to mm
        height *= 10  # Convert to mm
    elif unit == 'inch':
        length *= 25.4  # Convert to mm
        width *= 25.4   # Convert to mm
        height *= 25.4  # Convert to mm

    # Command to run Blender with the script
    blender_command = [
        "blender",
        "--background",
        "--python", "create_cold_room.py",
        "--",
        "--length", str(length),
        "--width", str(width),
        "--height", str(height)
    ]

    # Execute the command
    try:
        print("Executing Blender command:", blender_command)  # Log the command
        subprocess.run(blender_command, check=True)
        print("Model creation command executed successfully.")  # Log success
        return jsonify({"message": "3D model created successfully."}), 200
    except subprocess.CalledProcessError as e:
        print("Error occurred while creating model:", str(e))  # Log the error
        return jsonify({"error": str(e)}), 500

@app.route('/models/<path:filename>', methods=['GET'])
def serve_model(filename):
    print(f"Requested model: {filename}")  # Log the requested filename
    return send_from_directory(app.config['STATIC_FOLDER'], filename)

if __name__ == '__main__':
    app.run(debug=True)

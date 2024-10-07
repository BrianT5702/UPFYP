from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import subprocess
import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:5702Tci123@localhost/cold_room_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['STATIC_FOLDER'] = 'C:/Users/brian/OneDrive/Desktop/UPFYP/Start/cold_room_project/models'  # Ensure this path is correct
db = SQLAlchemy(app)

# Enable CORS for the entire app
CORS(app, resources={r"/*": {"origins": "http://localhost:3001"}})

@app.route('/')
def home():
    return {"message": "Welcome to the Cold Room API"}

@app.route('/create_model', methods=['POST'])
def create_model():
    data = request.get_json()
    depth = data['depth']  # Z-axis
    width = data['width']   # X-axis
    height = data['height']  # Y-axis
    unit = data['unit']  # Get the measurement unit

    # Convert measurements to mm if needed
    if unit == 'cm':
        depth *= 10
        width *= 10
        height *= 10
    elif unit == 'inch':
        depth *= 25.4
        width *= 25.4
        height *= 25.4

    # Command to run Blender with the script
    blender_command = [
        "blender",
        "--background",
        "--python", "create_cold_room.py",
        "--",
        "--width", str(width),   # Pass width as x-axis
        "--height", str(height),  # Pass height as y-axis
        "--depth", str(depth)     # Pass depth as z-axis
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

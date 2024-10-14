import os
import subprocess
from flask import Flask, jsonify, request, send_file
import logging
import json
from flask_cors import CORS

# Directory for storing models and metadata
MODELS_DIR = os.path.normpath(r"C:/Users/brian/OneDrive/Desktop/UPFYP/Start/cold_room_project/models")
METADATA_FILE = os.path.join(MODELS_DIR, 'metadata.json')  # Metadata file path

app = Flask(__name__)
CORS(app)
logging.basicConfig(level=logging.DEBUG)


def save_metadata(filename, metadata):
    """Save metadata about the created model into a JSON file."""
    if os.path.exists(METADATA_FILE):
        with open(METADATA_FILE, 'r') as file:
            all_metadata = json.load(file)
    else:
        all_metadata = {}

    all_metadata[filename] = metadata

    with open(METADATA_FILE, 'w') as file:
        json.dump(all_metadata, file, indent=4)

def load_metadata():
    """Load metadata from the JSON file."""
    if os.path.exists(METADATA_FILE):
        with open(METADATA_FILE, 'r') as file:
            return json.load(file)
    return {}


@app.route('/create_room', methods=['POST'])
def create_room():
    data = request.json
    width = data.get('width')
    height = data.get('height')
    depth = data.get('depth')
    room_name = data.get('name')
    unit = data.get('unit', 'mm')

    if not all([width, height, depth, room_name]):
        return jsonify({"error": "Missing required parameters (width, height, depth, or name)"}), 400

    room_name_cleaned = "".join(c if c.isalnum() else "_" for c in room_name)
    model_filename = f'{room_name_cleaned}.glb'
    model_path = os.path.normpath(os.path.join(MODELS_DIR, model_filename))

    logging.info(f"Creating model: {model_filename}, with dimensions: {width}x{height}x{depth} ({unit})")

    # Save the model file using Blender (unchanged)
    blender_script_path = os.path.abspath('create_cold_room.py')
    blender_command = f'blender --background --python "{blender_script_path}" -- --width {width} --height {height} --depth {depth} --unit {unit} --filename "{model_path}"'

    try:
        result = subprocess.run(blender_command, shell=True, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        logging.debug(f"Blender stdout: {result.stdout}")
        logging.debug(f"Blender stderr: {result.stderr}")

        if os.path.exists(model_path):
            file_size = os.path.getsize(model_path)
            logging.info(f"Model created successfully: {model_filename} (Size: {file_size} bytes)")

            # Save the room details to metadata directly
            metadata = {
                "filename": model_filename,
                "name": room_name,
                "width": width,
                "height": height,
                "depth": depth,
                "unit": unit
            }

            # Save the metadata
            save_metadata(model_filename, metadata)

            return jsonify({"status": "Model generated successfully!", "filename": model_filename}), 201
        else:
            logging.error(f"Model file not found: {model_path}")
            return jsonify({"error": "Model generation failed. File not found."}), 500

    except subprocess.CalledProcessError as e:
        logging.error(f"Blender execution failed: {str(e)}")
        return jsonify({"error": f"Blender execution failed: {str(e)}"}), 500


@app.route('/models/<filename>', methods=['GET'])
def get_model(filename):
    model_path = os.path.join(MODELS_DIR, filename)
    if os.path.exists(model_path):
        return send_file(model_path, mimetype='model/gltf-binary', as_attachment=True)
    else:
        return jsonify({"error": "Model not found"}), 404


@app.route('/existing_rooms', methods=['GET'])
def get_existing_rooms():
    if not os.path.exists(MODELS_DIR):
        return jsonify({"message": "Models directory does not exist", "rooms": []}), 404

    metadata = load_metadata()
    rooms = []
    for filename in os.listdir(MODELS_DIR):
        if filename.endswith(".glb"):
            room_data = metadata.get(filename, {})
            if room_data:
                rooms.append({
                    "filename": filename,
                    "name": room_data.get("name", filename),
                    "width": room_data.get("width", "N/A"),
                    "depth": room_data.get("depth", "N/A"),
                    "height": room_data.get("height", "N/A")
                })

    return jsonify({"rooms": rooms}), 200


if __name__ == "__main__":
    if not os.path.exists(MODELS_DIR):
        os.makedirs(MODELS_DIR)
    app.run(port=5000, debug=True)

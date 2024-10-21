import os
import subprocess
from flask import Flask, jsonify, request, send_file
import logging
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS

# Directory for storing models
MODELS_DIR = os.path.normpath(r"C:/Users/brian/OneDrive/Desktop/UPFYP/Start/cold_room_project/models")

# Initialize Flask app
app = Flask(__name__)

# Set CORS to allow requests from localhost:3001
CORS(app)

# Set PostgreSQL database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:5702Tci123@localhost/cold_room_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db = SQLAlchemy(app)
migrate = Migrate(app, db)
logging.basicConfig(level=logging.DEBUG)

# Room model
class Room(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    room_type = db.Column(db.String(50), nullable=False)
    width = db.Column(db.Float, nullable=False)
    height = db.Column(db.Float, nullable=False)
    depth = db.Column(db.Float, nullable=False)
    features = db.Column(db.PickleType, nullable=True)
    exterior_filename = db.Column(db.String(200), nullable=True)  # Updated to allow nullable
    interior_filename = db.Column(db.String(200), nullable=True)  # Updated to allow nullable

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'room_type': self.room_type,
            'width': self.width,
            'height': self.height,
            'depth': self.depth,
            'features': self.features,
            'exterior_filename': self.exterior_filename,
            'interior_filename': self.interior_filename
        }

# ComplexRoom model
class ComplexRoom(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    rooms = db.Column(db.JSON)  # Store information about multiple rooms

    def __repr__(self):
        return f'<ComplexRoom {self.id}: {self.name}>'

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'rooms': self.rooms
        }

@app.route('/create_room', methods=['POST'])
def create_room():
    data = request.json
    width = data.get('width')
    height = data.get('height')
    depth = data.get('depth')
    room_name = data.get('name')
    unit = data.get('unit', 'mm')

    if not all([width, height, depth, room_name]):
        return jsonify({"error": "Missing required parameters"}), 400

    room_name_cleaned = "".join(c if c.isalnum() else "_" for c in room_name)
    exterior_filename = f'{room_name_cleaned}_exterior.glb'
    interior_filename = f'{room_name_cleaned}_interior.glb'
    exterior_path = os.path.normpath(os.path.join(MODELS_DIR, exterior_filename))
    interior_path = os.path.normpath(os.path.join(MODELS_DIR, interior_filename))

    logging.info(f"Creating models: {exterior_filename} and {interior_filename}, with dimensions: {width}x{height}x{depth} ({unit})")

    blender_script_path = os.path.abspath('create_cold_room.py')
    
    # Blender command to create both interior and exterior models
    blender_command = f'blender --background --python "{blender_script_path}" -- --width {width} --height {height} --depth {depth} --unit {unit} --exterior_filename "{exterior_path}" --interior_filename "{interior_path}"'

    try:
        result = subprocess.run(blender_command, shell=True, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        logging.debug(f"Blender stdout: {result.stdout}")
        logging.debug(f"Blender stderr: {result.stderr}")

        # Check if both files were successfully created
        if os.path.exists(exterior_path) and os.path.exists(interior_path):
            logging.info(f"Exterior and Interior models created: {exterior_filename}, {interior_filename}")

            new_room = Room(
                name=room_name,
                room_type='simple',
                width=width,
                depth=depth,
                height=height,
                features=[],
                exterior_filename=exterior_filename,
                interior_filename=interior_filename
            )
            db.session.add(new_room)
            db.session.commit()

            return jsonify({
                "status": "Models generated successfully!",
                "room_id": new_room.id,
                "exterior_filename": exterior_filename,
                "interior_filename": interior_filename
            }), 201
        else:
            # Add logging if one or both files are missing
            logging.error(f"Model generation failed: {exterior_path} or {interior_path} not found.")
            return jsonify({"error": "Model generation failed. Files not found."}), 500
        
    except subprocess.CalledProcessError as e:
        logging.error(f"Blender execution failed: {str(e)}")
        return jsonify({"error": f"Blender execution failed: {str(e)}"}), 500
    
@app.route('/rooms/<int:room_id>/features', methods=['POST'])
def add_feature(room_id):
    room = Room.query.get(room_id)
    if not room:
        return jsonify({"error": "Room not found"}), 404

    data = request.json
    feature_type = data.get('type')
    position = data.get('position')

    if not feature_type or not position:
        return jsonify({"error": "Missing feature type or position"}), 400

    room.features.append({
        "type": feature_type,
        "position": position
    })

    db.session.commit()

    return jsonify({"status": "Feature added successfully", "room": room.to_dict()}), 200

@app.route('/rooms/<int:room_id>', methods=['GET'])
def get_room(room_id):
    room = Room.query.get(room_id)
    if not room:
        return jsonify({"error": "Room not found"}), 404

    return jsonify(room.to_dict()), 200

@app.route('/existing_rooms', methods=['GET'])
def get_existing_rooms():
    rooms = Room.query.all()
    return jsonify({"rooms": [room.to_dict() for room in rooms]}), 200

@app.route('/rooms/<int:room_id>', methods=['DELETE'])
def delete_room(room_id):
    room = Room.query.get(room_id)
    if not room:
        return jsonify({"error": "Room not found"}), 404

    try:
        db.session.delete(room)
        db.session.commit()
        return jsonify({"status": "Room deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/models/<filename>', methods=['GET'])
def get_model(filename):
    """Download the model file"""
    model_path = os.path.join(MODELS_DIR, filename)
    if os.path.exists(model_path):
        return send_file(model_path, mimetype='model/gltf-binary', as_attachment=True)
    else:
        return jsonify({"error": "Model not found"}), 404

@app.route('/rooms/<int:room_id>/features', methods=['POST'])
def add_room_feature():  # Make sure this function name is unique
    room = Room.query.get(room_id)
    if not room:
        return jsonify({"error": "Room not found"}), 404

    data = request.json
    feature_type = data.get('type')
    position = data.get('position')

    if not feature_type or not position:
        return jsonify({"error": "Missing feature type or position"}), 400

    room.features.append({
        "type": feature_type,
        "position": position
    })

    db.session.commit()

    return jsonify({"status": "Feature added successfully", "room": room.to_dict()}), 200

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(port=5000, debug=True)

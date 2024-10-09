from flask import Blueprint, request, jsonify
from models.room import Room, db

room_bp = Blueprint('room', __name__)

@room_bp.route('/rooms', methods=['POST'])
def create_room():
    data = request.get_json()
    new_room = Room(
        height=data['height'],
        depth=data['depth'],
        width=data['width'],
        door_type=data.get('door_type'),
        cooler_type=data.get('cooler_type'),
        partitions=data.get('partitions')
    )
    db.session.add(new_room)
    db.session.commit()
    return jsonify({"message": "Room created", "room_id": new_room.id}), 201

@room_bp.route('/rooms', methods=['GET'])
def get_rooms():
    rooms = Room.query.all()
    return jsonify([{"id": room.id, "height": room.height, "depth": room.depth, "width": room.width} for room in rooms])
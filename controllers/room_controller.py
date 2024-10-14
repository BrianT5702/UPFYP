from flask import Blueprint, request, jsonify
from models.room import Room, ComplexRoom, db

room_bp = Blueprint('room', __name__)

@room_bp.route('/rooms', methods=['POST'])
def create_room():
    data = request.get_json()
    if data.get('room_type') == 'complex':
        new_room = ComplexRoom(
            name=data['name'],
            rooms=data['rooms']
        )
    else:
        new_room = Room(
            name=data['name'],
            room_type=data['room_type'],
            height=float(data['height']),
            depth=float(data['depth']),
            width=float(data['width']),
            doors=data.get('doors'),
            coolers=data.get('coolers'),
            partitions=data.get('partitions'),
            usage=data.get('usage'),
            materials=data.get('materials')
        )
    db.session.add(new_room)
    db.session.commit()
    return jsonify({"message": "Room created", "room": new_room.to_dict()}), 201

@room_bp.route('/rooms', methods=['GET'])
def get_rooms():
    rooms = Room.query.all()
    complex_rooms = ComplexRoom.query.all()
    return jsonify({
        "simple_rooms": [room.to_dict() for room in rooms],
        "complex_rooms": [room.to_dict() for room in complex_rooms]
    })

@room_bp.route('/rooms/<int:room_id>', methods=['GET'])
def get_room(room_id):
    room = Room.query.get_or_404(room_id)
    return jsonify(room.to_dict())

@room_bp.route('/rooms/<int:room_id>', methods=['PUT'])
def update_room(room_id):
    room = Room.query.get_or_404(room_id)
    data = request.get_json()
    for key, value in data.items():
        setattr(room, key, value)
    db.session.commit()
    return jsonify({"message": "Room updated", "room": room.to_dict()}), 200

@room_bp.route('/rooms/<int:room_id>', methods=['DELETE'])
def delete_room(room_id):
    room = Room.query.get_or_404(room_id)
    db.session.delete(room)
    db.session.commit()
    return jsonify({"message": "Room deleted"}), 200

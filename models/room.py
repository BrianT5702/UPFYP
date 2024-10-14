# models/room.py
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import JSONB

db = SQLAlchemy()  # Shared db instance

class Room(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    room_type = db.Column(db.String(50), nullable=False)  # e.g., 'simple', 'complex'
    height = db.Column(db.Float, nullable=False)
    depth = db.Column(db.Float, nullable=False)
    width = db.Column(db.Float, nullable=False)
    doors = db.Column(JSONB)  # Store door information as JSON
    coolers = db.Column(JSONB)  # Store cooler information as JSON
    partitions = db.Column(JSONB)  # Store partition information as JSON
    usage = db.Column(db.String(50))  # e.g., 'chiller', 'fruit storage'
    materials = db.Column(JSONB)  # Store material information as JSON

    def __repr__(self):
        return f'<Room {self.id}: {self.name}>'

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'width': self.width,
            'depth': self.depth,
            'height': self.height,
            'doors': self.doors,
            'coolers': self.coolers,
            'partitions': self.partitions,
            'usage': self.usage,
            'materials': self.materials
        }

class ComplexRoom(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    rooms = db.Column(JSONB)  # Store information about multiple rooms

    def __repr__(self):
        return f'<ComplexRoom {self.id}: {self.name}>'

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'rooms': self.rooms
        }

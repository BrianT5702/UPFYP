from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Room(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    room_type = db.Column(db.String(50), nullable=False)
    width = db.Column(db.Float, nullable=False)
    height = db.Column(db.Float, nullable=False)
    depth = db.Column(db.Float, nullable=False)
    features = db.Column(db.PickleType, nullable=True)
    exterior_filename = db.Column(db.String(200), nullable=True)  # Add this field
    interior_filename = db.Column(db.String(200), nullable=True)  # Add this field

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'room_type': self.room_type,
            'width': self.width,
            'height': self.height,
            'depth': self.depth,
            'exterior_filename': self.exterior_filename,
            'interior_filename': self.interior_filename
        }

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

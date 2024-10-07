from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Room(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    height = db.Column(db.Float, nullable=False)
    depth = db.Column(db.Float, nullable=False)
    width = db.Column(db.Float, nullable=False)
    door_type = db.Column(db.String(50), nullable=True)
    cooler_type = db.Column(db.String(50), nullable=True)
    partitions = db.Column(db.JSON, nullable=True)

    def __repr__(self):
        return f'<Room {self.id}>'

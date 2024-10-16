import React from 'react';

const RoomList = ({ rooms, onRoomSelect, selectedRoom, onRoomDelete }) => {
    if (!rooms || rooms.length === 0) {
        return <div className="room-list"><p>No rooms available</p></div>;
    }

    return (
        <div className="room-list">
            <h2>Existing Rooms</h2>
            <ul>
                {rooms.map((room, index) => (
                    <li 
                        key={`${room.filename}-${index}`}
                        className={selectedRoom && selectedRoom.filename === room.filename ? 'selected' : ''}
                    >
                        <strong onClick={() => onRoomSelect(room)}>{room.name}</strong>
                        <br />
                        Width: {room.width}m, Depth: {room.depth}m, Height: {room.height}m
                        <br />
                        <button onClick={() => onRoomDelete(room.id)}>Delete Room</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default RoomList;

import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

const RoomCreator = ({ onSubmit }) => {
    const [rooms, setRooms] = useState([]);
    const [currentRoom, setCurrentRoom] = useState({
        name: '',
        width: 0,
        depth: 0,
        height: 0,
        x: 0,
        y: 0
    });

    const handleInputChange = (e) => {
        setCurrentRoom({ ...currentRoom, [e.target.name]: e.target.value });
    };

    const addRoom = () => {
        setRooms([...rooms, { ...currentRoom, id: Date.now() }]);
        setCurrentRoom({ name: '', width: 0, depth: 0, height: 0, x: 0, y: 0 });
    };

    const handleSubmit = () => {
        onSubmit(rooms);
    };

    return (
        <div className="room-creator">
            <div className="room-inputs">
                <input
                    type="text"
                    name="name"
                    value={currentRoom.name}
                    onChange={handleInputChange}
                    placeholder="Room Name"
                />
                <input
                    type="number"
                    name="width"
                    value={currentRoom.width}
                    onChange={handleInputChange}
                    placeholder="Width (m)"
                />
                <input
                    type="number"
                    name="depth"
                    value={currentRoom.depth}
                    onChange={handleInputChange}
                    placeholder="Depth (m)"
                />
                <input
                    type="number"
                    name="height"
                    value={currentRoom.height}
                    onChange={handleInputChange}
                    placeholder="Height (m)"
                />
                <input
                    type="number"
                    name="x"
                    value={currentRoom.x}
                    onChange={handleInputChange}
                    placeholder="X Position"
                />
                <input
                    type="number"
                    name="y"
                    value={currentRoom.y}
                    onChange={handleInputChange}
                    placeholder="Y Position"
                />
                <button onClick={addRoom}>Add Room</button>
            </div>
            <div className="room-preview" style={{ width: '500px', height: '500px' }}>
                <Canvas>
                    <OrbitControls />
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} />
                    {rooms.map((room) => (
                        <RoomMesh key={room.id} room={room} />
                    ))}
                    <gridHelper args={[20, 20]} />
                </Canvas>
            </div>
            <button onClick={handleSubmit}>Create Complex Room</button>
        </div>
    );
};

const RoomMesh = ({ room }) => {
    return (
        <mesh position={[room.x, room.height / 2, room.y]}>
            <boxGeometry args={[room.width, room.height, room.depth]} />
            <meshStandardMaterial color="lightblue" transparent opacity={0.7} />
        </mesh>
    );
};

export default RoomCreator;
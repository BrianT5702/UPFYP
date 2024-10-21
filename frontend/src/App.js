import React, { useState, useEffect } from 'react';
import ComplexRoomCreator from './components/ComplexRoomCreator';
import RoomList from './components/RoomList';
import ModelViewer from './ModelViewer';
import './App.css';

function App() {
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            const response = await fetch('http://localhost:5000/existing_rooms');
            if (!response.ok) {
                throw new Error('Error fetching rooms');
            }
            const data = await response.json();
            setRooms(data.rooms);
        } catch (error) {
            console.error('Error fetching rooms:', error);
        }
    };

    const handleRoomCreation = (newRoom) => {
        setRooms(prevRooms => [...prevRooms, newRoom]);
        setSelectedRoom(newRoom);
        fetchRooms();
    };

    const handleRoomSelection = (room) => {
        setSelectedRoom(room);
    };

    const handleRoomDelete = async (roomId) => {
        try {
            const response = await fetch(`http://localhost:5000/rooms/${roomId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setRooms(prevRooms => prevRooms.filter(room => room.id !== roomId));
                setSelectedRoom(null);
                fetchRooms();
            } else {
                console.error('Error deleting room:', await response.json());
            }
        } catch (error) {
            console.error('Error deleting room:', error);
        }
    };

    return (
        <div className="app">
            <div className="main-content">
                <div className="left-panel">
                    <ComplexRoomCreator onRoomCreate={handleRoomCreation} />
                    <RoomList 
                        rooms={rooms} 
                        onRoomSelect={handleRoomSelection} 
                        selectedRoom={selectedRoom} 
                        onRoomDelete={handleRoomDelete} 
                    />
                </div>
                <div className="right-panel">
                    <ModelViewer room={selectedRoom} />
                </div>
            </div>
        </div>
    );
}

export default App;
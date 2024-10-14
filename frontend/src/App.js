import React, { useState, useEffect, useCallback } from 'react';
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
            if (data.rooms.length > 0) {
                setSelectedRoom(data.rooms[0]);
            }
        } catch (error) {
            console.error('Error fetching rooms:', error);
        }
    };

    const handleRoomCreation = (newRoom) => {
        setRooms(prevRooms => [...prevRooms, newRoom]);
        setSelectedRoom(newRoom);
        fetchRooms(); // Refetch rooms to get updated list
    };

    const handleRoomSelection = useCallback((room) => {
        setSelectedRoom(room);
    }, []);

    const handleFeatureAdd = useCallback((newFeature) => {
        if (selectedRoom) {
            const updatedRoom = { 
                ...selectedRoom, 
                features: [...(selectedRoom.features || []), newFeature] 
            };
            setSelectedRoom(updatedRoom);
            setRooms(prevRooms => prevRooms.map(room => 
                room.filename === selectedRoom.filename ? updatedRoom : room
            ));
        }
    }, [selectedRoom]);

    const handleFeatureMove = useCallback((index, newPosition) => {
        if (selectedRoom) {
            const updatedFeatures = [...selectedRoom.features];
            updatedFeatures[index] = { ...updatedFeatures[index], position: newPosition };
            const updatedRoom = { ...selectedRoom, features: updatedFeatures };
            setSelectedRoom(updatedRoom);
            setRooms(prevRooms => prevRooms.map(room => 
                room.filename === selectedRoom.filename ? updatedRoom : room
            ));
        }
    }, [selectedRoom]);

    const handleFeatureResize = useCallback((index, newDimensions) => {
        if (selectedRoom) {
            const updatedFeatures = [...selectedRoom.features];
            updatedFeatures[index] = { ...updatedFeatures[index], dimensions: newDimensions };
            const updatedRoom = { ...selectedRoom, features: updatedFeatures };
            setSelectedRoom(updatedRoom);
            setRooms(prevRooms => prevRooms.map(room => 
                room.filename === selectedRoom.filename ? updatedRoom : room
            ));
        }
    }, [selectedRoom]);

    return (
      <div className="app">
          <div className="main-content">
              <div className="left-panel">
                  <ComplexRoomCreator onRoomCreate={handleRoomCreation} />
                  <RoomList 
                      rooms={rooms} 
                      onRoomSelect={setSelectedRoom} 
                      selectedRoom={selectedRoom} 
                  />
              </div>
              <div className="right-panel">
                  {selectedRoom && <ModelViewer room={selectedRoom} />}
              </div>
          </div>
      </div>
  );
}

export default App;

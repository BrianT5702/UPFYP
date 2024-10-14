import React, { useState } from 'react';

const ComplexRoomCreator = ({ onRoomCreate, onFeatureAdd }) => {
    const [currentRoom, setCurrentRoom] = useState({
        name: '',
        width: '',
        depth: '',
        height: '',
        wallThickness: '0.1',
    });

    const [doorDimensions, setDoorDimensions] = useState({
        width: '',
        height: '',
    });

    const handleRoomChange = (e) => {
        setCurrentRoom({ ...currentRoom, [e.target.name]: e.target.value });
    };

    const handleDoorDimensionsChange = (e) => {
        setDoorDimensions({ ...doorDimensions, [e.target.name]: e.target.value });
    };

    const handleRoomCreation = async () => {
        try {
            const response = await fetch('http://localhost:5000/create_room', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(currentRoom), // Send room data to backend
            });

            const data = await response.json();
            console.log('Room creation response:', data);

            if (response.ok) {
                onRoomCreate(data); // Notify parent component about the created room
            } else {
                console.error('Error creating room:', data);
            }
        } catch (error) {
            console.error('Error while creating room:', error);
        }
    };

    const createRoom = () => {
        if (currentRoom.name && currentRoom.width && currentRoom.depth && currentRoom.height) {
            // Trigger the POST request to Flask
            handleRoomCreation();

            // Clear the current room input after creation
            setCurrentRoom({
                name: '',
                width: '',
                depth: '',
                height: '',
                wallThickness: '0.1',
            });
        }
    };

    return (
        <div className="complex-room-creator">
            <h2>Create Complex Cold Room</h2>
            <div className="room-form">
                <div className="form-group">
                    <label htmlFor="name">Room Name</label>
                    <input
                        id="name"
                        type="text"
                        name="name"
                        value={currentRoom.name}
                        onChange={handleRoomChange}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="width">Width (m)</label>
                    <input
                        id="width"
                        type="number"
                        name="width"
                        value={currentRoom.width}
                        onChange={handleRoomChange}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="depth">Depth (m)</label>
                    <input
                        id="depth"
                        type="number"
                        name="depth"
                        value={currentRoom.depth}
                        onChange={handleRoomChange}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="height">Height (m)</label>
                    <input
                        id="height"
                        type="number"
                        name="height"
                        value={currentRoom.height}
                        onChange={handleRoomChange}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="wallThickness">Wall Thickness (m)</label>
                    <input
                        id="wallThickness"
                        type="number"
                        name="wallThickness"
                        value={currentRoom.wallThickness}
                        onChange={handleRoomChange}
                    />
                </div>
                <button onClick={createRoom}>Create Room</button>
            </div>
            <div className="feature-buttons">
                <button onClick={() => onFeatureAdd({ type: 'partition' })}>Add Partition</button>
                <div className="door-inputs">
                    <div className="form-group">
                        <label htmlFor="doorWidth">Door Width (m)</label>
                        <input
                            id="doorWidth"
                            type="number"
                            name="width"
                            value={doorDimensions.width}
                            onChange={handleDoorDimensionsChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="doorHeight">Door Height (m)</label>
                        <input
                            id="doorHeight"
                            type="number"
                            name="height"
                            value={doorDimensions.height}
                            onChange={handleDoorDimensionsChange}
                        />
                    </div>
                    <button onClick={() => onFeatureAdd({ type: 'door', ...doorDimensions })}>Add Door</button>
                </div>
                <button onClick={() => onFeatureAdd({ type: 'cooler' })}>Add Cooler</button>
            </div>
        </div>
    );
};

export default ComplexRoomCreator;

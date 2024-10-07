import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ModelViewer from './ModelViewer'; // Import ModelViewer component
import './App.css';

function App() {
    const [roomDimensions, setRoomDimensions] = useState({
        height: '',
        depth: '',
        width: '',
        unit: 'mm' // Default unit is mm
    });
    const [modelCreated, setModelCreated] = useState(false); // State to track model creation

    const handleRoomDimensionsChange = (e) => {
        const { name, value } = e.target;
        setRoomDimensions({
            ...roomDimensions,
            [name]: value
        });
    };

    const createRoomOverview = async () => {
        const { height, depth, width } = roomDimensions;
        if (!height || !depth || !width) {
            alert('Please enter valid dimensions for the room.');
            return;
        }

        // Make a request to the Flask backend to create the model
        try {
            const response = await axios.post('http://127.0.0.1:5000/create_model', {
                height: parseFloat(height),
                depth: parseFloat(depth),
                width: parseFloat(width),
                unit: roomDimensions.unit // Send the measurement unit
            });
            console.log(response.data);
            setModelCreated(true); // Set to true once the model is created
        } catch (error) {
            console.error('Error creating model:', error);
            alert('Failed to create model.');
        }
    };

    return (
        <div className="App">
            <h1>Create Cold Room Model</h1>
            <div>
                <h3>Room Dimensions</h3>
                <label>
                    Height (Y-axis):
                    <input type="number" name="height" value={roomDimensions.height} onChange={handleRoomDimensionsChange} />
                </label>
                <br />
                <label>
                    Depth (Z-axis):
                    <input type="number" name="depth" value={roomDimensions.depth} onChange={handleRoomDimensionsChange} />
                </label>
                <br />
                <label>
                    Width (X-axis):
                    <input type="number" name="width" value={roomDimensions.width} onChange={handleRoomDimensionsChange} />
                </label>
                <br />
                <label>
                    Unit:
                    <select name="unit" value={roomDimensions.unit} onChange={handleRoomDimensionsChange}>
                        <option value="mm">mm</option>
                        <option value="cm">cm</option>
                        <option value="inch">inch</option>
                    </select>
                </label>
                <br />
                <button onClick={createRoomOverview}>Create Room Overview</button>
            </div>
            {modelCreated && <ModelViewer dimensions={roomDimensions} />} {/* Pass dimensions to ModelViewer */}
        </div>
    );
}

export default App;

import React, { useState } from 'react';
import axios from 'axios';
import ModelViewer from './ModelViewer';
import './App.css';

function App() {
    const [roomDimensions, setRoomDimensions] = useState({
        height: 0, // This will represent horizontal dimension
        depth: 0,  // This will represent Z-axis
        width: 0,  // This will represent X-axis
        unit: 'mm' // Default unit set to mm
    });
    const [modelCreated, setModelCreated] = useState(false);

    const handleRoomDimensionsChange = (e) => {
        const { name, value } = e.target;
        setRoomDimensions({
            ...roomDimensions,
            [name]: value
        });
    };

    const handleUnitChange = (e) => {
        setRoomDimensions({
            ...roomDimensions,
            unit: e.target.value // Update the selected unit
        });
    };

    const createRoomOverview = async () => {
        const { height, depth, width, unit } = roomDimensions;
        if (!height || !depth || !width) {
            alert('Please enter valid dimensions for the room.');
            return;
        }

        // Make a request to the Flask backend to create the model
        try {
            const response = await axios.post('http://127.0.0.1:5000/create_model', {
                height,
                depth,
                width,
                unit // Send the unit to the backend
            });
            console.log(response.data);
            setModelCreated(true);
        } catch (error) {
            console.error('Error creating model:', error);
            alert('Failed to create model.');
        }
    };

    return (
        <div className="App">
            <h1>Create Cold Room Model</h1>
            <div>
                <h3>Room Dimensions (default unit: mm)</h3>
                <label>
                    Height:
                    <input type="number" name="height" value={roomDimensions.height} onChange={handleRoomDimensionsChange} />
                </label>
                <br />
                <label>
                    Depth:
                    <input type="number" name="depth" value={roomDimensions.depth} onChange={handleRoomDimensionsChange} />
                </label>
                <br />
                <label>
                    Width:
                    <input type="number" name="width" value={roomDimensions.width} onChange={handleRoomDimensionsChange} />
                </label>
                <br />
                <label>
                    Unit:
                    <select value={roomDimensions.unit} onChange={handleUnitChange}>
                        <option value="mm">Millimeters (mm)</option>
                        <option value="cm">Centimeters (cm)</option>
                        <option value="inch">Inches (inch)</option>
                    </select>
                </label>
                <br />
                <button onClick={createRoomOverview}>Create Room Overview</button>
            </div>
            {modelCreated && <ModelViewer />}
        </div>
    );
}

export default App;

import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const Overview = ({ dimensions }) => {
    const [modelVisible, setModelVisible] = useState(false);
    const [gltf, setGltf] = useState(null);

    const handleCreateOverview = async () => {
        // Call your API to create the model here
        try {
            const response = await fetch('http://127.0.0.1:5000/create_model', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dimensions),
            });

            if (response.ok) {
                setModelVisible(true);
                // Load the model after successful creation
                const loader = new GLTFLoader();
                loader.load('http://127.0.0.1:5000/models/cold_room_model.glb', (gltf) => {
                    setGltf(gltf);
                });
            } else {
                console.error('Failed to create model:', response.statusText);
            }
        } catch (error) {
            console.error('Error creating model:', error);
        }
    };

    return (
        <div style={{ height: '600px', width: '100%' }}>
            <h1>Overview</h1>
            <p>Dimensions: {dimensions.width} mm (Width), {dimensions.depth} mm (Depth), {dimensions.height} mm (Height)</p>
            <button onClick={handleCreateOverview}>Create Room Overview</button>
            <Canvas>
                <ambientLight intensity={0.5} />
                <directionalLight position={[5, 10, 5]} intensity={1} />
                <Grid args={[100, 100]} position={[0, 0, 0]} color="lightblue" />
                {modelVisible && gltf && <primitive object={gltf.scene} />} {/* Show your model here */}
                <OrbitControls enablePan={true} enableZoom={true} />
                <perspectiveCamera position={[0, 10, 10]} />
            </Canvas>
        </div>
    );
};

export default Overview;

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from '@react-three/drei';

const ModelViewer = () => {
    // Load the model
    const gltf = useLoader(GLTFLoader, 'http://127.0.0.1:5000/models/cold_room_model.glb');

    if (!gltf) {
        return <div>Loading model...</div>; // Display loading message if the model is not loaded
    }

    return (
        <Canvas style={{ height: '500px', width: '100%' }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />

            {/* Scale down the model if it's too large */}
            <primitive object={gltf.scene} scale={[0.1, 0.1, 0.1]} /> {/* Adjust the scale here */}

            {/* OrbitControls for camera control */}
            <OrbitControls 
                enableZoom={true} 
                minDistance={5} 
                maxDistance={20} 
                target={[0, 0, 0]} 
            />
        </Canvas>
    );
};

export default ModelViewer;

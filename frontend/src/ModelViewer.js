import React, { useState, useEffect } from 'react';
import { Canvas, useLoader, useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls, Grid, Box } from '@react-three/drei'; // Import Box from drei
import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';

// Component for loading and rendering the model
const Model = ({ dimensions, onFaceClick }) => {
    const [gltf, setGltf] = useState(null);
    
    useEffect(() => {
        const loader = new GLTFLoader();
        loader.load('http://127.0.0.1:5000/models/cold_room_model.glb', (gltf) => {
            setGltf(gltf);
        });
    }, []); // Load model only once

    const { camera } = useThree(); // Access the camera

    useEffect(() => {
        if (gltf) {
            gltf.scene.traverse((child) => {
                if (child.isMesh) {
                    // Scale the model based on the input dimensions
                    child.scale.set(dimensions.width / 1000, dimensions.height / 1000, dimensions.depth / 1000); // Assuming dimensions are in mm

                    // Center the model in the scene
                    child.position.set(0, (dimensions.height / 2000), 0); // Half of height to place it on the grid

                    // Calculate the bounding box
                    const boundingBox = new THREE.Box3().setFromObject(child);
                    const size = boundingBox.getSize(new THREE.Vector3());

                    // Set the camera position based on model size
                    const cameraDistance = Math.max(size.x, size.y, size.z) * 2; // Adjust the multiplier as needed
                    camera.position.set(0, cameraDistance, cameraDistance); // Position the camera above and away from the model
                    camera.lookAt(boundingBox.getCenter(new THREE.Vector3())); // Look at the center of the model
                }
            });
        }
    }, [gltf, dimensions, camera]); // Include camera in the dependency array

    if (!gltf) {
        return (
            <Box args={[1, 1, 1]} position={[0, 0.5, 0]}> {/* Use Box component */}
                <meshStandardMaterial color="gray" />
            </Box>
        ); // Placeholder while loading
    }

    return <primitive object={gltf.scene} onClick={onFaceClick} />;
};

// Component to handle mouse click events and display text
const ClickableModel = ({ dimensions }) => {
    const { camera, scene } = useThree();
    const [textMesh, setTextMesh] = useState(null);

    const handleFaceClick = (event) => {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        // Get mouse position in normalized device coordinates
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera); // Use the camera from useThree

        const intersects = raycaster.intersectObjects(scene.children, true);

        if (intersects.length > 0) {
            const face = intersects[0];
            const { point } = face;

            // Create or update the text mesh
            if (!textMesh) {
                const fontLoader = new FontLoader();
                fontLoader.load('/path/to/font.json', (font) => {
                    const textGeometry = new TextGeometry(`Width: ${dimensions.width.toFixed(2)} m`, {
                        font: font,
                        size: 0.5,
                        height: 0.1,
                    });
                    const textMaterial = new THREE.MeshBasicMaterial({ color: 0xFF0000 });
                    const newTextMesh = new THREE.Mesh(textGeometry, textMaterial);
                    newTextMesh.position.copy(point);
                    newTextMesh.position.z += 0.1; // Slightly above the clicked face
                    face.object.parent.add(newTextMesh);
                    setTextMesh(newTextMesh);
                });
            } else {
                textMesh.position.copy(point);
                textMesh.position.z += 0.1; // Ensure the text stays above the clicked face
            }
        }
    };

    return <Model dimensions={dimensions} onFaceClick={handleFaceClick} />;
};

// Main component for rendering the canvas and controls
const ModelViewer = ({ dimensions }) => {
    return (
        <Canvas style={{ height: '500px', width: '100%' }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 10, 5]} intensity={1} />
            <Grid args={[100, 100]} position={[0, 0, 0]} color='lightblue' />
            <ClickableModel dimensions={dimensions} />
            <OrbitControls enableZoom={true} minDistance={1} maxDistance={50} enablePan={true} />
        </Canvas>
    );
};

export default ModelViewer;
import React, { useState, useEffect } from 'react';
import { Canvas, useLoader, useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';

// Component for loading and rendering the model
const Model = ({ onFaceClick }) => {
    const gltf = useLoader(GLTFLoader, 'http://127.0.0.1:5000/models/cold_room_model.glb');

    useEffect(() => {
        if (gltf) {
            gltf.scene.traverse((child) => {
                if (child.isMesh) {
                    const boundingBox = new THREE.Box3().setFromObject(child);
                    const center = boundingBox.getCenter(new THREE.Vector3());
                    child.position.sub(center); // Center the model
                }
            });
        }
    }, [gltf]);

    return (
        <primitive object={gltf.scene} scale={[0.1, 0.1, 0.1]} onClick={onFaceClick} />
    );
};

// Component to handle mouse click events and display text
const ClickableModel = () => {
    const { camera, scene } = useThree();
    const [textMesh, setTextMesh] = useState(null);
    const [dimensions, setDimensions] = useState({ width: 5, height: 2, depth: 3 });

    const handleFaceClick = (event) => {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);

        if (intersects.length > 0) {
            const face = intersects[0];
            const { point } = face;

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
                    newTextMesh.position.z += 1;
                    face.object.parent.add(newTextMesh);
                    setTextMesh(newTextMesh);
                });
            } else {
                textMesh.position.copy(point);
                textMesh.position.z += 1;
            }
        }
    };

    return <Model onFaceClick={handleFaceClick} />;
};

// Main component for rendering the canvas and controls
const ModelViewer = () => {
    return (
        <Canvas style={{ height: '500px', width: '100%' }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 10, 5]} intensity={1} />
            <Grid args={[10, 10]} position={[0, 0, 0]} />
            <ClickableModel />
            <OrbitControls enableZoom={true} minDistance={1} maxDistance={50} enablePan={true} />
        </Canvas>
    );
};

export default ModelViewer;

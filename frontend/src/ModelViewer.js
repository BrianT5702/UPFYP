import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

const Model = ({ url }) => {
    const { scene } = useGLTF(url);
    const modelRef = useRef();

    useFrame(() => {
        if (modelRef.current) {
            // Center the model
            const box = new THREE.Box3().setFromObject(modelRef.current);
            const center = box.getCenter(new THREE.Vector3());
            modelRef.current.position.sub(center);
        }
    });

    return <primitive ref={modelRef} object={scene} />;
};

const CameraSetup = () => {
    const { camera, scene } = useThree();
    
    useEffect(() => {
        if (scene.children.length > 0) {
            const box = new THREE.Box3().setFromObject(scene);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());

            const maxDim = Math.max(size.x, size.y, size.z);
            const fov = camera.fov * (Math.PI / 180);
            let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));

            cameraZ *= 1.5; // Zoom out a little so object fits in view

            camera.position.set(center.x, center.y, center.z + cameraZ);
            camera.lookAt(center);
            camera.updateProjectionMatrix();
        }
    }, [camera, scene]);

    return null;
};

const ModelViewer = ({ room }) => {
    const [isInteriorView, setIsInteriorView] = useState(true);
    const [modelUrl, setModelUrl] = useState(null);

    useEffect(() => {
        if (room) {
            const filename = isInteriorView ? room.interior_filename : room.exterior_filename;
            setModelUrl(`http://localhost:5000/models/${filename}`);
        }
    }, [room, isInteriorView]);

    const toggleView = () => {
        setIsInteriorView(!isInteriorView);
    };

    if (!room) {
        return <div className="no-room-selected">
            <p>No room selected. Please select a room from the list.</p>
        </div>;
    }

    return (
        <div className="model-viewer" style={{ width: '100%', height: '100%' }}>
            <Canvas>
                <PerspectiveCamera makeDefault fov={75} near={0.1} far={1000} />
                <CameraSetup />
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
                <OrbitControls target={[0, 0, 0]} />
                {modelUrl && <Model url={modelUrl} />}
            </Canvas>
            <div style={{ position: 'absolute', bottom: '10px', left: '10px' }}>
                <button onClick={toggleView}>
                    {isInteriorView ? 'Switch to Exterior View' : 'Switch to Interior View'}
                </button>
            </div>
        </div>
    );
};

export default ModelViewer;
import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

const Room = ({ room, setModelDimensions }) => {
  const [model, setModel] = useState(null);
  const groupRef = useRef();

  useEffect(() => {
    if (room && room.filename) {
      const url = `http://localhost:5000/models/${room.filename}?t=${Date.now()}`;

      new GLTFLoader().load(
        url,
        (gltf) => {
          console.log('Model loaded successfully:', gltf);
          setModel(gltf.scene);
        },
        undefined,
        (err) => {
          console.error('Failed to load model:', err);
        }
      );
    }
  }, [room]);

  useEffect(() => {
    if (model && groupRef.current) {
      // Clear previous content
      while (groupRef.current.children.length) {
        groupRef.current.remove(groupRef.current.children[0]);
      }

      // Add the new model
      groupRef.current.add(model);

      // Calculate bounding box to find dimensions
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      // Set the position to ensure the model is always centered in the scene
      model.position.set(-center.x, -center.y, -center.z);

      // Pass dimensions to parent component
      setModelDimensions({ size, center });
    }
  }, [model]);

  return <group ref={groupRef} />;
};

const CameraController = ({ dimensions, isInteriorView }) => {
  const { camera } = useThree();
  const controlsRef = useRef();

  useEffect(() => {
    if (dimensions && controlsRef.current) {
      const { size, center } = dimensions;
      if (isInteriorView) {
        // Set camera to interior view
        camera.position.set(center.x, size.y / 2, center.z);
        controlsRef.current.target.set(center.x, size.y / 2, center.z);
      } else {
        // Set camera to exterior view
        const distance = Math.max(size.x, size.y, size.z) * 1.5;
        camera.position.set(distance, distance, distance);
        controlsRef.current.target.set(0, 0, 0);
      }
      controlsRef.current.update();
    }
  }, [dimensions, isInteriorView]);

  return <OrbitControls ref={controlsRef} />;
};

const ModelViewer = ({ room }) => {
  const [modelDimensions, setModelDimensions] = useState(null);
  const [isInteriorView, setIsInteriorView] = useState(false);

  // Use useMemo to create a stable reference for the room prop
  const stableRoom = useMemo(() => room, [room?.filename]);

  const toggleView = () => {
    setIsInteriorView(!isInteriorView);
  };

  return (
    <div className="model-viewer" style={{ width: '100%', height: '500px', position: 'relative' }}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 10]} near={0.1} far={1000} fov={75} />
        {stableRoom && stableRoom.filename ? (
          <>
            <CameraController dimensions={modelDimensions} isInteriorView={isInteriorView} />
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} intensity={1} />
            <Room room={stableRoom} setModelDimensions={setModelDimensions} />
          </>
        ) : (
          <ambientLight intensity={0.5} />
        )}
      </Canvas>
      {stableRoom && stableRoom.filename && (
        <button
          onClick={toggleView}
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            padding: '5px 10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          {isInteriorView ? 'Switch to Exterior View' : 'Switch to Interior View'}
        </button>
      )}
    </div>
  );
};

export default ModelViewer;
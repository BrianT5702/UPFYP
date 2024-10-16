import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';
import axios from 'axios';

const Room = ({ room, isInteriorView, setModelDimensions, onAddFeature }) => {
  const [model, setModel] = useState(null);
  const groupRef = useRef();

  useEffect(() => {
    if (room) {
        const filename = isInteriorView ? room.interior_filename : room.exterior_filename;

        // Ensure filename is valid before making the request
        if (filename) {
            const url = `http://localhost:5000/models/${filename}?t=${Date.now()}`;
            console.log('Fetching model from:', url);

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
        } else {
            console.warn('Filename is undefined. No model to load.');
        }
    }
}, [room, isInteriorView]);

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
  }, [model, setModelDimensions]);

  const handleClick = useCallback((event) => {
    if (isInteriorView) {
      event.stopPropagation();
      const intersects = event.intersects;
      if (intersects.length > 0) {
        const point = intersects[0].point;
        onAddFeature(point);
      }
    }
  }, [isInteriorView, onAddFeature]);

  return <group ref={groupRef} onClick={handleClick} />;
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
  }, [dimensions, isInteriorView, camera]);

  return <OrbitControls ref={controlsRef} />;
};

const Feature = ({ type, position }) => {
  let geometry, material;

  switch (type) {
    case 'door':
      geometry = new THREE.BoxGeometry(1, 2, 0.1);
      material = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
      break;
    case 'partition':
      geometry = new THREE.BoxGeometry(2, 3, 0.1);
      material = new THREE.MeshBasicMaterial({ color: 0xD3D3D3 });
      break;
    default:
      return null;
  }

  return (
    <mesh geometry={geometry} material={material} position={position} />
  );
};

const ModelViewer = ({ room: initialRoom }) => {
  const [modelDimensions, setModelDimensions] = useState(null);
  const [isInteriorView, setIsInteriorView] = useState(false);
  const [features, setFeatures] = useState([]);
  const [currentFeature, setCurrentFeature] = useState('door');
  const [room, setRoom] = useState(initialRoom);

  // Only fetch room data if the room changes and has not been loaded yet
  useEffect(() => {
    if (initialRoom && initialRoom.id && (!room || room.id !== initialRoom.id)) {
      const fetchRoom = async () => {
        try {
          const response = await axios.get(`http://localhost:5000/rooms/${initialRoom.id}`);
          setRoom(response.data);
          setFeatures(response.data.features || []);
        } catch (error) {
          console.error('Error fetching room:', error);
        }
      };

      fetchRoom();
    }
  }, [initialRoom, room]);

  const toggleView = () => {
    setIsInteriorView(!isInteriorView);
  };

  const handleAddFeature = useCallback(async (position) => {
    if (room && room.id) {
      try {
        const response = await axios.post(`http://localhost:5000/rooms/${room.id}/features`, {
          type: currentFeature,
          position: [position.x, position.y, position.z]
        });
        setRoom(response.data.room);
        setFeatures(response.data.room.features || []);
      } catch (error) {
        console.error('Error adding feature:', error);
      }
    }
  }, [room, currentFeature]);

  return (
    <div className="model-viewer" style={{ width: '100%', height: '500px', position: 'relative' }}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 10]} near={0.1} far={1000} fov={75} />
        <CameraController dimensions={modelDimensions} isInteriorView={isInteriorView} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        {room && room.exterior_filename && (
          <Room 
            room={room} 
            isInteriorView={isInteriorView} 
            setModelDimensions={setModelDimensions}
            onAddFeature={handleAddFeature}
          />
        )}
        {isInteriorView && features.map((feature, index) => (
          <Feature key={index} {...feature} />
        ))}
      </Canvas>
      <div style={{ position: 'absolute', bottom: '10px', left: '10px' }}>
        <button onClick={toggleView}>
          {isInteriorView ? 'Switch to Exterior View' : 'Switch to Interior View'}
        </button>
        {isInteriorView && (
          <>
            <button onClick={() => setCurrentFeature('door')}>Add Door</button>
            <button onClick={() => setCurrentFeature('partition')}>Add Partition</button>
          </>
        )}
      </div>
    </div>
  );
};

export default ModelViewer;

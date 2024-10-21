import React, { useEffect, useRef } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

const SceneContent = ({ room, isInteriorView }) => {
    const groupRef = useRef();

    useEffect(() => {
      if (room) {
          console.log("Loading model for room:", room); // Add this for debugging
          const loader = new GLTFLoader();
          const modelFile = isInteriorView ? room.interior_filename : room.exterior_filename;
          
          console.log("Model file being loaded:", modelFile); // Add this for debugging
          
          loader.load(`http://localhost:5000/models/${modelFile}`, (gltf) => {
              while (groupRef.current.children.length > 0) {
                  groupRef.current.remove(groupRef.current.children[0]);
              }
              groupRef.current.add(gltf.scene);
          }, undefined, (error) => {
              console.error('Error loading model:', error);
          });
      }
  }, [room, isInteriorView]);

    return (
        <group ref={groupRef}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} intensity={1} />
            {/* The group will contain the loaded model */}
        </group>
    );
};

export default SceneContent;

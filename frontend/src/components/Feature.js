import React from 'react';
import * as THREE from 'three';

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

export default Feature;
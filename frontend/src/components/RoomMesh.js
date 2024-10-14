import React from 'react';
import { MeshStandardMaterial } from 'three';

const RoomMesh = ({ room }) => {
    return (
        <mesh position={[room.x, room.height / 2, room.y]} visible={true}>
            <boxGeometry args={[room.width, room.height, room.depth]} />
            <meshStandardMaterial color="lightblue" opacity={1} transparent={false} />
        </mesh>
    );
};

export default RoomMesh;
import React from 'react';

const Toolbox = ({ onToolSelected }) => {
    const tools = ['Door', 'Cooler', 'Partition'];

    const handleDragStart = (event, tool) => {
        event.dataTransfer.setData('tool', tool);
    };

    return (
        <div className="toolbox">
            <h2>Toolbox</h2>
            {tools.map(tool => (
                <div 
                    key={tool} 
                    className="tool" 
                    draggable 
                    onDragStart={(e) => handleDragStart(e, tool)}
                >
                    {tool}
                </div>
            ))}
        </div>
    );
};

export default Toolbox;

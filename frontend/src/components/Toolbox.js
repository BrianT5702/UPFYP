// components/Toolbox.js
import React from 'react';

const Toolbox = () => {
    const tools = ['Door', 'Cooler', 'Partition', 'Material'];

    return (
        <div className="toolbox">
            <h2>Toolbox</h2>
            {tools.map(tool => (
                <div key={tool} className="tool" draggable>
                    {tool}
                </div>
            ))}
        </div>
    );
};

export default Toolbox;
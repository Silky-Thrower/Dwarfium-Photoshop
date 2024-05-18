import React, { useState, ChangeEvent } from 'react';

interface TextLayerProps {
    canvasRef: React.RefObject<HTMLCanvasElement>;
    isAddingText: boolean;
    setIsAddingText: React.Dispatch<React.SetStateAction<boolean>>;
}

const TextLayer: React.FC<TextLayerProps> = ({ canvasRef, isAddingText, setIsAddingText }) => {
    const [text, setText] = useState('');

    const handleTextChange = (event: ChangeEvent<HTMLInputElement>) => {
        setText(event.target.value);
    };

    const addTextLayer = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.font = '50px Arial';
                ctx.fillStyle = 'white';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'bottom';
                ctx.fillText(text, 10, canvas.height - 10);
            }
        }
        setText('');
        setIsAddingText(false);
    };

    return (
        <div className="text-layer-menu">
            <button className="add-text-button" onClick={() => setIsAddingText(true)}>Add Text Layer</button>
            {isAddingText && (
                <div className="text-input">
                    <input
                        type="text"
                        value={text}
                        onChange={handleTextChange}
                        placeholder="Enter text"
                    />
                    <button onClick={addTextLayer}>Add</button>
                </div>
            )}
        </div>
    );
}

export default TextLayer;

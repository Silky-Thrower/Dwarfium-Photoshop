import React, { useState, ChangeEvent } from 'react';

interface TextLayerProps {
    canvasRef: React.RefObject<HTMLCanvasElement>;
    isAddingText: boolean;
    setIsAddingText: React.Dispatch<React.SetStateAction<boolean>>;
}

const TextLayer: React.FC<TextLayerProps> = ({ canvasRef, isAddingText, setIsAddingText }) => {
    const [text, setText] = useState('');
    const [selectedFont, setSelectedFont] = useState('Arial');
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);

    const fonts = ['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana'];

    const handleTextChange = (event: ChangeEvent<HTMLInputElement>) => {
        setText(event.target.value);
    };
    const handleFontChange = (event: ChangeEvent<HTMLSelectElement>) => {
        setSelectedFont(event.target.value);
    };
    const toggleBold = () => {
        setIsBold(!isBold);
    };

    const toggleItalic = () => {
        setIsItalic(!isItalic);
    };

    const addTextLayer = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                const fontStyle = `${isBold ? 'bold' : 'normal'} ${isItalic ? 'italic' : 'normal'}`;
                ctx.font = `${fontStyle} 50px ${selectedFont}`; // Use selected font
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
                        className="font-selector" 
                    />
                    <select className="font-select" value={selectedFont} onChange={handleFontChange}>
                        {fonts.map((font, index) => (
                            <option key={index} value={font}>{font}</option>
                        ))}
                    </select>
                    <div>
                        <button className={isBold ? 'bold-button active' : 'bold-button'} onClick={toggleBold}>B</button>
                        <button className={isItalic ? 'italic-button active' : 'italic-button'} onClick={toggleItalic}>I</button>
                    </div>
                    <br/>
                    <button onClick={addTextLayer}>Add</button>
                </div>
            )}
        </div>
    );
}

export default TextLayer;

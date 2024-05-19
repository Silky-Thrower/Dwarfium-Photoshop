import React, { useState, useRef, useEffect, useCallback } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import NavbarMenu from './components/Navbar';
import SidebarItem from './components/SecondbarItem';
import Slider from './components/Slider';
import { FITS } from 'fitsjs';
import * as htmlToImage from 'html-to-image';
import * as download from 'downloadjs';
import * as UTIF from 'utif';
import TextLayer from './components/TextLayer';


const DEFAULT_OPTIONS: OptionsType[] = [
    {
        name: 'Brightness',
        property: 'brightness',
        value: 100,
        range: {
            min: 0,
            max: 200,
        },
        unit: '%',
    },
    {
        name: 'Contrast',
        property: 'contrast',
        value: 100,
        range: {
            min: 0,
            max: 200,
        },
        unit: '%',
    },
    {
        name: 'Saturation',
        property: 'saturate',
        value: 100,
        range: {
            min: 0,
            max: 200,
        },
        unit: '%',
    },
    {
        name: 'Grayscale',
        property: 'grayscale',
        value: 0,
        range: {
            min: 0,
            max: 100,
        },
        unit: '%',
    },
    {
        name: 'Sepia',
        property: 'sepia',
        value: 0,
        range: {
            min: 0,
            max: 100,
        },
        unit: '%',
    },
    {
        name: 'Hue Rotate',
        property: 'hue-rotate',
        value: 0,
        range: {
            min: 0,
            max: 360,
        },
        unit: 'deg',
    },
    {
        name: 'Blur',
        property: 'blur',
        value: 0,
        range: {
            min: 0,
            max: 20,
        },
        unit: 'px',
    },
    {
        name: 'Invert',
        property: 'invert',
        value: 0,
        range: {
            min: 0,
            max: 100,
        },
        unit: '%',
    },
    {
        name: 'Opacity',
        property: 'opacity',
        value: 100,
        range: {
            min: 0,
            max: 100,
        },
        unit: '%',
    },
    {
        name: 'Shadow X',
        property: 'shadowX',
        value: 0,
        range: {
            min: -50,
            max: 50,
        },
        unit: 'px',
    },
    {
        name: 'Shadow Y',
        property: 'shadowY',
        value: 0,
        range: {
            min: -50,
            max: 50,
        },
        unit: 'px',
    },
    {
        name: 'Shadow Blur',
        property: 'shadowBlur',
        value: 0,
        range: {
            min: 0,
            max: 50,
        },
        unit: 'px',
    },
    {
        name: 'Shadow Color',
        property: 'shadowColor',
        value: '#000000',
        range: {
            min: 0,
            max: 1,
        },
        unit: '',
    },
    {
        name: 'Sharpen',
        property: 'sharpen',
        value: 100,
        range: {
            min: 0,
            max: 100,
        },
        unit: '',
    },
    {
        name: 'Vibrance',
        property: 'vibrance',
        value: 0,
        range: {
            min: -100,
            max: 100,
        },
        unit: '',
    },
    {
        name: 'Exposure',
        property: 'exposure',
        value: 0,
        range: { min: -100, max: 100 },
        unit: '',
    },
    {
        name: 'Temperature',
        property: 'temperature',
        value: 0,
        range: { min: -100, max: 100 },
        unit: '',
    },
    {
        name: 'Tint',
        property: 'tint',
        value: 0,
        range: {
            min: -100,
            max: 100,
        },
        unit: '',
    },
    {
        name: 'Highlights',
        property: 'highlights',
        value: 0,
        range: {
            min: -100,
            max: 100,
        },
        unit: '%',
    },
    {
        name: 'Clarity',
        property: 'clarity',
        value: 0,
        range: {
            min: -100,
            max: 100,
        },
        unit: '',
    },
    {
        name: 'Noise Reduction',
        property: 'noiseReduction',
        value: 0,
        range: {
            min: 0,
            max: 100,
        },
        unit: '',
    },
    {
        name: 'Vignette',
        property: 'vignette',
        value: 0,
        range: {
            min: -100,
            max: 100,
        },
        unit: '%',
    },
    {
        name: 'Saturation Adjustments',
        property: 'saturationAdjustments',
        value: 0,
        range: {
            min: -100,
            max: 100,
        },
        unit: '',
    },
    {
        name: 'Color Balance',
        property: 'colorBalance',
        value: 0,
        range: {
            min: -100,
            max: 100,
        },
        unit: '',
    },
];

export interface OptionsType {
    name: string;
    property: string;
    value: number | string;
    range: Range;
    unit: string;
}

export interface Range {
    min: number;
    max: number;
}

function App() {
    const [options, setOptions] = useState<OptionsType[]>(DEFAULT_OPTIONS);
    const [selectedOptionIndex, setSelectedOptionIndex] = useState<number>(Infinity);
    const [image, setImage] = useState<string | null>(null);
    const [isTiff, setIsTiff] = useState<boolean>(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isAddingText, setIsAddingText] = useState(false);

    const selectedOption = options[selectedOptionIndex];

    const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newOptions = options.map((option, index) => {
            if (index === selectedOptionIndex) {
                return {
                    ...option,
                    value: parseInt(event.target.value, 10),
                };
            }
            return option;
        });
        setOptions(newOptions);
    };

    const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newOptions = options.map((option, index) => {
            if (index === selectedOptionIndex) {
                return {
                    ...option,
                    value: event.target.value,
                };
            }
            return option;
        });
        setOptions(newOptions);
    };

    const applyFilters = useCallback(() => {
        const shadowX = options.find(option => option.property === 'shadowX')?.value || 0;
        const shadowY = options.find(option => option.property === 'shadowY')?.value || 0;
        const shadowBlur = options.find(option => option.property === 'shadowBlur')?.value || 0;
        const shadowColor = options.find(option => option.property === 'shadowColor')?.value || '#000000';
        const sharpen = options.find(option => option.property === 'sharpen')?.value || 100;
        const vibrance = options.find(option => option.property === 'vibrance')?.value || 0;
        const temperature = options.find(option => option.property === 'temperature')?.value || 0;

        const filters = options.map((option) => {
            switch (option.property) {
                case 'brightness':
                case 'contrast':
                case 'saturate':
                case 'grayscale':
                case 'sepia':
                case 'hue-rotate':
                case 'blur':
                case 'invert':
                case 'opacity':
                    return `${option.property}(${option.value}${option.unit})`;
                default:
                    return null;
            }
        }).filter(Boolean);

        const shadowFilter = `drop-shadow(${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowColor})`;
        const sharpenFilter = `contrast(${sharpen}%)`;
        // Add other special filters...

        return {
            filter: [...filters, shadowFilter, sharpenFilter].join(' '),
            vibrance: typeof vibrance === 'number' ? vibrance : 0,
            temperature: typeof temperature === 'number' ? temperature : 0,
            backgroundImage: !isTiff ? `url(${image})` : '',
        };
    }, [options, isTiff, image]);

    // Vibrance adjustment logic
    const applyVibrance = (imageData: ImageData, vibrance: number): ImageData => {
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];

            let max = Math.max(r, g, b);
            let avg = (r + g + b) / 3;
            let amt = ((Math.abs(max - avg) * 2 / 255) * vibrance) / 100;

            if (r !== max) data[i] += (max - r) * amt;
            if (g !== max) data[i + 1] += (max - g) * amt;
            if (b !== max) data[i + 2] += (max - b) * amt;
        }
        return imageData;
    };

    // Exposure adjustment logic
    const applyExposure = (imageData: ImageData, exposure: number): ImageData => {
        const data = imageData.data;
        const factor = Math.pow(2, exposure / 100); // Adjust exposure factor
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, data[i] * factor);       // Red
            data[i + 1] = Math.min(255, data[i + 1] * factor); // Green
            data[i + 2] = Math.min(255, data[i + 2] * factor); // Blue
        }
        return imageData;
    };

    // Temperature adjustment logic
    const applyTemperature = (imageData: ImageData, temperature: number): ImageData => {
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, data[i] + temperature);       // Red
            data[i + 2] = Math.min(255, data[i + 2] - temperature); // Blue
        }
        return imageData;
    };

    const downloadImage = () => {
        htmlToImage
            .toPng(document.getElementById('image') as HTMLElement)
            .then((dataUrl) => {
                download.default(dataUrl, `${Date.now()}.png`);
            });
    };

    const handleImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const { files } = event.target;
        if (!files || files.length === 0) return;

        const file = files[0];
        const objectUrl = URL.createObjectURL(file);

        if (file.type === 'image/tiff' || file.type === 'image/tif') {
            setIsTiff(true);
            const reader = new FileReader();
            reader.onload = (e: ProgressEvent<FileReader>) => {
                const arrayBuffer = e.target?.result as ArrayBuffer;
                if (arrayBuffer) {
                    const ifds = UTIF.decode(arrayBuffer);
                    const firstImage = ifds[0];
                    UTIF.decodeImage(arrayBuffer, firstImage);
                    const rgba = UTIF.toRGBA8(firstImage);

                    const canvas = canvasRef.current;
                    if (canvas) {
                        const ctx = canvas.getContext('2d');
                        if (ctx) {
                            canvas.width = firstImage.width;
                            canvas.height = firstImage.height;
                            const imageData = ctx.createImageData(firstImage.width, firstImage.height);
                            if (imageData) {
                                for (let i = 0; i < imageData.data.length; i++) {
                                    imageData.data[i] = rgba[i];
                                }
                                ctx.putImageData(imageData, 0, 0);
                            }
                        }
                    }
                }
            };
            reader.readAsArrayBuffer(file);
        } else if (file.type === 'image/fits') {
            setIsTiff(false);
            const fits = new FITS(file);
            await fits.getHeader();
            const hdu = await fits.getHDU(0);
            const imageData = hdu.getData();

            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    canvas.width = imageData.width;
                    canvas.height = imageData.height;

                    const clampedArray = new Uint8ClampedArray(imageData.buffer);

                    const imageDataObj = new ImageData(clampedArray, imageData.width, imageData.height);

                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    ctx.putImageData(imageDataObj, 0, 0);
                }
            }
        } else {
            setIsTiff(false);
            setImage(objectUrl);
        }
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                const { filter, vibrance, temperature } = applyFilters();
                const exposure = Number(options.find(option => option.property === 'exposure')?.value) || 0;

                ctx.filter = filter;

                if (!isTiff && image) {
                    const img = new Image();
                    img.src = image;
                    img.onload = () => {
                        canvas.width = img.width;
                        canvas.height = img.height;
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        if (vibrance !== 0) {
                            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                            const adjustedData = applyVibrance(imageData, vibrance);
                            ctx.putImageData(adjustedData, 0, 0);
                        }
                        if (exposure !== 0) {
                            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                            const adjustedData = applyExposure(imageData, exposure);
                            ctx.putImageData(adjustedData, 0, 0);
                        }
                        if (temperature !== 0) {
                            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                            const adjustedData = applyTemperature(imageData, temperature);
                            ctx.putImageData(adjustedData, 0, 0);
                        }
                    };
                } else if (isTiff && canvas) {
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const adjustedData = applyVibrance(imageData, vibrance);
                    ctx.putImageData(adjustedData, 0, 0);

                    if (exposure !== 0) {
                        const adjustedData = applyExposure(imageData, exposure);
                        ctx.putImageData(adjustedData, 0, 0);
                    }
                    if (temperature !== 0) {
                        const adjustedData = applyTemperature(imageData, temperature);
                        ctx.putImageData(adjustedData, 0, 0);
                    }
                }
            }
        }
    }, [options, image, applyFilters, isTiff]);

    return (
        <div className="container">
            <NavbarMenu />
            <div className="canvas-container">
                {image || isTiff ? (
                    <div className="main-image" style={applyFilters()} id="image">
                        <canvas ref={canvasRef} className="tiff-canvas" />
                    </div>
                ) : (
                    <div className="upload-image">
                        <img src="/DWARFLAB_LOGO_Green.png" className="logo" alt="Light Logo" />
                        <h1>Quick PhotoEditor</h1>
                        <input type="file" accept="image/*,.fits" onChange={handleImage} />
                    </div>
                )}
            </div>
            <div className="second-bar">
                <div className="sidebar-items-container">
                    {options?.map((option, index) => (
                        <SidebarItem
                            key={index}
                            name={option.name}
                            active={index === selectedOptionIndex}
                            handleClick={() => setSelectedOptionIndex(index)}
                        />
                    ))}
                </div>
            </div>
            <div className="sidebar">
                <button className="download" onClick={downloadImage}>
                    Download
                </button>
                <div className="text-layer">
                    <TextLayer canvasRef={canvasRef} isAddingText={isAddingText} setIsAddingText={setIsAddingText} />
                </div><br />
                {selectedOption && selectedOption.property !== 'shadowColor' && (
                    <Slider
                        min={selectedOption.range.min}
                        max={selectedOption.range.max}
                        value={Number(selectedOption.value)}
                        handleChange={handleSliderChange}
                    />
                )}

                {selectedOption && selectedOption.property === 'shadowColor' && (
                    <input
                        type="color"
                        className="button-color"
                        value={String(selectedOption.value)}
                        onChange={handleColorChange}
                    />
                )}
            </div>
        </div>
    );
}

export default App;
import React, { useState, useRef, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import NavbarMenu from './components/Navbar';
import SidebarItem from './components/SecondbarItem';
import Slider from './components/Slider';
import { FITS } from 'fitsjs';
import * as htmlToImage from 'html-to-image';
import * as download from 'downloadjs';
import * as UTIF from 'utif';

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
    const [image, setImage] = useState<null | string>(null);
    const [isTiff, setIsTiff] = useState<boolean>(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

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

    const applyFilters = () => {
        const shadowX = options.find(option => option.property === 'shadowX')?.value || 0;
        const shadowY = options.find(option => option.property === 'shadowY')?.value || 0;
        const shadowBlur = options.find(option => option.property === 'shadowBlur')?.value || 0;
        const shadowColor = options.find(option => option.property === 'shadowColor')?.value || '#000000';
        const sharpen = options.find(option => option.property === 'sharpen')?.value || 100;

        const filters = options.map((option) => {
            if (option.property === 'shadowX' || option.property === 'shadowY' || option.property === 'shadowBlur' || option.property === 'shadowColor' || option.property === 'sharpen') {
                return null;
            }
            return `${option.property}(${option.value}${option.unit})`;
        }).filter(Boolean);

        if (sharpen !== 100) {
            filters.push(`contrast(${sharpen}%)`);
        }

        const shadowFilter = `drop-shadow(${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowColor})`;

        return {
            filter: [...filters, shadowFilter].join(' '),
            backgroundImage: !isTiff ? `url(${image})` : '',
        };
    };

    const downloadImage = () => {
        htmlToImage
            .toPng(document.getElementById('image') as HTMLElement)
            .then(function (dataUrl: any) {
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
                        canvas.width = firstImage.width;
                        canvas.height = firstImage.height;
                        const imageData = ctx?.createImageData(firstImage.width, firstImage.height);
                        if (imageData) {
                            for (let i = 0; i < imageData.data.length; i++) {
                                imageData.data[i] = rgba[i];
                            }
                            ctx?.putImageData(imageData, 0, 0);
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
                canvas.width = imageData.width;
                canvas.height = imageData.height;

                // Convert imageData to Uint8ClampedArray
                const clampedArray = new Uint8ClampedArray(imageData);

                // Create ImageData object
                const imageDataObj = new ImageData(clampedArray, imageData.width, imageData.height);

                // Clear canvas before rendering
                ctx?.clearRect(0, 0, canvas.width, canvas.height);

                // Render image data on canvas
                ctx?.putImageData(imageDataObj, 0, 0);
            }
        } else {
            setIsTiff(false);
            setImage(objectUrl);
        }
    };

    useEffect(() => {
        if (isTiff && canvasRef.current) {
            canvasRef.current.style.filter = applyFilters().filter;
        }
    }, [options, isTiff]); // Include options and isTiff in the dependency array

    return (
       
        <div className='container'>
            <NavbarMenu />
            <div className='canvas-container'>
                {image || isTiff ? (
                    <div className='main-image' style={applyFilters()} id='image'>
                        {isTiff && <canvas ref={canvasRef} className='tiff-canvas' />}
                    </div>
                ) : (
                    <div className='upload-image'>
                            <img src="/DWARFLAB_LOGO_Green.png" className="logo"alt="Light Logo" /> <h1>Quick PhotoEditor</h1>
                            <input type='file' accept='image/*,.fits' onChange={handleImage} />
                    </div>
                )}
            </div>
            <div className='second-bar'>
                {options?.map((option, index) => (
                    <SidebarItem
                        key={index}
                        name={option.name}
                        active={index === selectedOptionIndex}
                        handleClick={() => setSelectedOptionIndex(index)}
                    />
                ))}
                <button className='download' onClick={downloadImage}>
                    Download
                </button>
            </div>
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
                    value={String(selectedOption.value)}
                    onChange={handleColorChange}
                />
            )}
        </div>
    );

}

export default App;



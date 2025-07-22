import { useRef, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import fx from 'glfx';

interface CRTProps {
    screenHeight?: number;
    screenWidth?: number;
}

export interface CRTRef {
    setBuffer: (buffer: number[]) => void;
    writeBuffer: () => void;
    grow: () => void;
}

// Function to create scanlines procedurally
const createScanlinesImage = (width: number, height: number): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    
    // Create scanlines pattern
    for (let y = 0; y < height; y += 2) {
        ctx.fillStyle = y % 4 === 0 ? 'rgba(0, 0, 0, 0.05)' : 'rgba(0, 0, 0, 0.03)';
        ctx.fillRect(0, y, width, 1);
    }
    
    // Add vignette effect
    const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height)/2);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.1)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    return canvas;
};

// CRT functional component
const CRT = forwardRef<CRTRef, CRTProps>(({ screenHeight = 240, screenWidth = 256 }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const glCanvasRef = useRef<any>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);
    const imageDataRef = useRef<ImageData | null>(null);
    const buffer = useRef<ArrayBuffer | null>(null);
    const buffer8 = useRef<Uint8ClampedArray | null>(null);
    const buffer32 = useRef<Uint32Array | null>(null);
    const textureRef = useRef<any>(null);
    const scanlinesRef = useRef<HTMLCanvasElement | null>(null);
    const webglInitialized = useRef<boolean>(false);

    const initializeWebGL = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || webglInitialized.current) return;

        try {
            // Create WebGL canvas
            const glCanvas = fx.canvas();
            glCanvasRef.current = glCanvas;
            
            // Create texture from source canvas
            textureRef.current = glCanvas.texture(canvas);
            
            // Create scanlines image
            scanlinesRef.current = createScanlinesImage(screenWidth, screenHeight);
            
            // Set up dimensions first
            glCanvas.width = screenWidth;
            glCanvas.height = screenHeight;
            
            // Style the WebGL canvas to fit within parent while maintaining aspect ratio
            glCanvas.style.display = 'block';
            glCanvas.style.imageRendering = 'pixelated';
            glCanvas.style.imageRendering = '-moz-crisp-edges';
            glCanvas.style.imageRendering = 'crisp-edges';
            glCanvas.style.position = 'absolute';
            glCanvas.style.marginBottom = '4%';
            glCanvas.style.marginRight = '1%';
            
            // Replace the original canvas with WebGL canvas
            if (canvas.parentNode) {
                canvas.parentNode.replaceChild(glCanvas, canvas);
                // Keep the original canvas hidden but accessible for rendering
                canvas.style.display = 'none';
            }
            
            webglInitialized.current = true;
            
        } catch (e) {
            console.warn('WebGL not supported, falling back to regular canvas:', e);
        }
    }, [screenWidth, screenHeight]);

    const grow = useCallback(() => {
        const glCanvas = glCanvasRef.current;
        const canvas = canvasRef.current;
        
        // Handle WebGL canvas sizing
        if (glCanvas && webglInitialized.current) {
            let parent = glCanvas.parentNode;
            if (parent) {
                // @ts-ignore
                let parentWidth = parent.clientWidth * 0.7;
                // @ts-ignore
                let parentHeight = parent.clientHeight * 0.7;
                let parentRatio = parentWidth / parentHeight;
                let desiredRatio = 1.38 //screenWidth / screenHeight;
                
                if (desiredRatio < parentRatio) {
                    glCanvas.style.width = `${Math.round(parentHeight * desiredRatio)}px`;
                    glCanvas.style.height = `${parentHeight}px`;
                } else {
                    glCanvas.style.width = `${parentWidth}px`;
                    glCanvas.style.height = `${Math.round(parentWidth / desiredRatio)}px`;
                }
            }
            return;
        }
        
        // Fallback for regular canvas
        if (canvas) {
            let parent = canvas.parentNode;
            if (parent) {
                // @ts-ignore
                let parentWidth = parent.clientWidth;
                // @ts-ignore
                let parentHeight = parent.clientHeight;
                let parentRatio = parentWidth / parentHeight;
                let desiredRatio = screenWidth / screenHeight;
                
                if (desiredRatio < parentRatio) {
                    canvas.style.width = `${Math.round(parentHeight * desiredRatio)}px`;
                    canvas.style.height = `${parentHeight}px`;
                } else {
                    canvas.style.width = `${parentWidth}px`;
                    canvas.style.height = `${Math.round(parentWidth / desiredRatio)}px`;
                }
            }
        }
    }, [screenWidth, screenHeight]);

    const applyWebGLEffects = useCallback(() => {
        const canvas = canvasRef.current;
        const glCanvas = glCanvasRef.current;
        const texture = textureRef.current;
        const scanlines = scanlinesRef.current;
        
        if (!canvas || !glCanvas || !texture || !scanlines) return;
        
        const context = canvas.getContext('2d');
        if (!context) return;
        
        // Apply scanlines to source canvas
        context.drawImage(scanlines, 0, 0, screenWidth, screenHeight);
        
        // Update WebGL texture
        texture.loadContentsOf(canvas);
        
        // Apply WebGL effects
        const w = screenWidth;
        const h = screenHeight;
        const hw = w / 2;
        const hh = h / 2;
        const w75 = w * 0.90;
        
        glCanvas.draw(texture)
            .bulgePinch(hw, hh, w75, 0.1)  // CRT bulge effect
            .vignette(0.25, 0.5)           // Vignette effect
            .noise(0.06)
            .triangleBlur(0.5)
            .update();
    }, [screenWidth, screenHeight]);

    useEffect(() => {
        // Get the current canvas DOM element from the ref.
        const canvas = canvasRef.current;

        // Ensure the canvas element exists before proceeding.
        if (canvas) {
            // Get the 2D rendering context for the canvas.
            const context = canvas.getContext('2d');
            contextRef.current = context;

            if (context) {
                imageDataRef.current = context.getImageData(0, 0, screenWidth, screenHeight);
                context.fillStyle = 'black';
                context.fillRect(0, 0, screenWidth, screenHeight);
                buffer.current = new ArrayBuffer(imageDataRef.current.data.length);
                buffer8.current = new Uint8ClampedArray(buffer.current);
                buffer32.current = new Uint32Array(buffer.current);

                // set alpha
                for (var i = 0; i < buffer32.current.length; ++i) {
                    buffer32.current[i] = 0xff000000;
                }
                
                // Initialize WebGL after canvas is ready
                setTimeout(initializeWebGL, 100);
            }
        }

        // Add resize event listener to handle zoom changes
        const handleResize = () => {
            // Delay the grow call to allow the browser to finish the zoom operation
            setTimeout(() => {
                grow();
            }, 100);
        };

        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            webglInitialized.current = false;
            window.removeEventListener('resize', handleResize);
        };
    }, [screenWidth, screenHeight, initializeWebGL, grow]);

    const setBuffer = useCallback((buffer: number[]) => {
        if (buffer32.current) {
            var i = 0;
            for (var y = 0; y < screenHeight; ++y) {
                for (var x = 0; x < screenWidth; ++x) {
                    i = y * 256 + x;
                    // Convert pixel from NES BGR to canvas ABGR
                    buffer32.current[i] = 0xff000000 | buffer[i]; // Full alpha
                }
            }
        }
    }, [screenHeight, screenWidth]);

    const writeBuffer = useCallback(() => {
        const canvas = canvasRef.current;

        if (canvas) {
            const context = canvas.getContext('2d');
            contextRef.current = context;
            
            if (context && imageDataRef.current && buffer8.current) {
                imageDataRef.current.data.set(buffer8.current);
                context.putImageData(imageDataRef.current, 0, 0);
                
                // Apply WebGL effects after updating the canvas
                applyWebGLEffects();
            }
        }
    }, [applyWebGLEffects]);

    useImperativeHandle(ref, () => ({
        setBuffer,
        writeBuffer,
        grow,
    }), [setBuffer, writeBuffer, grow]);

    return (
        <canvas
            id="emulator-canvas"
            width={screenWidth} 
            height={screenHeight} 
            ref={canvasRef} 
            style={{ 
                display: 'block', 
                position: 'absolute'
            }}
        />
    );
});

CRT.displayName = 'CRT';

export default CRT;

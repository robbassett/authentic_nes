// Imports
import { useEffect, useCallback, useRef, useState } from 'react';
import { Container, Image } from '@mantine/core';

import CRT, { CRTRef } from './CRT';
import { NES } from 'jsnes';


import loadBinary from './utils';
import FrameTimer, { FrameTimerRef } from './FrameTimer';
import KeyboardController from './Controller';

// Define the missing functions
const handleLoaded = (): void => {
    console.log('ROM loaded successfully');
};

const handleProgress = (): void => {
    console.log('Loading ROM...');
};

let ROMBinary: string | null = null;

// Load the ROM binary
loadBinary(
    'owlia.nes',
    (err: Error | null, data?: string) => {
        if (err) {
            console.log('Error loading ROM:', err);
        } else {
            ROMBinary = data || null;
            handleLoaded();
        }
    },
    handleProgress
);

// --- Emulator Functional Component ---
// This component orchestrates the NES emulator and its input.
export const Emulator = () => {
    // useRef to store the NES emulator instance.
    // This allows the instance to persist across renders without being re-created.
    const nesRef = useRef<NES | null>(null);
    const frameTimerRef = useRef<FrameTimerRef | null>(null);
    const crtRef = useRef<CRTRef | null>(null);
    const controllerRef = useRef<KeyboardController | null>(null);
    const [romLoaded, setRomLoaded] = useState(false);

    // Frame handling functions
    const setBuffer = useCallback((buffer: number[]) => {
        if (crtRef.current) {
            crtRef.current.setBuffer(buffer);
        }
    }, []);

    const writeBuffer = useCallback(() => {
        if (crtRef.current) {
            crtRef.current.writeBuffer();
        }
    }, []);

    // useEffect hook for component mounting logic.
    useEffect(() => {
        // Initialize the NES emulator instance.
        if (!nesRef.current) {
            nesRef.current = new NES({
                onFrame: setBuffer,
                onStatusUpdate: console.log
            });
        }

        // Initialize the keyboard controller
        if (!controllerRef.current && nesRef.current) {
            controllerRef.current = new KeyboardController({
                onButtonDown: (player: number, button: string) => {
                    nesRef.current?.buttonDown(player, button);
                },
                onButtonUp: (player: number, button: string) => {
                    nesRef.current?.buttonUp(player, button);
                }
            });
            controllerRef.current.addEventListeners();
        }

        // Check if ROM is loaded and load it
        const checkAndLoadROM = () => {
            if (ROMBinary && nesRef.current && !romLoaded) {
                nesRef.current.loadROM(ROMBinary);
                setRomLoaded(true);
                
                // Start the frame timer once ROM is loaded
                if (frameTimerRef.current) {
                    frameTimerRef.current.start();
                }
            }
        };

        // Check immediately
        checkAndLoadROM();
        
        // Delay the grow() call to allow WebGL initialization to complete
        if (crtRef.current) {
            setTimeout(() => {
                if (crtRef.current) {
                    crtRef.current.grow();
                }
            }, 200); // Give WebGL time to initialize
        }

        // Cleanup function for when the component unmounts.
        // This is crucial for releasing resources held by the emulator.
        return () => {
            // Remove controller event listeners
            // if (controllerRef.current) {
            //     controllerRef.current.removeEventListeners();
            // }
            
            // Stop frame timer
            if (frameTimerRef.current) {
                frameTimerRef.current.stop();
            }
            
            if (nesRef.current && typeof nesRef.current.destroy === 'function') {
                nesRef.current.destroy(); 
            }
        };
    }, [setBuffer]); // Empty dependency array means this effect runs only once on mount.

    // Render the CRT component with FrameTimer.
    return (
        <Container 
            fluid
            w='100%' 
            p={0} 
            m={0}
            style={{ 
                display: 'flex', 
                flex: 1,
                width: '100%',
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
            }}
        >
            <Image
                src='/crt2.png'
                style={{
                    width: 'auto', 
                    height: '100%', 
                    objectFit: 'contain',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    zIndex: 1000
                }}
            />
            <CRT ref={crtRef} />
            <FrameTimer
                ref={frameTimerRef}
                onGenerateFrame={() => nesRef.current?.frame()}
                onWriteFrame={writeBuffer}
            />
        </Container>
    );
};

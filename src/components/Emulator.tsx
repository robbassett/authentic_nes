// Imports
import { useEffect, useCallback, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { Container, Image } from '@mantine/core';

import CRT, { CRTRef } from './CRT';
import { NES } from 'jsnes';


import loadBinary from './utils';
import FrameTimer, { FrameTimerRef } from './FrameTimer';
import KeyboardController from './Controller';
import Speakers, { SpeakersRef } from './Speakers';

export interface EmulatorRef {
    handleRom: (rom:string) => void;
}

// --- Emulator Functional Component ---
// This component orchestrates the NES emulator and its input.
export const Emulator = forwardRef<EmulatorRef, {}>(({}, ref) => {
    // useRef to store the NES emulator instance.
    // This allows the instance to persist across renders without being re-created.
    const nesRef = useRef<NES | null>(null);
    const speakersRef = useRef<SpeakersRef | null>(null);
    const frameTimerRef = useRef<FrameTimerRef | null>(null);
    const crtRef = useRef<CRTRef | null>(null);
    const controllerRef = useRef<KeyboardController | null>(null);
    const [romLoaded, setRomLoaded] = useState(false);
    const [ROMBinary, setROMBinary] = useState<string | null>(null);

    // Rom loading function
    const handleRom = (rom:string) => {
        console.log(rom);
        // Reset romLoaded state to allow loading new ROM
        setRomLoaded(false);
        
        loadBinary(
            rom,
            (err: Error | null, data?: string) => {
                if (err) {
                    console.log('Error loading ROM:', err);
                } else {
                    const rb = data || null;
                    setROMBinary(rb);
                }
            }
        )
    };

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

    // Audio handling function
    function onBufferUnderrun(desiredSize: number) {
        let frameTimer = frameTimerRef.current;
        if (frameTimer) {
            frameTimer.generateFrame();
            let speakers = speakersRef.current;
            if (speakers) {
                if (speakers.buffer.size() < desiredSize) {
                    frameTimer.generateFrame();
                }
            }
        }
    }

    // useEffect hook for component mounting logic.
    useEffect(() => {
        // Initialize the NES emulator instance.
        if (!nesRef.current) {
            nesRef.current = new NES({
                onFrame: setBuffer,
                onStatusUpdate: console.log,
                onAudioSample: (left: number, right: number) => {
                    if (speakersRef.current) {
                        speakersRef.current.writeSample(left, right);
                    }
                },
                sampleRate: speakersRef.current?.getSampleRate() || 44100
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

        // Check if a ROMBinary is parsed, if not parse a default
        if (!ROMBinary) {
            handleRom("dushlan.nes");
        }

        // Check if ROM is loaded and load it
        const checkAndLoadROM = () => {
            if (ROMBinary && nesRef.current && !romLoaded) {
                nesRef.current.loadROM(ROMBinary);
                setRomLoaded(true);
                
                // Start the frame timer and audio once ROM is loaded
                if (frameTimerRef.current) {
                    frameTimerRef.current.start();
                }
                
                // Start audio
                if (speakersRef.current) {
                    speakersRef.current.start();
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
            // Stop frame timer
            if (frameTimerRef.current) {
                frameTimerRef.current.stop();
            }
            
            // Stop audio
            if (speakersRef.current) {
                speakersRef.current.stop();
            }
            
            if (nesRef.current && typeof nesRef.current.destroy === 'function') {
                nesRef.current.destroy(); 
            }
        };
    }, [setBuffer, ROMBinary]);

    useImperativeHandle(ref, () => ({
        handleRom
    }), [handleRom]);

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
                src='crt2.png'
                style={{
                    width: 'auto', 
                    height: '100%', 
                    objectFit: 'contain',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    zIndex: 1000
                }}
            />
            <Image
                src='black.png'
                style={{
                    width: 'auto', 
                    height: '90%', 
                    objectFit: 'contain',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    position: 'absolute'
                }}
            />
            <CRT ref={crtRef} />
            <Speakers
                ref={speakersRef}
                bufferSize={2048}
                onBufferUnderrun={onBufferUnderrun}
            />
            <FrameTimer
                ref={frameTimerRef}
                onGenerateFrame={() => nesRef.current?.frame()}
                onWriteFrame={writeBuffer}
            />
        </Container>
    );
});

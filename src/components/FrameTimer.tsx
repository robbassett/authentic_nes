import { useRef, useCallback, useImperativeHandle, forwardRef } from 'react';

const FPS = 60;

interface FrameTimerProps {
    onGenerateFrame: () => void;
    onWriteFrame: () => void;
}

export interface FrameTimerRef {
    start: () => void;
    stop: () => void;
}

const FrameTimer = forwardRef<FrameTimerRef, FrameTimerProps>(({ onGenerateFrame, onWriteFrame }, ref) => {
    const runningRef = useRef(true);
    const intervalRef = useRef(1e3 / FPS);
    const lastFrameTimeRef = useRef<number | false>(false);
    const requestIDRef = useRef<number | null>(null);

    const requestAnimationFrame = useCallback(() => {
        requestIDRef.current = window.requestAnimationFrame(onAnimationFrame);
    }, []);

    const generateFrame = useCallback(() => {
        onGenerateFrame();
        if (typeof lastFrameTimeRef.current === 'number') {
            lastFrameTimeRef.current += intervalRef.current;
        }
    }, [onGenerateFrame]);

    const onAnimationFrame = useCallback((time: number) => {
        requestAnimationFrame();
      
        // how many ms after 60fps frame time
        let excess = time % intervalRef.current;

        // newFrameTime is the current time aligned to 60fps intervals.
        // i.e. 16.6, 33.3, etc ...
        let newFrameTime = time - excess;

        // first frame, do nothing
        if (!lastFrameTimeRef.current) {
            lastFrameTimeRef.current = newFrameTime;
            return;
        }

        let numFrames = Math.round(
            (newFrameTime - lastFrameTimeRef.current) / intervalRef.current
        );

        if (numFrames === 0) {
            return;
        }

        // update display on first frame only
        generateFrame();
        onWriteFrame();

        // we generate additional frames evenly before the next
        // onAnimationFrame call.
        // additional frames are generated but not displayed
        // until next frame draw
        let timeToNextFrame = intervalRef.current - excess;
        for (let i = 1; i < numFrames; i++) {
            setTimeout(() => {
                generateFrame();
            }, (i * timeToNextFrame) / numFrames);
        }
        if (numFrames > 1) console.log("SKIP", numFrames - 1, lastFrameTimeRef.current);
    }, [requestAnimationFrame, generateFrame, onWriteFrame]);

    const start = useCallback(() => {
        runningRef.current = true;
        requestAnimationFrame();
    }, [requestAnimationFrame]);

    const stop = useCallback(() => {
        runningRef.current = false;
        if (requestIDRef.current) {
            window.cancelAnimationFrame(requestIDRef.current);
        }
        lastFrameTimeRef.current = false;
    }, []);

    useImperativeHandle(ref, () => ({
        start,
        stop
    }), [start, stop]);

    return null;
});

FrameTimer.displayName = 'FrameTimer';

export default FrameTimer;

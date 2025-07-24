import { useCallback, useRef, forwardRef, useImperativeHandle } from "react";
// @ts-ignore
import RingBuffer from 'ringbufferjs';

interface SpeakersProps {
    bufferSize: number;
    onBufferUnderrun: (desiredSize: number) => void;
}

export interface SpeakersRef {
    start: () => void;
    stop: () => void;
    buffer: any;
    writeSample: (left: number, right: number) => void;
    getSampleRate: () => number;
}

const Speakers = forwardRef<SpeakersRef, SpeakersProps>(({bufferSize, onBufferUnderrun}, ref) => {
    const bufferRef = useRef<any>(new RingBuffer(bufferSize * 2))
    const audioContextRef = useRef<AudioContext | null>(null);
    const scriptNodeRef = useRef<any | null>(null);

    const getSampleRate = useCallback((): number => {
        if (!window.AudioContext) {
            return 44100;
        }
        let myCtx = new window.AudioContext();
        let sampleRate = myCtx.sampleRate;
        myCtx.close();
        return sampleRate;
    }, []);

    const start = useCallback(() => {
        // Audio is not supported
        if (!window.AudioContext) {
            return;
        }
        audioContextRef.current = new window.AudioContext();
        scriptNodeRef.current = audioContextRef.current.createScriptProcessor(1024, 0, 2)
        scriptNodeRef.current.onaudioprocess = onaudioprocess;
        scriptNodeRef.current.connect(audioContextRef.current.destination);
    }, [])

    const stop = useCallback(() => {
        let scriptNode = scriptNodeRef.current;
        if (scriptNode) {
            scriptNode.disconnect(audioContextRef.current?.destination);
            scriptNode.onaudioprocess = null;
            scriptNode = null;
        }
        let audioContext = audioContextRef.current;
        if (audioContext) {
            audioContext.close();
            audioContext = null;
        }
    },[])

    const writeSample = useCallback((left: number, right: number) => {
        let buffer = bufferRef.current;
        if (buffer.length / 2 >= bufferSize) {
            buffer.deqN(bufferSize / 2);
        }
        buffer.enq(left);
        buffer.enq(right);
    }, [bufferSize]);

    function onaudioprocess(e: AudioProcessingEvent) {
        let left = e.outputBuffer.getChannelData(0);
        let right = e.outputBuffer.getChannelData(1);
        let size = left.length;
        let buffer = bufferRef.current;
         // We're going to buffer underrun. Attempt to fill the buffer.
        if (buffer.size() < size * 2 && onBufferUnderrun) {
            onBufferUnderrun(size * 2);
        }

        try {
        var samples = buffer.deqN(size * 2);
        } catch (e) {
            // onBufferUnderrun failed to fill the buffer, so handle a real buffer
            // underrun

            // ignore empty buffers... assume audio has just stopped
            var bufferSize = buffer.size() / 2;
            if (bufferSize > 0) {
                console.log(`Buffer underrun (needed ${size}, got ${bufferSize})`);
            }
            for (var j = 0; j < size; j++) {
                left[j] = 0;
                right[j] = 0;
            }
            return;
        }
        for (var i = 0; i < size; i++) {
            left[i] = samples[i * 2];
            right[i] = samples[i * 2 + 1];
        }
    }

    useImperativeHandle(ref, () => ({
        start,
        stop,
        buffer: bufferRef.current,
        writeSample,
        getSampleRate
    }), [start, stop, writeSample, getSampleRate]);

    return null;
})

export default Speakers;

import React, { useCallback, useMemo, useRef } from 'react';
import { Howl } from 'howler';
import flickFX from '../assets/flick.mp3';
import tapFX from '../assets/tap.mp3';
import useFrame from '../hooks/useFrame';

function SoundFX({ music, time2Notes }) {
    const tap = useMemo(() => new Howl({ src: [tapFX] }), []);
    const flick = useMemo(() => new Howl({ src: [flickFX] }), []);

    // to bypass the React render procedure and elimanate delay playing sound,
    // we check for new sound events every frame, that is, sound events that happened/
    // after last frame and before this frame.
    const lastTimeRef = useRef(0);
    const onFrame = useCallback(() => {
        if (music.paused) return;
        let hasTap = false, hasFlick = false;
        time2Notes.forEach((_, { flick }) => {
            // both sound effects are played only once in one frame
            if (flick) hasFlick = true;
            else hasTap = true;
        }, lastTimeRef.current, music.currentTime);
        lastTimeRef.current = music.currentTime;
        if (hasTap) tap.play();
        if (hasFlick) flick.play();
    }, [flick, music, tap, time2Notes]);
    useFrame(onFrame);

    return <div/>;
};

export default SoundFX;

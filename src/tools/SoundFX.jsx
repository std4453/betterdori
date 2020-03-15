import React from 'react';
import { Howl } from 'howler';
import { useEffect, useMemo } from 'react';
import flickFX from '../assets/flick.mp3';
import tapFX from '../assets/tap.mp3';

function SoundFX({ music, time2Notes }) {
    const tap = useMemo(() => new Howl({ src: [tapFX] }), []);
    const flick = useMemo(() => new Howl({ src: [flickFX] }), []);

    // to bypass the React render procedure and elimanate delay playing sound,
    // we check for new sound events every frame, that is, sound events that happened/
    // after last frame and before this frame.
    useEffect(() => {
        let lastTime = 0;
        const onFrame = () => {
            let hasTap = false, hasFlick = false;
            time2Notes.forEach((_, { flick }) => {
                // both sound effects are played only once in one frame
                if (flick) hasFlick = true;
                else hasTap = true;
            }, lastTime, music.currentTime);
            lastTime = music.currentTime;
            if (hasTap) tap.play();
            if (hasFlick) flick.play();
        };

        let valid = true;
        const onFrameWrapped = () => {
            onFrame();
            if (valid) requestAnimationFrame(onFrameWrapped);
        };
        requestAnimationFrame(onFrameWrapped);
        return () => { valid = false; };
    }, [flick, tap, music, time2Notes]);

    return <div/>;
};

export default SoundFX;

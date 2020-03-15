import React from 'react';
import { Howl } from 'howler';
import { useEffect, useMemo } from 'react';
import flickFX from './assets/flick.mp3';
import tapFX from './assets/tap.mp3';

function SoundFX({ compiled: { notes, music } }) {
    const tap = useMemo(() => new Howl({ src: [tapFX] }), []);
    const flick = useMemo(() => new Howl({ src: [flickFX] }), []);

    // to bypass the React render procedure and elimanate delay playing sound,
    // we check for new sound events every frame, that is, sound events that happened/
    // after last frame and before this frame.
    useEffect(() => {
        let lastTime = 0;
        const onFrame = () => {
            for (const { lanes } of notes.filter(
                ({ time }) => time > lastTime && time <= music.currentTime
            )) {
                // both sound effects are played only once in one frame
                let hasTap = false, hasFlick = false;
                for (let lane = 0; lane < 7; ++lane) {
                    if (typeof lanes[lane] === 'undefined') continue;
                    const { flick } = lanes[lane];
                    if (flick) hasFlick = true;
                    else hasTap = true;
                }
                if (hasTap) tap.play();
                if (hasFlick) flick.play();
            }
            lastTime = music.currentTime;
        };

        let valid = true;
        const onFrameWrapped = () => {
            onFrame();
            if (valid) requestAnimationFrame(onFrameWrapped);
        };
        requestAnimationFrame(onFrameWrapped);
        return () => { valid = false; };
    }, [notes, flick, tap, music]);

    return <div/>;
};

export default SoundFX;

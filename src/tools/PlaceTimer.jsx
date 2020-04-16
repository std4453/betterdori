import React, { useCallback } from 'react';
import KeyboardEventHandler from 'react-keyboard-event-handler';
import useEvent from './useEvent';

function PlaceTimer({ code, containerEl, setCode, inflate, quantize, timers, setTimers, currentBPM }) {
    const setMyCode = useCallback(() => setCode('timer'), [setCode]);

    const onClick = useCallback((e) => {
        if (code !== 'timer') return;
        const { time } = inflate(e);
        const { beat } = quantize(time);
        const it = timers.find(beat);
        if (it.valid) setTimers(it.update({ bpm: currentBPM }));
        else setTimers(timers.insert(beat, { bpm: currentBPM }));
    }, [code, currentBPM, inflate, quantize, setTimers, timers]);
    useEvent(containerEl, 'click', onClick);
    const onContextMenu = useCallback((e) => {
        if (code !== 'timer') return;
        const { time } = inflate(e);
        const { beat } = quantize(time);
        const it = timers.find(beat);
        if (it.valid) setTimers(it.remove());
    }, [code, inflate, quantize, setTimers, timers]);
    useEvent(containerEl, 'contextmenu', onContextMenu);
    
    return (
        <KeyboardEventHandler handleKeys={['a']} onKeyEvent={setMyCode}/>
    );
}

export default PlaceTimer;

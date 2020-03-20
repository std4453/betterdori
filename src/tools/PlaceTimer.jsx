import React, { useCallback } from 'react';
import KeyboardEventHandler from 'react-keyboard-event-handler';
import useEvent from './useEvent';

function PlaceTimer({ code, innerEl, setCode, inflate, quantize, timers, setTimers }) {
    const setMyCode = useCallback(() => setCode('timer'), [setCode]);

    const bpm = 120;
    const onClick = useCallback((e) => {
        if (code !== 'timer') return;
        const { time } = inflate(e);
        const { beat } = quantize(time);
        const it = timers.find(beat);
        if (it.valid) setTimers(it.update({ bpm }));
        else setTimers(timers.insert(beat, { bpm }));
    }, [code, inflate, quantize, setTimers, timers]);
    useEvent(innerEl, 'click', onClick);
    
    return (
        <KeyboardEventHandler handleKeys={['a']} onKeyEvent={setMyCode}/>
    );
}

export default PlaceTimer;

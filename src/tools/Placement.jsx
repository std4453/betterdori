import React, { useCallback, useEffect, useContext } from 'react';
import KeyboardEventHandler from 'react-keyboard-event-handler';
import { ToolContext } from './Tool';
import { quantize } from './utils';

function Placement({
    time2Timers, notes, setNotes, music: { duration }, innerEl, settings: { division },
}) {
    const { code, setCode } = useContext(ToolContext);
    const setMyCode = useCallback(() => setCode('single'), [setCode]);
    
    const addNote = useCallback((e) => {
        if (code !== 'single') return;
        if (!innerEl) return;
        const { x, y, height, width } = innerEl.getBoundingClientRect();
        const top = e.clientY - y;
        const time = (1 - top / height) * duration;
        const { beat } = quantize(time, time2Timers, division);
        const left = e.clientX - x;
        // round to center of each lane
        const lane = Math.round(left / width * 11 - 2.5);
        if (lane < 0 || lane >= 7) return;
        // if a note already exists with the same note and line, abandon placement
        for (const it = notes.ge(beat); it.valid && it.key === beat; it.next()) {
            if (it.value.lane === lane) return;
        }
        setNotes(notes.insert(beat, { note: 'Single', lane }));
    }, [code, division, duration, innerEl, notes, setNotes, time2Timers]);
    useEffect(() => {
        if (!innerEl) return;
        innerEl.addEventListener('click', addNote);
        return () => innerEl.removeEventListener('click', addNote);
    }, [innerEl, addNote]);

    return (
        <KeyboardEventHandler handleKeys={['f']} onKeyEvent={setMyCode}/>
    );
}

export default Placement;

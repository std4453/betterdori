import React, { useCallback, useEffect, useContext } from 'react';
import KeyboardEventHandler from 'react-keyboard-event-handler';
import { ToolContext } from './Tool';
import { quantize } from './utils';

const hasNote = (notes, beat, lane) => {
    for (const it = notes.ge(beat); it.valid && it.key === beat; it.next()) {
        if (it.value.lane === lane) return it;
    }
};

function Placement({
    time2Timers, notes, setNotes, music: { duration }, innerEl, settings: { division },
}) {
    const { code, setCode } = useContext(ToolContext);
    const setSingle = useCallback(() => setCode('placement/single'), [setCode]);
    const setSlideA = useCallback(() => setCode('placement/slide-a'), [setCode]);
    const setSlideB = useCallback(() => setCode('placement/slide-b'), [setCode]);
    
    const addNote = useCallback((e) => {
        if (!code.startsWith('placement/')) return;
        if (!innerEl) return;
        const { x, y, height, width } = innerEl.getBoundingClientRect();
        const top = e.clientY - y;
        const time = (1 - top / height) * duration;
        const { beat } = quantize(time, time2Timers, division);
        const left = e.clientX - x;
        // round to center of each lane
        const lane = Math.round(left / width * 11 - 2.5);
        if (lane < 0 || lane >= 7) return;

        switch (code) {
            case 'placement/single': {
                // if a note already exists with the same note and line, abandon placement
                if (hasNote(notes, beat, lane)) break;
                setNotes(notes.insert(beat, { note: 'Single', lane }));
                break;
            }
            case 'placement/slide-a': case 'placement/slide-b': {
                const pos = code.substring(code.length - 1).toUpperCase(); // A or B
                const it = hasNote(notes, beat, lane);
                if (!it) {
                    // default to true so if no such notes are found, a head is created
                    let foundTail = true;
                    // search in reverse order and try to find the last slide note
                    // with same pos
                    for (const it2 = notes.lt(beat); it2.valid; it2.prev()) {
                        const { value: { note: type, pos: notePos, end } } = it2;
                        if (type !== 'Slide' || notePos !== pos) continue;
                        if (!end) foundTail = false;
                        break;
                    }
                    // if last slide with same pos was not tail, then the last snake
                    // has not terminated, and a middle slide note was inserted, otherwise
                    // a head note was inserted to create a new snake.
                    setNotes(notes.insert(beat, {
                        lane, pos,
                        note: 'Slide',
                        flick: false,
                        start: foundTail,
                        end: false, // new note is never end
                    }))
                    break;
                }
                const { value: { note: type, pos: notePos, end, start } } = it;
                // overwrite same type only
                if (type !== 'Slide' || notePos !== pos) break;
                setNotes(it.update({
                    lane, pos,
                    note: 'Slide',
                    flick: false, // new note is never flick
                    start: false, // new note is never head
                    end: !(end || start), // if note was head or tail, convert to middle
                }));
                break;
            }
            default: break;
        }
    }, [code, division, duration, innerEl, notes, setNotes, time2Timers]);
    useEffect(() => {
        if (!innerEl) return;
        innerEl.addEventListener('click', addNote);
        return () => innerEl.removeEventListener('click', addNote);
    }, [innerEl, addNote]);

    return <>
        <KeyboardEventHandler handleKeys={['f']} onKeyEvent={setSingle}/>
        <KeyboardEventHandler handleKeys={['s']} onKeyEvent={setSlideA}/>
        <KeyboardEventHandler handleKeys={['d']} onKeyEvent={setSlideB}/>
    </>;
}

export default Placement;

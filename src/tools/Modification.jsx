import React, { useCallback, useRef, useEffect } from 'react';
import KeyboardEventHandler from 'react-keyboard-event-handler';
import useDrag from './useDrag';

// the bigger this value is, the more computational resources it consumes, the bigger
// the false negative rates are, and the smaller the false positive rates are.
const threshold = 0.1;

const modifyNote = (code, notes, findNotePure, setNotes, beat, lane) => {
    switch (code) {
        case 'modification/flick': {
            const it = findNotePure(notes, beat, lane);
            if (!it) break;
            const { value: note, value: { flick, note: type, end } } = it;
            if (type === 'Slide' && !end) break; // cannot switch flick state
            setNotes(it.update({ ...note, flick: !flick }));
            break;
        }
        default: break;
    }
};

function Modification({
    notes, setNotes, time2Timers, innerEl, inflate, matchNotePure, quantize, findNotePure,
    code, setCode,
}) {
    
    // notesRef serves as a cache to notes, the useEffect hook below keeps them
    // the same every React render, and if several modifications are to be made
    // to the notes object in the same React frame, notesRef.current will record
    // these modification and keep the UI responsive. For more details, see
    // comments to overriddenSetNotes beneath.
    // the other purpose of notesRef is to eliminate the need to re-memo onDragStart,
    // onDrag and onDragEnd every time notes changes. Otherwise, each new note will
    // result in re-execution of the useEffect hook registering mouse listeners,
    // destroying any internal state (like dragging) we kept in that closure.
    const notesRef = useRef(notes);
    useEffect(() => { notesRef.current = notes; }, [notes]);
    const codeRef = useRef(code);
    useEffect(() => { codeRef.current = code; }, [code]);

    const onDragStart = useCallback(() => {
        if (!code.startsWith('modification/')) return false;
    }, [code]);
    const onDrag = useCallback((e, { shift, left, right }) => {
        const notes = notesRef.current;
        const overriddenSetNotes = (newNotes) => {
            setNotes(newNotes);
            notesRef.current = newNotes;
        };
        if (!shift) return;
        const { time, lane } = inflate(e);
        const matched = matchNotePure(notes, time2Timers, time, lane, threshold);
        if (!matched) return;
        const { beat, lane: matchedLane } = matched;
        if (left) {
            modifyNote(code, notes, findNotePure, overriddenSetNotes, beat, matchedLane);
        }
        if (right) {
            const it = findNotePure(notes, beat, matchedLane);
            if (it) overriddenSetNotes(it.remove());
        }
    }, [code, findNotePure, inflate, matchNotePure, setNotes, time2Timers]);
    const onDragEnd = useCallback((e, { shift, left, right }) => {
        const notes = notesRef.current;
        if (shift) return;
        const { time, lane } = inflate(e);
        const matched = matchNotePure(notes, time2Timers, time, lane, threshold);
        if (!matched) return;
        const { beat, lane: matchedLane } = matched;
        if (left) {
            modifyNote(code, notes, findNotePure, setNotes, beat, matchedLane);
        }
        if (right) {
            const it = findNotePure(notes, beat, matchedLane);
            if (it) setNotes(it.remove());
        }
    }, [code, findNotePure, inflate, matchNotePure, setNotes, time2Timers]);

    useDrag({ onDragStart, onDrag, onDragEnd, el: innerEl });

    const setFlick = useCallback(() => setCode('modification/flick'), [setCode]);
    return <>
        <KeyboardEventHandler handleKeys={['w']} onKeyEvent={setFlick}/>
    </>;
}

export default Modification;

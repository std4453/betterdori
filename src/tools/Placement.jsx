import React, { useCallback, useEffect, useRef } from 'react';
import KeyboardEventHandler from 'react-keyboard-event-handler';
import useDrag from './useDrag';

// the bigger this value is, the bigger the false positive rates are, and the smaller
// the false negative rates are, when user tries to draw a skewed line.
const placementThreshold = 0.25;
// the bigger this value is, the more computational resources it consumes, the bigger
// the false negative rates are, and the smaller the false positive rates are.
const removalThreshold = 0.1;

const placeNote = (code, notes, findNotePure, setNotes, beat, lane, convertSlide = true) => {
    switch (code) {
        case 'placement/single': {
            // if a note already exists with the same note and line, abandon placement
            if (findNotePure(notes, beat, lane)) break;
            setNotes(notes.insert(beat, { note: 'Single', lane }));
            break;
        }
        case 'placement/slide-a': case 'placement/slide-b': {
            const pos = code.substring(code.length - 1).toUpperCase(); // A or B
            const it = findNotePure(notes, beat, lane);
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
                }));
            } else if (convertSlide) {
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
            }
            break;
        }
        default: break;
    }
};

function Placement({
    notes, setNotes, time2Timers, innerEl, inflate, matchNotePure, quantize, findNotePure,
    code, setCode,
}) {
    const setSingle = useCallback(() => setCode('placement/single'), [setCode]);
    const setSlideA = useCallback(() => setCode('placement/slide-a'), [setCode]);
    const setSlideB = useCallback(() => setCode('placement/slide-b'), [setCode]);
    
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
        if (!code.startsWith('placement/')) return false;
    }, [code]);
    const onDrag = useCallback((e, { shift, left, right }) => {
        const notes = notesRef.current;
        // when dragging, the mousemove event might be fired multiple times in one
        // React render, which invokes onDrag and placeNote and setNotes multiple times,
        // each time adding a new note. However, changes in notes are not commited until
        // the next React render, which calls the previous useEffect hook and updates
        // notesRef.current. So, in this case, the notes object passed into placeNote
        // will remain unchanged, and the new notes object passed into setNotes will be
        // the notes at the beginning of this React render plus one note, and some notes
        // will be lost.
        // the solution is to set notesRef.current each time a new note is added, as a
        // cache to notes, and allow subsequent onDrag calls to see the new note fast
        // enough, thus the note loss is eliminated. Meanwhile, setNotes is still called,
        // and the global notes state will be updated in the next React render, which
        // allows ALL the new notes to be displayed.
        const overriddenSetNotes = (newNotes) => {
            setNotes(newNotes);
            notesRef.current = newNotes;
        };
        if (!shift) return;
        const { time, lane } = inflate(e);
        if (left) {
            const { beat, delta } = quantize(time);
            if (delta > placementThreshold) return;
            const quantizedLane = Math.round(lane);
            if (quantizedLane < 0 || quantizedLane >= 7) return;
            placeNote(code, notes, findNotePure, overriddenSetNotes, beat, quantizedLane, false);
        }
        if (right) {
            const matched = matchNotePure(notes, time2Timers, time, lane, removalThreshold);
            if (!matched) return;
            const { beat, lane: matchedLane } = matched;
            const it = findNotePure(notes, beat, matchedLane);
            if (it) overriddenSetNotes(it.remove());
        }
    }, [code, findNotePure, inflate, matchNotePure, quantize, setNotes, time2Timers]);
    const onDragEnd = useCallback((e, { shift, left, right }) => {
        const notes = notesRef.current;
        if (shift) return;
        const { time, lane } = inflate(e);
        if (left) {
            const { beat, delta } = quantize(time);
            if (delta > placementThreshold) return;
            const quantizedLane = Math.round(lane);
            if (quantizedLane < 0 || quantizedLane >= 7) return;
            placeNote(code, notes, findNotePure, setNotes, beat, quantizedLane);
        }
        if (right) {
            const matched = matchNotePure(notes, time2Timers, time, lane, removalThreshold);
            if (!matched) return;
            const { beat, lane: matchedLane } = matched;
            const it = findNotePure(notes, beat, matchedLane);
            if (it) setNotes(it.remove());
        }
    }, [code, findNotePure, inflate, matchNotePure, quantize, setNotes, time2Timers]);

    useDrag({ onDragStart, onDrag, onDragEnd, el: innerEl });

    return <>
        <KeyboardEventHandler handleKeys={['f']} onKeyEvent={setSingle}/>
        <KeyboardEventHandler handleKeys={['s']} onKeyEvent={setSlideA}/>
        <KeyboardEventHandler handleKeys={['d']} onKeyEvent={setSlideB}/>
    </>;
}

export default Placement;

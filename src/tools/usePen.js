import { useCallback, useEffect, useRef } from 'react';
import useDrag from './useDrag';

const usePen = ({
    notes, setNotes, inflate, code, findNotePure, matchNotePure, time2Timers, quantize, innerEl,
}, {
    prefix, useRemove = true, type, onClick, quantizeThreshold = 0.25, snapThreshold = 0.1,
}) => {
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
        if (!code.startsWith(prefix)) return false;
    }, [code, prefix]);
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
        if (left) {
            switch (type) {
                case 'quantize': {
                    const { time, lane } = inflate(e);
                    const { beat, delta } = quantize(time);
                    if (delta > quantizeThreshold) return;
                    const quantizedLane = Math.round(lane);
                    if (quantizedLane < 0 || quantizedLane >= 7) return;
                    onClick(code, notes, findNotePure, overriddenSetNotes, beat, quantizedLane, false);
                    break;
                }
                case 'snap': {
                    const { time, lane } = inflate(e);
                    const matched = matchNotePure(notes, time2Timers, time, lane, snapThreshold);
                    if (!matched) return;
                    const { beat, lane: matchedLane } = matched;
                    onClick(code, notes, findNotePure, overriddenSetNotes, beat, matchedLane, false);
                    break;
                }
                default: break;
            }
        }
        if (useRemove && right) {
            const { time, lane } = inflate(e);
            const matched = matchNotePure(notes, time2Timers, time, lane, snapThreshold);
            if (!matched) return;
            const { beat, lane: matchedLane } = matched;
            const it = findNotePure(notes, beat, matchedLane);
            if (it) overriddenSetNotes(it.remove());
        }
    }, [
        code, time2Timers, findNotePure, quantize, inflate, setNotes, matchNotePure,
        type, useRemove, onClick, quantizeThreshold, snapThreshold,
    ]);
    const onDragEnd = useCallback((e, { shift, left, right }) => {
        const notes = notesRef.current;
        if (shift) return;
        const { time, lane } = inflate(e);
        if (left) {
            switch (type) {
                case 'quantize': {
                    const { time, lane } = inflate(e);
                    const { beat, delta } = quantize(time);
                    if (delta > quantizeThreshold) return;
                    const quantizedLane = Math.round(lane);
                    if (quantizedLane < 0 || quantizedLane >= 7) return;
                    onClick(code, notes, findNotePure, setNotes, beat, quantizedLane, true);
                    break;
                }
                case 'snap': {
                    const { time, lane } = inflate(e);
                    const matched = matchNotePure(notes, time2Timers, time, lane, snapThreshold);
                    if (!matched) return;
                    const { beat, lane: matchedLane } = matched;
                    onClick(code, notes, findNotePure, setNotes, beat, matchedLane, true);
                    break;
                }
                default: break;
            }
        }
        if (useRemove && right) {
            const matched = matchNotePure(notes, time2Timers, time, lane, snapThreshold);
            if (!matched) return;
            const { beat, lane: matchedLane } = matched;
            const it = findNotePure(notes, beat, matchedLane);
            if (it) setNotes(it.remove());
        }
    }, [
        code, time2Timers, findNotePure, inflate, matchNotePure, quantize, setNotes,
        type, useRemove, onClick, quantizeThreshold, snapThreshold,
    ]);

    useDrag({ onDragStart, onDrag, onDragEnd, el: innerEl });
};

export default usePen;

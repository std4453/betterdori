import React, { useCallback } from 'react';
import KeyboardEventHandler from 'react-keyboard-event-handler';
import useDrag from './useDrag';

const clickThreshold = 10;
const snapThreshold = 0.1;

function Select({
    code, inflate, setCode, notes, setNotes, time2Timers, matchNotePure, findNotePure,
    innerEl,
}) {
    const setSelect = useCallback(() => setCode('select'), [setCode]);

    const onDragStart = useCallback(() => {
        if (code !== 'select') return false;
    }, [code]);
    const clearSelectionPure = useCallback((notes) => {
        for (let it = notes.begin; it.valid; it.next()) {
            const { index, value: { selected = false }, value: note } = it;
            if (selected) {
                notes = it.update({ ...note, selected: false });
                it = notes.at(index); // new notes
            }
        }
        return notes;
    }, []);
    const toggleNotesPure = useCallback((notes, startBeat, endBeat, startLane, endLane) => {
        for (let it = notes.ge(startBeat); it.valid && it.key < endBeat; it.next()) {
            const { index, value: note, value: { lane, selected } } = it;
            if (lane >= startLane && lane < endLane) {
                notes = it.update({ ...note, selected: !selected });
                it = notes.at(index); // new notes
            }
        }
        return notes;
    }, []);
    const onDragEnd = useCallback((e, { startX, startY, shift }) => {
        const { time, beat, lane } = inflate(e);
        const dist = Math.sqrt(Math.pow(e.clientX - startX, 2) + Math.pow(e.clientY - startY, 2));
        if (dist < clickThreshold) { // click
            let tmpNotes = notes;
            if (!shift) tmpNotes = clearSelectionPure(tmpNotes);
            const matched = matchNotePure(notes, time2Timers, time, lane, snapThreshold);
            if (matched) {
                const { beat, lane: matchedLane } = matched;
                const it = findNotePure(tmpNotes, beat, matchedLane);
                tmpNotes = it.update({ ...it.value, selected: !it.value.selected });
            }
            setNotes(tmpNotes);
        } else {
            let tmpNotes = notes;
            if (!shift) tmpNotes = clearSelectionPure(tmpNotes);
            const { beat: beat1, lane: lane1 } = inflate({ clientX: startX, clientY: startY });
            const beat2 = beat, lane2 = lane;
            // STAR BEAT ~星の鼓動~
            const startBeat = Math.min(beat1, beat2), endBeat = Math.max(beat1, beat2);
            const startLane = Math.min(lane1, lane2), endLane = Math.max(lane2, lane2);
            tmpNotes = toggleNotesPure(tmpNotes, startBeat, endBeat, startLane, endLane);
            setNotes(tmpNotes);
        }
    }, [clearSelectionPure, findNotePure, inflate, matchNotePure, notes, setNotes, time2Timers, toggleNotesPure]);
    useDrag({ onDragStart, onDragEnd, el: innerEl });
    
    return <>
        <KeyboardEventHandler handleKeys={['v']} onKeyEvent={setSelect}/>
    </>;
}

export default Select;

import React, { useCallback, useState } from 'react';
import KeyboardEventHandler from 'react-keyboard-event-handler';
import { makeStyles } from '@material-ui/styles';
import useDrag from './useDrag';

const useStyles = makeStyles({
    dragArea: {
        position: 'fixed',
        backgroundColor: 'rgba(89, 150, 255, 0.4)',
        border: '1px solid #5996FF',
    },
});

const clickThreshold = 10;
const snapThreshold = 0.1;

function Select({
    code, inflate, setCode, notes, setNotes, time2Timers, matchNotePure, findNotePure,
    innerEl,
}) {
    const classes = useStyles();
    const setSelect = useCallback(() => setCode('select'), [setCode]);

    const onDragStart = useCallback((_, state) => {
        if (code !== 'select') return false;
        state.click = true;
    }, [code]);
    const [dragArea, setDragArea] = useState(null);
    const onDrag = useCallback((e, state) => {
        const { startX, startY } = state;
        const dist = Math.sqrt(Math.pow(e.clientX - startX, 2) + Math.pow(e.clientY - startY, 2));
        if (dist > clickThreshold) state.click = false;
        if (dragArea) {
            dragArea.style.visibility = state.dragging ? '' : 'hidden';
            const x1 = Math.min(e.clientX, startX), x2 = Math.max(e.clientX, startX);
            const y1 = Math.min(e.clientY, startY), y2 = Math.max(e.clientY, startY);
            dragArea.style.left = `${x1}px`;
            dragArea.style.top = `${y1}px`;
            dragArea.style.width = `${x2 - x1}px`;
            dragArea.style.height = `${y2 - y1}px`;
        }
    }, [dragArea]);
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
    const onDragEnd = useCallback((e, { startX, startY, shift, click }) => {
        const { time, beat, lane } = inflate(e);
        if (click) { // click
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
            const startLane = Math.min(lane1, lane2), endLane = Math.max(lane1, lane2);
            tmpNotes = toggleNotesPure(tmpNotes, startBeat, endBeat, startLane, endLane);
            setNotes(tmpNotes);
        }
        if (dragArea) dragArea.style.visibility = 'hidden';
    }, [clearSelectionPure, dragArea, findNotePure, inflate, matchNotePure, notes, setNotes, time2Timers, toggleNotesPure]);
    useDrag({ onDragStart, onDrag, onDragEnd, el: innerEl });
    
    return <>
        <KeyboardEventHandler handleKeys={['v']} onKeyEvent={setSelect}/>
        <div className={classes.dragArea} ref={setDragArea}/>
    </>;
}

export default Select;

import React, { useCallback, useState } from 'react';
import KeyboardEventHandler from 'react-keyboard-event-handler';
import { makeStyles } from '@material-ui/styles';
import createTree from 'functional-red-black-tree';
import useDrag from './useDrag';

const useStyles = makeStyles({
    dragArea: {
        position: 'fixed',
        backgroundColor: 'rgba(89, 150, 255, 0.4)',
        border: '1px solid #5996FF',
        visibility: 'hidden',
    },
    dragLine: {
        position: 'fixed',
        pointerEvents: 'none',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
    },
});

const clickThreshold = 10;
const snapThreshold = 0.1;

function Select({
    code, inflate, setCode, notes, setNotes, time2Timers, matchNotePure, findNotePure,
    innerEl, quantize, deflate,
}) {
    const classes = useStyles();
    const setSelect = useCallback(() => setCode('select'), [setCode]);

    const onDragStart = useCallback((e, state) => {
        if (code !== 'select') return false;
        state.click = true;
        const { time, lane } = inflate(e);
        const matched = matchNotePure(notes, time2Timers, time, lane, snapThreshold);
        if (matched) {
            state.move = true;
            const { time: matchedTime, lane: matchedLane } = matched;
            const { x, y } = deflate({ time: matchedTime, lane: matchedLane });
            state.startX = x;
            state.startY = y;
        } else state.move = false;
    }, [code, deflate, inflate, matchNotePure, notes, time2Timers]);
    const [dragArea, setDragArea] = useState(null);
    const [dragLine, setDragLine] = useState(null);
    const onDrag = useCallback((e, state) => {
        const { startX, startY } = state;
        const dist = Math.sqrt(Math.pow(e.clientX - startX, 2) + Math.pow(e.clientY - startY, 2));
        if (dist > clickThreshold) state.click = false;
        if (dragArea) {
            dragArea.style.visibility = state.dragging && !state.move ? 'unset' : 'hidden';
            const x1 = Math.min(e.clientX, startX), x2 = Math.max(e.clientX, startX);
            const y1 = Math.min(e.clientY, startY), y2 = Math.max(e.clientY, startY);
            dragArea.style.left = `${x1}px`;
            dragArea.style.top = `${y1}px`;
            dragArea.style.width = `${x2 - x1}px`;
            dragArea.style.height = `${y2 - y1}px`;
        }
        if (dragLine) {
            const { time, lane } = inflate(e);
            const { time: quantizedTime } = quantize(time);
            let quantizedLane = Math.round(lane);
            if (quantizedLane < 0) quantizedLane = 0;
            if (quantizedLane > 6) quantizedLane = 6;
            const { x, y } = deflate({ time: quantizedTime, lane: quantizedLane });
            dragLine.style.visibility = state.dragging && state.move ? 'unset' : 'hidden';
            const x1 = state.shift ? startX : x, x2 = startX;
            const y1 = y, y2 = startY;
            dragLine.setAttribute('x1', `${x1}`);
            dragLine.setAttribute('x2', `${x2}`);
            dragLine.setAttribute('y1', `${y1}`);
            dragLine.setAttribute('y2', `${y2}`);
        }
    }, [deflate, dragArea, dragLine, inflate, quantize]);
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
    const onDragEnd = useCallback((e, { startX, startY, shift, click, move }) => {
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
        } else if (move) {
            const { time, lane } = inflate(e);
            const { beat: quantizedBeat } = quantize(time);
            let quantizedLane = Math.round(lane);
            if (quantizedLane < 0) quantizedLane = 0;
            if (quantizedLane > 6) quantizedLane = 6;
            const { beat: startBeat, lane: startLane } = inflate({ clientX: startX, clientY: startY });
            const deltaBeat = quantizedBeat - startBeat;
            const deltaLane = shift ? 0 : quantizedLane - startLane;
            let tmpNotes = createTree();
            const insert = (beat, note) => {
                const { lane } = note;
                if (!findNotePure(tmpNotes, beat, lane)) tmpNotes = tmpNotes.insert(beat, note);
            };
            for (let it = notes.begin; it.valid; it.next()) {
                const { key: noteBeat, value: note, value: { selected, lane: noteLane } } = it;
                if (!selected) insert(noteBeat, note);
                else {
                    const newBeat = noteBeat + deltaBeat;
                    let newLane = noteLane + deltaLane;
                    if (newLane < 0) newLane = 0;
                    if (newLane > 6) newLane = 6;
                    insert(newBeat, { ...note, lane: newLane });
                }
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
        if (dragLine) dragLine.style.visibility = 'hidden';
    }, [clearSelectionPure, dragArea, dragLine, findNotePure, inflate, matchNotePure, notes, quantize, setNotes, time2Timers, toggleNotesPure]);
    useDrag({ onDragStart, onDrag, onDragEnd, el: innerEl });
    
    return <>
        <KeyboardEventHandler handleKeys={['v']} onKeyEvent={setSelect}/>
        <div className={classes.dragArea} ref={setDragArea}/>
        <div className={classes.dragLine}>
            <svg width="100%" height="100%">
                <line stroke="#5996FF" strokeWidth="2" x1="100" x2="200" y1="100" y2="200" ref={setDragLine} style={{ visibility: 'hidden' }}/>
            </svg>
        </div>
    </>;
}

export default Select;

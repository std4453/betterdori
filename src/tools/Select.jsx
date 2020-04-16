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
    containerEl, quantize, deflate,
}) {
    const classes = useStyles();
    const setSelect = useCallback(() => setCode('select'), [setCode]);

    const onDragStart = useCallback((e, state) => {
        if (code !== 'select') return false;
        state.click = true;
        const { time, lane } = inflate(e);
        // if drag starts on a note, we assume that the user wants to move
        // select notes (relative to the note where the dragging begins).
        const matched = matchNotePure(notes, time2Timers, time, lane, snapThreshold);
        if (matched) {
            // save state to moving
            state.move = true;
            const { time: matchedTime, lane: matchedLane, beat } = matched;
            const { x, y } = deflate({ time: matchedTime, lane: matchedLane });
            // in this case, startX and startY is set to the beat and lane
            // of the current note, which would be exactly on the grid
            state.startX = x;
            state.startY = y;
            state.startIndex = findNotePure(notes, beat, matchedLane).index;
        } else state.move = false;
    }, [code, deflate, findNotePure, inflate, matchNotePure, notes, time2Timers]);
    const [dragArea, setDragArea] = useState(null);
    const [dragLine, setDragLine] = useState(null);
    const onDrag = useCallback((e, state) => {
        const { startX, startY } = state;
        // if the mouse did not go over clickThreshold pixels, we assume that
        // the user wanted to make a simple click. state.click is used to track
        // whether this threshold was exceeded during the dragging process
        const dist = Math.sqrt(Math.pow(e.clientX - startX, 2) + Math.pow(e.clientY - startY, 2));
        if (dist > clickThreshold) state.click = false;
        if (dragArea) {
            // dragArea tracks the rectangle between the starting point and the
            // current point, like when you drag on the Windows desktop.
            // the drag area is visible only when the user is selecting instead
            // of moving
            dragArea.style.visibility = !state.move ? 'unset' : 'hidden';
            // width and height cannot be negative
            const x1 = Math.min(e.clientX, startX), x2 = Math.max(e.clientX, startX);
            const y1 = Math.min(e.clientY, startY), y2 = Math.max(e.clientY, startY);
            dragArea.style.left = `${x1}px`;
            dragArea.style.top = `${y1}px`;
            dragArea.style.width = `${x2 - x1}px`;
            dragArea.style.height = `${y2 - y1}px`;
        }
        if (dragLine) {
            // dragLine is the line between the starting point (which is ALWAYS
            // on the grid) and the current point, where the end point of the line
            // is quantized to the grid.
            const { time, lane } = inflate(e);
            const { time: quantizedTime } = quantize(time);
            let quantizedLane = Math.round(lane);
            if (quantizedLane < 0) quantizedLane = 0;
            if (quantizedLane > 6) quantizedLane = 6;
            // find the position of the end point
            const { x, y } = deflate({ time: quantizedTime, lane: quantizedLane });
            // the drag area is visible only when the user is moving instead
            // of selecting
            dragLine.style.visibility = state.move ? 'unset' : 'hidden';
            // the dragLine element is an SVG <line> element, where viewport is the
            // whole screen.
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
                // since notes is functional, the previous iterator will not
                // be working after the update, so we must find the iterator
                // pointing to the same element, but in the new tree.
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
                // see above
                it = notes.at(index); // new notes
            }
        }
        return notes;
    }, []);
    const onDragEnd = useCallback((e, { right, startX, startY, shift, click, move, startIndex }) => {
        const { time, beat, lane } = inflate(e);
        // if right button is pressed, under all circumstances, no matter
        // whether click or move is true, we delete all the selected notes.
        // if the last note is not selected, we clear the current selection
        // and select that note, just as in moves.
        // A right drag would not be meaningful, the behavior is undefined.
        if (right) {
            const matched = matchNotePure(notes, time2Timers, time, lane, snapThreshold);
            if (matched) {
                let tmpSource = notes;
                const { index, value: { selected } } = findNotePure(tmpSource, matched.beat, matched.lane);
                if (!selected) {
                    tmpSource = clearSelectionPure(tmpSource);
                    const newIt = tmpSource.at(index);
                    tmpSource = newIt.update({ ...newIt.value, selected: true });
                }
                let tmpNotes = createTree();
                for (let it = tmpSource.begin; it.valid; it.next()) {
                    const { key: noteBeat, value: note, value: { selected } } = it;
                    if (!selected) tmpNotes = tmpNotes.insert(noteBeat, note);
                }
                setNotes(tmpNotes);
            }
        } else if (click) {
            // if drag distance is too short that it's considered a click,
            // we treat it as if the user is selecting a single note
            let tmpNotes = notes;
            // if shift was pressed, toggle selection, otherwise replace selection,
            // hence we have to first clear the current selection
            if (!shift) tmpNotes = clearSelectionPure(tmpNotes);
            // if the user clicks on a note, select the note, otherwise clear
            // selection (as if the user is selecting nothing).
            const matched = matchNotePure(notes, time2Timers, time, lane, snapThreshold);
            if (matched) {
                // toggle selection of the matched note
                const { beat, lane: matchedLane } = matched;
                const it = findNotePure(tmpNotes, beat, matchedLane);
                tmpNotes = it.update({ ...it.value, selected: !it.value.selected });
            }
            setNotes(tmpNotes);
        } else if (move) {
            // if user is moving notes, we quantize the end point and find the
            // delta of lanes and beats
            const { time, lane } = inflate(e);
            const { beat: quantizedBeat } = quantize(time);
            let quantizedLane = Math.round(lane);
            if (quantizedLane < 0) quantizedLane = 0;
            if (quantizedLane > 6) quantizedLane = 6;

            // update notes
            // here we simply insert every note into the new tree, moving it if
            // it's selected. Since a duplicate check (O(logn) for RBTs) precedes
            // every insertion, the total time complexity would be (O(nlogn)), which
            // is a fairly high cost and leaves space for optimization.
            // TODO: optimize this
            let tmpNotes = createTree();

            // user experience adapted from Adobe Illustrator
            // if the user starts to move from an unselected note, we first clears
            // the current selection and selects the starting note, then move it
            // (as the single selected note). On the contrary, if the starting note
            // is selected, we simply move the whole selection. This allows the user
            // to move a note (and select it in the same time) without having to 
            // select anything in advance.
            // Note that this operation cannot be done when the drag begins, since
            // it's not yet determined whether the drag will end up as a click, in
            // which case we should NOT clear the current selection.
            let tmpSource = notes;
            // here, we do not simply inflate the starting point to get the starting
            // beat and lane, since round-off errors will created unexpected results.
            // instead, we use the index saved when the dragging begins to obtain
            // the starting note, and use its beat and lane instead.
            const { key: startBeat, value: { selected, lane: startLane } } = tmpSource.at(startIndex);
            if (!selected) {
                tmpSource = clearSelectionPure(tmpSource);
                const newIt = tmpSource.at(startIndex);
                tmpSource = newIt.update({ ...newIt.value, selected: true });
            }

            const deltaBeat = quantizedBeat - startBeat;
            // if shift was pressed, do not move lanes.
            const deltaLane = shift ? 0 : quantizedLane - startLane;

            const insert = (beat, note) => {
                const { lane } = note;
                // no duplicates. This means that when the move places two notes at
                // the same position, one of them will be ignored and there's NO
                // guarentee which one this is.
                if (!findNotePure(tmpNotes, beat, lane)) tmpNotes = tmpNotes.insert(beat, note);
            };
            // traverse through notes, if it's selected, insert it into tmpNotes
            // after moving, otherwise simply copy it.
            for (let it = tmpSource.begin; it.valid; it.next()) {
                const { key: noteBeat, value: note, value: { selected, lane: noteLane } } = it;
                if (!selected) insert(noteBeat, note);
                else {
                    const newBeat = noteBeat + deltaBeat;
                    // new beat should be non-negative
                    if (newBeat < 0) continue;
                    // new lane cannot exceed the [0, 6] range, note that this might
                    // cause the shape of the selection to change after moving, some
                    // notes might even disappear, pressing shift will solve the problem.
                    let newLane = noteLane + deltaLane;
                    if (newLane < 0) newLane = 0;
                    if (newLane > 6) newLane = 6;
                    insert(newBeat, { ...note, lane: newLane });
                }
            }
            setNotes(tmpNotes);
        } else {
            // if the user is selecting all notes in the rectangle, we traverse
            // through all the notes inside the beat range and toggle the selection
            // status.
            let tmpNotes = notes;
            // if shift was pressed, toggle selection, otherwise replace selection,
            // hence we have to first clear the current selection
            if (!shift) tmpNotes = clearSelectionPure(tmpNotes);
            const { beat: beat1, lane: lane1 } = inflate({ clientX: startX, clientY: startY });
            const beat2 = beat, lane2 = lane;
            // STAR BEAT ~星の鼓動~
            const startBeat = Math.min(beat1, beat2), endBeat = Math.max(beat1, beat2);
            const startLane = Math.min(lane1, lane2), endLane = Math.max(lane1, lane2);
            tmpNotes = toggleNotesPure(tmpNotes, startBeat, endBeat, startLane, endLane);
            setNotes(tmpNotes);
        }
        // hide drag area and drag line
        if (dragArea) dragArea.style.visibility = 'hidden';
        if (dragLine) dragLine.style.visibility = 'hidden';
    }, [clearSelectionPure, dragArea, dragLine, findNotePure, inflate, matchNotePure, notes, quantize, setNotes, time2Timers, toggleNotesPure]);
    useDrag({ onDragStart, onDrag, onDragEnd, el: containerEl });
    
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

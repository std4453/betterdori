import React, { useCallback, useEffect, useContext, useRef } from 'react';
import KeyboardEventHandler from 'react-keyboard-event-handler';
import { ToolContext } from './Tool';
import { quantize } from './utils';

// the bigger this valus is, the bigger weight a lane possesses in choosing the
// nearest note to remove.
const removalScaleX = 8;
// the bigger this value is, the bigger the false positive rates are, and the smaller
// the false negative rates are, when user tries to draw a skewed line.
const placementThreshold = 0.25;
// the bigger this value is, the more computational resources it consumes, the bigger
// the false negative rates are, and the smaller the false positive rates are.
const removalThreshold = 0.1;
// the bigger the value is, the worse the user experience becomes, and the smaller
// the computational resources it consumes.
const interpolateInterval = 15;

const hasNote = (notes, beat, lane) => {
    for (const it = notes.ge(beat); it.valid && it.key === beat; it.next()) {
        if (it.value.lane === lane) return it;
    }
};

// threshold means the mininum number of divisions (usually <= 0.5) the mouse event
// has to be near the quantized placement position for the placement to come into 
// effect.
// when we use shift + mouse dragging to add a series of notes, calcPlacement will
// first fit the event position into a nearby slot, which possesses a quantized beat
// and a certain lane number, and placeNote will add this note to the list of notes.
// However, if we simply stick to this implementation, we will find that the user
// is not absolutely accurate when trying to draw a skewed line. For example, if the
// user wants to navigate from (0, 0) to (1, 1), he might first reach (0.4, 0.6),
// which is rounded to (0, 1) by calcPlacement. So in the end, three notes are
// created, namely (0, 0), (0, 1) and (1, 1), which is not what the user will expect.
// the solution is to add a threshold, adding notes only when the event is close
// enough to the next y value, like by 25%. So if the user reaches (0.4, 0.6),
// calcPlacement returns an "invalid" answer and no note is added. By the time the
// user reaches y value > 0.75, the x value should be well above 0.5, so after rounding,
// the result would become (1, 1), just as expected.
const calcPlacement = (e, innerEl, duration, time2Timers, division, threshold = 0.5) => {
    const { x, y, height, width } = innerEl.getBoundingClientRect();
    const top = e.clientY - y;
    const time = (1 - top / height) * duration;
    const { beat, time: quantizedTime, bpm } = quantize(time, time2Timers, division);
    if (Math.abs(quantizedTime - time) > threshold / division / bpm * 60) return null;
    const left = e.clientX - x;
    // round to center of each lane, with 7 lanes in the center and 2 as padding.
    const lane = Math.round(left / width * 11 - 2.5);
    return { beat, lane };
};

const placeNote = (code, notes, setNotes, beat, lane, convertSlide = true) => {
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

// calcRemoval searches for the nearest note to the event, and return its position
// for removal. threshold means the minimum distance a note can be removed by an event
// at the location, measured in beats. If multiple notes meets the requirement, the
// nearest one is returned and removed.
// more specifically, a distance is calculated by the Euclidean distance between the
// note and the mouse event, measured in an scaled space, where one unit of the y axis
// represents 1 beat, and one unit of the x axis represents 8 lanes. This distance
// is then compared to the threshold, preventing notes that are far away from the event
// from being removed. If no such note is found, a object with lane: NaN is returned.
const calcRemoval = (e, innerEl, duration, time2Timers, notes, threshold) => {
    const { x, y, width, height } = innerEl.getBoundingClientRect();
    const top = e.clientY - y;
    const time = (1 - top / height) * duration;
    const lane = (e.clientX - x) / width * 11 - 2.5;
    const { key: startTime, value: { beat: startBeat, bpm } } = time2Timers.le(time);
    const beat = startBeat + (time - startTime) / 60 * bpm; 
    let minDist = threshold * threshold, minBeat, minLane = NaN;
    notes.forEach((noteBeat, { lane: noteLane }) => {
        const dist = Math.pow((noteLane - lane) / removalScaleX, 2) + Math.pow(noteBeat - beat, 2);
        if (dist < minDist) {
            minDist = dist;
            minBeat = noteBeat;
            minLane = noteLane;
        }
    }, beat - threshold, beat + threshold);
    return { beat: minBeat, lane: minLane };
};

const removeNote = (notes, setNotes, beat, lane) => {
    const it = hasNote(notes, beat, lane);
    if (it) setNotes(it.remove());
};

function Placement({
    time2Timers, notes, setNotes, music: { duration }, innerEl, division,
}) {
    const { code, setCode } = useContext(ToolContext);
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

    const onDragStart = useCallback(() => {}, []);
    const onDrag = useCallback(({ e, shift, left, right }) => {
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
            const res = calcPlacement(e, innerEl, duration, time2Timers, division, placementThreshold);
            if (!res) return;
            const { beat, lane } = res;
            if (lane < 0 || lane >= 7) return;
            placeNote(code, notes, overriddenSetNotes, beat, lane, false);
        }
        if (right) {
            const { beat, lane } = calcRemoval(e, innerEl, duration, time2Timers, notes, removalThreshold);
            if (isNaN(lane)) return;
            removeNote(notes, overriddenSetNotes, beat, lane);
        }
    }, [code, division, duration, innerEl, notesRef, setNotes, time2Timers]);
    const onDragEnd = useCallback(({ e, shift, left, right }) => {
        const notes = notesRef.current;
        if (shift) return;
        if (left) {
            const { beat, lane } = calcPlacement(e, innerEl, duration, time2Timers, division);
            if (lane < 0 || lane >= 7) return;
            placeNote(code, notes, setNotes, beat, lane);
        }
        if (right) {
            const { beat, lane } = calcRemoval(e, innerEl, duration, time2Timers, notes, removalThreshold);
            if (isNaN(lane)) return;
            removeNote(notes, setNotes, beat, lane);
        }
    }, [code, division, duration, innerEl, notesRef, setNotes, time2Timers]);

    useEffect(() => {
        if (!code.startsWith('placement/') || !innerEl) return;
        // keep these states in time - faster than the React rerender.
        let left = false, right = false, dragging = false, shift = false, valid = true;
        let lastX = 0, lastY = 0;
        const onMouseDown = (e) => {
            if (!valid) return;
            if (e.button === 0) left = true;
            if (e.button === 2) right = true;
            shift = e.shiftKey;
            lastX = e.clientX;
            lastY = e.clientY;
            if (!dragging) {
                dragging = true;
                onDragStart({ e, left, right, dragging, shift });
            }
            e.preventDefault();
            e.stopPropagation();
        };
        const onMouseMove = (e) => {
            // due to browser mechanics, the mousemove event itself
            // is throttled, so if the mouse moves too fase, two subsequent mousemove
            // events will have a very large gap, and some notes that are located
            // on the path of the mouse would be lost.
            // the solution is to interpolate manually, if two mousemove events come
            // with a big gap, the path is split into many segments, and fake events
            // are added so that the path looks smooth to onDrag.
            if (!valid) return;
            shift = e.shiftKey;
            if (dragging) {
                // here, the end point is always given to onDrag
                let steps = Math.round(Math.abs(e.clientY - lastY) / interpolateInterval);
                if (steps === 0) steps = 1;
                for (let i = 1; i <= steps; ++i) {
                    const t = i / steps;
                    const clientX = lastX + (e.clientX - lastX) * t;
                    const clientY = lastY + (e.clientY - lastY) * t;
                    onDrag({ e: { clientX, clientY }, left, right, dragging, shift });
                }
                lastX = e.clientX;
                lastY = e.clientY;
            }
            e.preventDefault();
            e.stopPropagation();
        };
        const onMouseUp = (e) => {
            if (!valid) return;
            if (dragging) {
                onDragEnd({ e, left, right, dragging, shift });
                dragging = false;
            }
            // shift = e.shiftKey;
            if (e.button === 0) left = false;
            if (e.button === 2) right = true;
            e.preventDefault();
            e.stopPropagation();
        };
        innerEl.addEventListener('mousedown', onMouseDown);
        innerEl.addEventListener('mousemove', onMouseMove);
        innerEl.addEventListener('mouseup', onMouseUp);
        return () => {
            valid = false;
            innerEl.removeEventListener('mousedown', onMouseDown);
            innerEl.removeEventListener('mousemove', onMouseMove);
            innerEl.removeEventListener('mouseup', onMouseUp);
        };
    }, [code, innerEl, onDrag, onDragEnd, onDragStart]);

    return <>
        <KeyboardEventHandler handleKeys={['f']} onKeyEvent={setSingle}/>
        <KeyboardEventHandler handleKeys={['s']} onKeyEvent={setSlideA}/>
        <KeyboardEventHandler handleKeys={['d']} onKeyEvent={setSlideB}/>
    </>;
}

export default Placement;

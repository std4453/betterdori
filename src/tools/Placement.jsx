import React, { useCallback } from 'react';
import KeyboardEventHandler from 'react-keyboard-event-handler';
import usePen from './usePen';

const placeNote = (code, notes, findNotePure, setNotes, beat, lane, singleClick) => {
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
            } else if (singleClick) {
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

function Placement(props) {
    const { setCode } = props;
    const setSingle = useCallback(() => setCode('placement/single'), [setCode]);
    const setSlideA = useCallback(() => setCode('placement/slide-a'), [setCode]);
    const setSlideB = useCallback(() => setCode('placement/slide-b'), [setCode]);
    
    usePen(props, { prefix: 'placement/', type: 'quantize', onClick: placeNote });

    return <>
        <KeyboardEventHandler handleKeys={['f']} onKeyEvent={setSingle}/>
        <KeyboardEventHandler handleKeys={['s']} onKeyEvent={setSlideA}/>
        <KeyboardEventHandler handleKeys={['d']} onKeyEvent={setSlideB}/>
    </>;
}

export default Placement;

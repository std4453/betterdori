import React, { useCallback } from 'react';
import KeyboardEventHandler from 'react-keyboard-event-handler';
import usePen from './usePen';

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

function Modification(props) {
    const { setCode } = props;
    usePen(props, { prefix: 'modification/', type: 'snap', onClick: modifyNote });

    const setFlick = useCallback(() => setCode('modification/flick'), [setCode]);
    return <>
        <KeyboardEventHandler handleKeys={['w']} onKeyEvent={setFlick}/>
    </>;
}

export default Modification;

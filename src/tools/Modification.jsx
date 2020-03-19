import React, { useCallback } from 'react';
import KeyboardEventHandler from 'react-keyboard-event-handler';

function Modification({ setCode }) {
    const setFlick = useCallback(() => setCode('modification/flick'), [setCode]);
    return <>
        <KeyboardEventHandler handleKeys={['w']} onKeyEvent={setFlick}/>
    </>;
}

export default Modification;
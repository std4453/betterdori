import React, { useCallback, useContext } from 'react';
import KeyboardEventHandler from 'react-keyboard-event-handler';
import { ToolContext } from './Tool';

function Modification() {
    const { setCode } = useContext(ToolContext);
    const setFlick = useCallback(() => setCode('modification/flick'), [setCode]);
    return <>
        <KeyboardEventHandler handleKeys={['w']} onKeyEvent={setFlick}/>
    </>;
}

export default Modification;
import React, { useCallback } from 'react';
import KeyboardEventHandler from 'react-keyboard-event-handler';

function Divisions({ setDivision }) {
    const setDivision1 = useCallback(() => setDivision(1), [setDivision]);
    const setDivision2 = useCallback(() => setDivision(2), [setDivision]);
    const setDivision3 = useCallback(() => setDivision(3), [setDivision]);
    const setDivision4 = useCallback(() => setDivision(4), [setDivision]);
    const setDivision6 = useCallback(() => setDivision(6), [setDivision]);
    const setDivision8 = useCallback(() => setDivision(8), [setDivision]);
    return <>
        <KeyboardEventHandler handleKeys={['1']} onKeyEvent={setDivision1}/>
        <KeyboardEventHandler handleKeys={['2']} onKeyEvent={setDivision2}/>
        <KeyboardEventHandler handleKeys={['3']} onKeyEvent={setDivision3}/>
        <KeyboardEventHandler handleKeys={['4']} onKeyEvent={setDivision4}/>
        <KeyboardEventHandler handleKeys={['6']} onKeyEvent={setDivision6}/>
        <KeyboardEventHandler handleKeys={['8']} onKeyEvent={setDivision8}/>
    </>;
}

export default Divisions;

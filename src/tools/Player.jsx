import React, { useCallback, useContext, useEffect } from 'react';
import KeyboardEventHandler from 'react-keyboard-event-handler';
import { ToolContext } from './Tool';

function Player({ music }) {
    const { code, setCode } = useContext(ToolContext);
    const onSpace = useCallback((_, event) => {
        if (music.paused) music.play();
        else music.pause();
        event.stopPropagation();
        event.preventDefault();
    }, [music]);
    const setMyCode = useCallback(() => setCode('player'), [setCode]);
    useEffect(() => {
        if (code !== 'player') music.pause();
    }, [code, music]);
    return <>
        <KeyboardEventHandler handleKeys={['r']} onKeyEvent={setMyCode}/>
        <KeyboardEventHandler isDisabled={code !== 'player'} handleKeys={['space']} onKeyEvent={onSpace}/>
    </>;
}

export default Player;
import React, { useCallback } from 'react';
import KeyboardEventHandler from 'react-keyboard-event-handler';
import { Tool } from './Tool';

function Player({ compiled: { music } }) {
    const onSpace = useCallback((_, event) => {
        if (music.paused) music.play();
        else music.pause();
        event.stopPropagation();
        event.preventDefault();
    }, [music]);
    return <>
        <Tool code="player" keys={['c']}/>
        <KeyboardEventHandler handleKeys={['space']} onKeyEvent={onSpace}/>
    </>;
}

export default Player;
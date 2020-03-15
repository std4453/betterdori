import React, { useCallback, useContext } from 'react';
import KeyboardEventHandler from 'react-keyboard-event-handler';
import { ToolContext } from './Tool';
import { quantize } from './utils';

function Player({ music, time2Timers, markers, setMarkers, settings: { division } }) {
    const { code, setCode } = useContext(ToolContext);
    const onSpace = useCallback((_, event) => {
        if (music.paused) music.play();
        else music.pause();
        event.stopPropagation();
        event.preventDefault();
    }, [music]);
    const onMarker = useCallback(() => {
        const { beat } = quantize(music.currentTime, time2Timers, division);
        // markers are unique in time, so one at a time
        if (!markers.find(beat).valid) {
            setMarkers(markers.insert(beat, {}));
        }
    }, [division, markers, music, setMarkers, time2Timers]);
    const setMyCode = useCallback(() => setCode('player'), [setCode]);
    return <>
        <KeyboardEventHandler handleKeys={['c']} onKeyEvent={setMyCode}/>
        <KeyboardEventHandler isDisabled={code !== 'player'} handleKeys={['space']} onKeyEvent={onSpace}/>
        <KeyboardEventHandler isDisabled={code !== 'player'} handleKeys={['e']} onKeyEvent={onMarker}/>
    </>;
}

export default Player;
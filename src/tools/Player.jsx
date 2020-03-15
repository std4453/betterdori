import React, { useCallback } from 'react';
import KeyboardEventHandler from 'react-keyboard-event-handler';
import { Tool } from './Tool';

function Player({ music, time2Timers, markers, setMarkers, settings: { division } }) {
    const onSpace = useCallback((_, event) => {
        if (music.paused) music.play();
        else music.pause();
        event.stopPropagation();
        event.preventDefault();
    }, [music]);
    const onMarker = useCallback(() => {
        const time = music.currentTime;
        const { key: rangeStartTime, value: { bpm, beat: rangeStartBeat } } = time2Timers.le(time);
        const { value: { beat: rangeEndBeat } } = time2Timers.gt(time);
        let quantizedBeat = rangeStartBeat + Math.round(
            (time - rangeStartTime) / 60 * bpm// beats from range start
            * division
        ) / division;
        // if quantized result exceeds the previous range, it falls on the beginning
        // of the next range instead
        if (quantizedBeat > rangeEndBeat) quantizedBeat = rangeEndBeat;
        // markers are unique in time, so one at a time
        if (!markers.find(quantizedBeat).valid) {
            setMarkers(markers.insert(quantizedBeat, {}));
        }
    }, [division, markers, music, setMarkers, time2Timers]);
    return <>
        <Tool code="player" keys={['c']}/>
        <KeyboardEventHandler handleKeys={['space']} onKeyEvent={onSpace}/>
        <KeyboardEventHandler handleKeys={['e']} onKeyEvent={onMarker}/>
    </>;
}

export default Player;
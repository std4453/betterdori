import React, { useCallback, useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import Control from './Control';
import Toolbar from './Toolbar';
import Carousel from './Carousel';
import Switch from './Switch';
import Button from './Button';

import select from '../assets/select.svg';
import single from '../assets/single.svg';
import slide1 from '../assets/slide-1.svg';
import slide2 from '../assets/slide-2.svg';
import flick from '../assets/flick.svg';
import timer from '../assets/timer.svg';
import player from '../assets/player.svg';
import pause from '../assets/pause.svg';
import play from '../assets/play.svg';
import x05 from '../assets/x05.svg';
import x10 from '../assets/x10.svg';
import x15 from '../assets/x15.svg';
import x20 from '../assets/x20.svg';
import followIcon from '../assets/follow.svg';
import bars from '../assets/bars.svg';
import d1 from '../assets/d1.svg';
import d2 from '../assets/d2.svg';
import d3 from '../assets/d3.svg';
import d4 from '../assets/d4.svg';
import d6 from '../assets/d6.svg';
import d8 from '../assets/d8.svg';

const useStyles = makeStyles({
    root: {
        position: 'relative',
        fontSize: 40,
    },
});

function Controls({ music, follow, setFollow, division, setDivision }) {
    const classes = useStyles();
    const [paused, setPausedRaw] = useState(music.paused);
    const setPaused = useCallback((paused) => {
        if (paused) music.pause();
        else music.play();
    }, [music]);
    useEffect(() => {
        const updatePaused = () => setPausedRaw(music.paused);
        music.addEventListener('play', updatePaused);
        music.addEventListener('pause', updatePaused);
        return () => {
            music.removeEventListener('play', updatePaused);
            music.removeEventListener('pause', updatePaused);
        };
    }, [music]);
    const [playbackRate, setPlaybackRateRaw] = useState(music.playbackRate);
    const setPlaybackRate = useCallback((playbackRate) => {
        music.playbackRate = playbackRate;
    }, [music]);
    useEffect(() => {
        const updatePlaybackRate = () => setPlaybackRateRaw(music.playbackRate);
        music.addEventListener('ratechange', updatePlaybackRate);
        return () => music.removeEventListener('ratechange', updatePlaybackRate);
    })
    const setD1 = useCallback(() => setDivision(1), [setDivision]);
    const setD2 = useCallback(() => setDivision(2), [setDivision]);
    const setD3 = useCallback(() => setDivision(3), [setDivision]);
    const setD4 = useCallback(() => setDivision(4), [setDivision]);
    const setD6 = useCallback(() => setDivision(6), [setDivision]);
    const setD8 = useCallback(() => setDivision(8), [setDivision]);
    return (
        <div className={classes.root}>
            <Toolbar>
                <Control alt="E" index={0} code="select" icon={select}/>
                <Control alt="F" index={2} code="placement/single" icon={single}/>
                <Control alt="S" index={3} code="placement/slide-a" icon={slide1}/>
                <Control alt="D" index={4} code="placement/slide-b" icon={slide2}/>
                <Control alt="W" index={5} code="modification/flick" icon={flick}/>
                <Control alt="A" index={6} code="timer" icon={timer}/>
                <Control index={7} code="bars" icon={bars}>
                    <Button alt="1" onClick={setD1} icon={d1}/>
                    <Button alt="2" onClick={setD2} icon={d2}/>
                    <Button alt="3" onClick={setD3} icon={d3}/>
                    <Button alt="4" onClick={setD4} icon={d4}/>
                    <Button alt="6" onClick={setD6} icon={d6}/>
                    <Button alt="8" onClick={setD8} icon={d8}/>
                </Control>
                <Control alt="R" index={8} code="player" icon={player}>
                    <Carousel
                        state={paused}
                        setState={setPaused}
                        states={[false, true]}
                        icons={[pause, play]}/>
                    <Carousel
                        state={playbackRate}
                        setState={setPlaybackRate}
                        states={[0.5, 1.0, 1.5, 2.0]}
                        icons={[x05, x10, x15, x20]}/>
                    <Switch
                        state={follow}
                        setState={setFollow}
                        icon={followIcon}/>
                </Control>
            </Toolbar>
        </div>
    );
}

export default Controls;

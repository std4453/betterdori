import React, { useCallback, useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import Control from './Control';
import Toolbar from './Toolbar';
import Carousel from './Carousel';
import Switch from './Switch';

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

const useStyles = makeStyles({
    root: {
        position: 'relative',
        fontSize: 40,
    },
});

function Controls({ music, settings: { follow, setFollow } }) {
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
    return (
        <div className={classes.root}>
            <Toolbar>
                <Control code="select" icon={select}/>
                <Control code="placement/single" icon={single}/>
                <Control code="placement/slide-a" icon={slide1}/>
                <Control code="placement/slide-b" icon={slide2}/>
                <Control code="flick" icon={flick}/>
                <Control code="timer" icon={timer}/>
                <Control code="player" icon={player}>
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

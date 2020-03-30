import React, { useCallback, useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import Control from './Control';
import Toolbar from './Toolbar';
import Carousel from './Carousel';
import Switch from './Switch';
import Button from './Button';
import { Dialog, useDialog, Sheet, Horizontal, Title, Input, Cancel, Submit } from './Dialog';

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
    bpm: {
        fontSize: '0.8em',
        lineHeight: 1,
        color: '#000',
        fontFamily: 'D-DIN',
        fontWeight: 'normal',
    },
});

function Controls({
    music, follow, setFollow, setDivision, code, setCode, currentBPM, setCurrentBPM,
}) {
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
    });
    const setD1 = useCallback(() => setDivision(1), [setDivision]);
    const setD2 = useCallback(() => setDivision(2), [setDivision]);
    const setD3 = useCallback(() => setDivision(3), [setDivision]);
    const setD4 = useCallback(() => setDivision(4), [setDivision]);
    const setD6 = useCallback(() => setDivision(6), [setDivision]);
    const setD8 = useCallback(() => setDivision(8), [setDivision]);
    const bpmDialog = useDialog();
    const openBPMDialog = useCallback(async () => {
        try {
            const { bpm } = await bpmDialog.open();
            setCurrentBPM(bpm);
        } catch (e) {
            // do nothing
        }
    }, [bpmDialog, setCurrentBPM]);
    return (
        <div className={classes.root}>
            <Toolbar>
                <Control code={code} setCode={setCode} alt="E" index={0} matchCode="select" icon={select}/>
                <Control code={code} setCode={setCode} alt="F" index={2} matchCode="placement/single" icon={single}/>
                <Control code={code} setCode={setCode} alt="S" index={3} matchCode="placement/slide-a" icon={slide1}/>
                <Control code={code} setCode={setCode} alt="D" index={4} matchCode="placement/slide-b" icon={slide2}/>
                <Control code={code} setCode={setCode} alt="W" index={5} matchCode="modification/flick" icon={flick}/>
                <Control code={code} setCode={setCode} alt="A" index={6} matchCode="timer" icon={timer}>
                    <Button onClick={openBPMDialog}>
                        <div className={classes.bpm}>{currentBPM}</div>
                    </Button>
                </Control>
                <Dialog dialog={bpmDialog}>
                    <Sheet>
                        <Horizontal>
                            <div>
                                <Title>节奏数值</Title>
                                <Input name="bpm" defaultValue={currentBPM}/>
                            </div>
                            <div>
                                <Cancel/>
                                <Submit/>
                            </div>
                        </Horizontal>
                    </Sheet>
                </Dialog>
                <Control code={code} setCode={setCode} index={7} matchCode="bars" icon={bars}>
                    <Button alt="1" onClick={setD1} icon={d1}/>
                    <Button alt="2" onClick={setD2} icon={d2}/>
                    <Button alt="3" onClick={setD3} icon={d3}/>
                    <Button alt="4" onClick={setD4} icon={d4}/>
                    <Button alt="6" onClick={setD6} icon={d6}/>
                    <Button alt="8" onClick={setD8} icon={d8}/>
                </Control>
                <Control code={code} setCode={setCode} alt="R" index={8} matchCode="player" icon={player}>
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

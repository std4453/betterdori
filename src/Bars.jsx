import React, { useMemo } from 'react';
import { makeStyles } from '@material-ui/styles';
import classNames from 'classnames';

const useStyles = makeStyles({
    root: {
        position: 'absolute',
        height: '100%',
        width: `${7 / 11 * 100}%`,
        left: `${2 / 11 * 100}%`,
        opacity: 0.4,
    },
    lanes: {
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    sideLane: {
        width: 0,
        borderRight: '5px solid #FFF',
    },
    middleLane: {
        width: 0,
        borderRight: '1px solid #FFF',
    },
    bar: {
        position: 'absolute',
        left: 0,
        width: '100%',
        borderBottom: '1px solid rgba(255, 255, 255, 0.4)',
    },
    major: {
        borderBottom: '1px solid #FFF',
    }
});

const generateBars = (notes, duration, division) => {
    let time = 0, lastBPM = 180, lastBeat = 0, bars = [];
    const addBars = (beat, bpm) => {
        const interval = 1 / division;
        for (let i = lastBeat; i < beat; i += interval) {
            bars.push({
                bpm: lastBPM, time, beat: i,
                major: ~~(i - lastBeat) === i - lastBeat, // is integer
            });
            time += 60 / lastBPM * interval;
        }
        lastBeat = beat;
        lastBPM = bpm;
    }
    for (const { type, cmd, beat, bpm } of notes) {
        if (type !== 'System' || cmd !== 'BPM') continue;
        addBars(beat, bpm);
    }
    addBars(lastBeat + (duration - time) / 60 * lastBPM, lastBPM);
    return bars;
}

function Bars({ notes, duration, division }) {
    const classes = useStyles();
    const bars = useMemo(
        () => generateBars(notes, duration, division),
        [notes, duration, division]);
    return (
        <div className={classes.root}>
            <div className={classes.lanes}>
                <div className={classes.sideLane}/>
                <div className={classes.middleLane}/>
                <div className={classes.middleLane}/>
                <div className={classes.middleLane}/>
                <div className={classes.middleLane}/>
                <div className={classes.middleLane}/>
                <div className={classes.middleLane}/>
                <div className={classes.sideLane}/>
            </div>
            {bars.map(({ time, major }) => (
                <div
                    key={time}
                    className={classNames(classes.bar, { [classes.major]: major })}
                    style={{ bottom: `${time / duration * 100}%` }}/>
            ))}
        </div>
    );
}

export default Bars;

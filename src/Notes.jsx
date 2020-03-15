import React, { useMemo } from 'react';
import { makeStyles } from '@material-ui/styles';
import classNames from 'classnames';
import Snake from './Snake';

const useStyles = makeStyles({
    root: {
        position: 'absolute',
        height: '100%',
        width: `${7 / 11 * 100}%`,
        left: `${2 / 11 * 100}%`,
    },
    note: {
        width: '1em',
        height: '1em',
        borderRadius: '50%',
        position: 'absolute',
        marginBottom: '-0.5em',
    },
    single: {
        backgroundColor: '#FFF',
    },
    slide: {
        backgroundColor: '#7ADEAE',
    },
    flick: {
        backgroundColor: '#FFA0E8',
        '&:after': {
            content: '\'\'',
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 0,
            height: 0,
            borderLeft: `${10 / 60}em solid transparent`,
            borderRight: `${10 / 60}em solid transparent`,
            borderBottom: `${16.739 / 60}em solid #FFF`,
            borderTop: 'none',
            marginLeft: `-${10 / 60}em`,
            marginTop: `-${16.739 / 60 / 2}em`,
        },
    },
    middle: {
        height: 0,
        borderRadius: 'unset',
        borderBottom: '3px solid #7ADEAE',
        marginBottom: -1.5,
    },
    tapLine: {
        position: 'absolute',
        marginLeft: '1em',
        marginRight: 0,
        height: 0,
        marginBottom: -1.5,
        borderBottom: '3px solid #FFF',
    },
});

function Notes({ time2Notes, music: { duration } }) {
    const classes = useStyles();
    const children = useMemo(() => {
        const res = [];

        ['A', 'B'].forEach((pos) => {
            let lastY = 0, lastLane = -1;
            time2Notes.forEach((time, { note, pos: notePos, lane, end }) => {
                if (note !== 'Slide' || pos !== notePos) return;
                if (lastLane !== -1) {
                    res.push(<Snake x0={lastLane} x1={lane} y0={lastY} y1={time / duration}/>);
                }
                lastLane = end ? -1 : lane;
                lastY = time / duration;
            });
        });

        for (let it = time2Notes.begin; it.hasNext;) {
            const { key: time } = it;
            let minLane = 8, maxLane = -1;
            do {
                const { lane, note: type, start, end } = it.value;
                // Synchronus tap line appears two notes possess the same beat,
                // but middle slide notes are not counted
                if (type !== 'Slide' || start || end) {
                    minLane = Math.min(minLane, lane);
                    maxLane = Math.max(maxLane, lane);
                }
                it.next();
            } while (it.key <= time && it.hasNext);

            if (minLane < maxLane - 1) { // at least two notes, distance >= 2, display sync tap line
                res.push(<div
                    className={classes.tapLine}
                    style={{
                        bottom: `${time / duration * 100}%`,
                        left: `${minLane / 7 * 100}%`,
                        right: `${(7 - maxLane) / 7 * 100}%`,
                    }}
                />)
            }
        }

        time2Notes.forEach((time, { lane, note: type, flick, start, end }) => {
            res.push(<div
                className={classNames(classes.note, {
                    [classes.single]: type === 'Single' && !flick,
                    [classes.slide]: type === 'Slide' && (start || end) && !flick,
                    [classes.flick]: flick,
                    [classes.middle]: type === 'Slide' && !(start || end),
                })}
                style={{
                    bottom: `${time / duration * 100}%`,
                    left: `${lane / 7 * 100}%`,
                }}
            />)
        });

        return res;
    }, [time2Notes, duration, classes]);
    return (
        <div className={classes.root}>
            {children}
        </div>
    );
}

export default Notes;

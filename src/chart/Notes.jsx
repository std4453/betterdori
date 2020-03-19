import { makeStyles } from '@material-ui/styles';
import classNames from 'classnames';
import React, { useCallback, useMemo } from 'react';
import focus from '../assets/focus.svg';

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
        '&$focusable:hover $focus': {
            visibility: 'initial',
        },
    },
    focusable: {
        cursor: 'pointer',
    },
    focus: {
        position: 'absolute',
        width: '1.4em',
        height: '1.4em',
        left: '-0.2em',
        top: '-0.2em',
        pointerEvents: 'none',
        visibility: 'hidden',
        userSelect: 'none',
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
        '&:after': {
            content: '\'\'',
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: '50%',
            borderBottom: '3px solid #7ADEAE',
            marginBottom: -1.5,
        },
    },
    tapLine: {
        position: 'absolute',
        marginLeft: '1em',
        marginRight: 0,
        height: 0,
        marginBottom: -1.5,
        borderBottom: '3px solid #FFF',
    },
    snake: {
        position: 'absolute',
        left: 0,
        right: 0,
        display: 'flex',
    },
});

function Note({ time, duration, lane, note: type, flick, start, end, code }) {
    const classes = useStyles();

    const single = type === 'Single';
    const slide = type === 'Slide';
    const full = start || end;
    const focusable = code.startsWith('placement/') || code.startsWith('modification/');

    return (
        <div
            className={classNames(classes.note, {
                [classes.single]: single && !flick,
                [classes.slide]: slide && full && !flick,
                [classes.flick]: flick,
                [classes.middle]: slide && !full,
                [classes.focusable]: focusable,
            })}
            style={{
                bottom: `${time / duration * 100}%`,
                left: `${lane / 7 * 100}%`,
            }}>
            <img
                className={classes.focus}
                alt="focus"
                src={focus}/>
        </div>
    );
}

function Snake({ x0, x1, y0, y1 }) {
    const classes = useStyles();
    return <div
        className={classes.snake}
        style={{
            bottom: `${y0 * 100}%`,
            top: `${(1 - y1) * 100}%`,
        }}>
        <svg width="100%" height="100%" viewBox="0 0 7 1" preserveAspectRatio="none">
            <polygon
                fill="rgba(122, 222, 174, 0.4)"
                strokeWidth="0"
                points={`${x0},1 ${x0 + 1},1 ${x1 + 1},0 ${x1},0`}/>
        </svg>
    </div>;
}

function Notes({
    time2Notes, music: { duration }, notes, setNotes,
    findNote, forEachNote, forEachGroup, code,
}) {
    const classes = useStyles();

    const snakes = useMemo(() => {
        const res = [];
        ['A', 'B'].forEach((pos) => {
            let lastY = 0, lastLane = -1;
            forEachNote((time, { lane, end }) => {
                if (lastLane !== -1) {
                    const y1 = time / duration;
                    res.push(<Snake
                        key={`snake-${lastY}-${y1}-${pos}`}
                        x0={lastLane} x1={lane}
                        y0={lastY} y1={y1}/>);
                }
                lastLane = end ? -1 : lane;
                lastY = time / duration;
            }, { pos, note: 'Slide' });
        });
        return res;
    }, [duration, forEachNote]);

    const tapLines = useMemo(() => {
        const res = [];
        forEachGroup((time, notes) => {
            let minLane = 8, maxLane = -1;
            for (const { lane, note: type, start, end } of notes) {
                // Synchronus tap line appears two notes possess the same beat,
                // but middle slide notes are not counted
                if (type !== 'Slide' || start || end) {
                    minLane = Math.min(minLane, lane);
                    maxLane = Math.max(maxLane, lane);
                }
            }
            if (minLane < maxLane - 1) { // at least two notes, distance >= 2, display sync tap line
                res.push(<div
                    key={`tap-line-${time}`}
                    className={classes.tapLine}
                    style={{
                        bottom: `${time / duration * 100}%`,
                        left: `${minLane / 7 * 100}%`,
                        right: `${(7 - maxLane) / 7 * 100}%`,
                    }}
                />)
            }
        });
        return res;
    }, [classes, duration, forEachGroup]);

    const noteEls = useMemo(() => {
        const res = [];
        time2Notes.forEach((time, note) => {
            res.push(<Note
                key={`note-${note.beat}-${note.lane}`}
                time={time}
                duration={duration}
                notes={notes}
                setNotes={setNotes}
                findNote={findNote}
                code={code}
                {...note}/>);
        });
        return res;
    }, [code, duration, findNote, notes, setNotes, time2Notes]);

    const children = useMemo(() => [...snakes, ...tapLines, ...noteEls], [snakes, tapLines, noteEls]);
    
    return (
        <div className={classes.root}>
            {children}
        </div>
    );
}

export default Notes;

import React, { useMemo } from 'react';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles({
    root: {
        position: 'absolute',
        height: '100%',
        left: `${2 / 11 * 100}%`,
        right: `${2 / 11 * 100}%`,
    },
    timer: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 0,
        borderBottom: '1px solid #FFCD18',
        marginBottom: -0.5,
    },
});

function Timer({ time,  duration }) {
    const classes = useStyles();
    return (
        <div
            className={classes.timer}
            style={{ bottom: `${time / duration * 100}%` }}>
        </div>
    );
}

function ThumbTimers({ time2Timers, music: { duration } }) {
    const classes = useStyles();

    const timerEls = useMemo(() => {
        const res = [];
        time2Timers.forEach((time, { beat }) => {
            res.push((
                <Timer key={beat} time={time} duration={duration}/>
            ));
        });
        return res;
    }, [time2Timers, duration]);

    return (
        <div className={classes.root}>
            {timerEls}
        </div>
    );
}

export default ThumbTimers;

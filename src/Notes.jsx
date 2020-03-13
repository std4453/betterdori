import React, { useMemo } from 'react';
import { makeStyles } from '@material-ui/styles';
import classNames from 'classnames';

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
});

function Notes({ compiled: { notes, music: { duration } } }) {
    const classes = useStyles();
    const children = useMemo(() => {
        const res = [];
        console.log(notes);
        for (const { time, lanes } of notes) {
            for (let lane = 0; lane < 7; ++lane) {
                if (typeof lanes[lane] === 'undefined') continue;
                const { note } = lanes[lane];
                // if (note !== 'Single') continue;
                res.push(<div
                    className={classNames(classes.note, classes.single)}
                    style={{
                        bottom: `${time / duration * 100}%`,
                        left: `${lane / 7 * 100}%`,
                    }}
                />)
            }
        }
        return res;
    }, [classes, notes, duration]);
    return (
        <div className={classes.root} style={{ fontSize: `${470 / 11}px`}}>
            {children}
        </div>
    );
}

export default Notes;

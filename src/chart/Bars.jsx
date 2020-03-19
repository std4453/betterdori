import React, { useMemo } from 'react';
import { makeStyles } from '@material-ui/styles';
import classNames from 'classnames';

const useStyles = makeStyles({
    root: {
        position: 'absolute',
        height: '100%',
        width: `${7 / 11 * 100}%`,
        left: `${2 / 11 * 100}%`,
        opacity: 0.5,
        '&$thumb': {
            opacity: 0.3,
        },
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
        marginRight: -2,
        marginLeft: -2,
    },
    middleLane: {
        width: 0,
        borderRight: '1px solid #FFF',
    },
    bar: {
        position: 'absolute',
        left: 0,
        width: '100%',
        borderBottom: '1px dashed rgba(255, 255, 255, 0.6)',
    },
    major: {
        borderBottom: '1px solid #FFF',
    },
    thumb: {},
});

function Bars({ music: { duration }, ranges, division, thumb = false }) {
    const classes = useStyles();
    const bars = useMemo(() => {
        const bars = [];
        for (const { beat1, beat2, bpm, time1 } of ranges) {
            for (let beat = beat1; beat < beat2; beat += 1 / division) {
                const deltaBeat = beat - beat1;
                const time = time1 + deltaBeat / bpm * 60;
                // use epsilon to avoid round off errors
                const major = Math.abs(Math.round(deltaBeat) - deltaBeat) < 1e-5;
                bars.push(<div
                    key={time}
                    className={classNames(classes.bar, { [classes.major]: major })}
                    style={{ bottom: `${time / duration * 100}%` }}
                />);
            }
        }
        return bars;
    }, [ranges, duration, division, classes]);
    return (
        <div className={classNames(classes.root, { [classes.thumb]: thumb })}>
            <div className={classes.lanes}>
                <div className={thumb ? classes.middleLane : classes.sideLane}/>
                <div className={classes.middleLane}/>
                <div className={classes.middleLane}/>
                <div className={classes.middleLane}/>
                <div className={classes.middleLane}/>
                <div className={classes.middleLane}/>
                <div className={classes.middleLane}/>
                <div className={thumb ? classes.middleLane : classes.sideLane}/>
            </div>
            {bars}
        </div>
    );
}

export default Bars;

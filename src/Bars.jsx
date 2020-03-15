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
        borderBottom: '1px solid rgba(255, 255, 255, 0.4)',
    },
    major: {
        borderBottom: '1px solid #FFF',
    },
});

function Bars({ compiled: { ranges, music: { duration } }, settings: { division } }) {
    const classes = useStyles();
    const bars = useMemo(() => {
        const bars = [];
        for (let i = 1; i < ranges.length; ++i) {
            const { beat: beat1, bpm, time: time1 } = ranges[i - 1];
            const { beat: beat2 } = ranges[i];
            for (let beat = beat1; beat < beat2; beat += 1 / division) {
                const time = time1 + (beat - beat1) / bpm * 60;
                const major = ~~(beat - beat1) === beat - beat1;
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
            {bars}
        </div>
    );
}

export default Bars;

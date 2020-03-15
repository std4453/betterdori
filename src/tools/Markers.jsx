import React, { useMemo } from 'react';
import { makeStyles } from '@material-ui/styles';
import marker from '../assets/marker.svg';

const useStyles = makeStyles({
    root: {
        position: 'absolute',
        height: '100%',
        left: `${9 / 11 * 100}%`,
        width: `${2 / 11 * 100}%`,
    },
    marker: {
        position: 'absolute',
        left: `${1 / 6}em`,
        height: '0.53em',
        marginBottom: `-${0.53 / 2}em`,
    },
});

function Markers({ time2Markers, music }) {
    const classes = useStyles();
    console.log(time2Markers);
    const markers = useMemo(() => {
        const res = [];
        time2Markers.forEach((time, { beat }) => {
            res.push((
                <img
                    key={beat}
                    className={classes.marker}
                    style={{ bottom: `${time / music.duration * 100}%` }}
                    src={marker}
                    alt="marker"/>
            ));
        });

        return res;
    }, [time2Markers, music, classes]);
    
    return (
        <div className={classes.root}>
            {markers}
        </div>
    );
}

export default Markers;

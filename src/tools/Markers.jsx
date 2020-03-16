import React, { useMemo, useCallback } from 'react';
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
        cursor: 'pointer',
        transition: 'transform 80ms cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
            transform: 'translateX(15%)',
        },
    },
});

function Markers({ time2Markers, markers, setMarkers, music }) {
    const classes = useStyles();
    const onContextMenu = useCallback((event) => {
        const beat = event.target.getAttribute('data-beat');
        setMarkers(markers.remove(beat));
    }, [markers, setMarkers]);
    const onClick = useCallback((event) => {
        const time = event.target.getAttribute('data-time');
        music.currentTime = time;
        event.preventDefault();
        event.stopPropagation();
    }, [music]);
    const markerEls = useMemo(() => {
        const res = [];
        time2Markers.forEach((time, { beat }) => {
            res.push((
                <img
                    key={beat}
                    className={classes.marker}
                    style={{ bottom: `${time / music.duration * 100}%` }}
                    src={marker}
                    alt="marker"
                    data-beat={beat}
                    data-time={time}
                    onContextMenu={onContextMenu}
                    onClick={onClick}/>
            ));
        });
        return res;
    }, [time2Markers, classes, music, onContextMenu, onClick]);
    
    return (
        <div className={classes.root}>
            {markerEls}
        </div>
    );
}

export default Markers;

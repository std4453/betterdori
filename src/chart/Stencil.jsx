import React, { useCallback, useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import useFrame from '../tools/useFrame';

const useStyles = makeStyles({
    stencil: {
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        pointerEvents: 'none',
        willChange: 'transform',
    },
});

function Stencil({ music: { duration }, scaleRef, scrollRef }) {
    const classes = useStyles();

    const [upperEl, setUpperEl] = useState(null);
    const [lowerEl, setLowerEl] = useState(null);
    const updateStencil = useCallback(() => {
        const height = duration * scaleRef.current;
        // const height = innerEl.getBoundingClientRect().height;
        const top = scrollRef.current / height;
        const bottom = (scrollRef.current + window.innerHeight) / height;
        // const top = containerEl.scrollTop / height;
        // const bottom = (containerEl.scrollTop + window.innerHeight) / height;
        if (upperEl) {
            upperEl.style.transform = `translateY(
                ${-(1 - top) * 100}%
            )`;
        }
        if (lowerEl) {
            lowerEl.style.transform = `translateY(
                ${bottom * 100}%
            )`;
        }
    }, [duration, scaleRef, scrollRef, upperEl, lowerEl]);
    useFrame(updateStencil);
    
    return <>
        <div ref={setUpperEl} className={classes.stencil}/>
        <div ref={setLowerEl} className={classes.stencil}/>
    </>;
}

export default Stencil;

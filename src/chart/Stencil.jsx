import React, { useCallback, useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import useFrame from '../tools/useFrame';

const useStyles = makeStyles({
    stencil: {
        position: 'absolute',
        left: 0,
        width: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
    },
});

function Stencil({ innerEl, containerEl }) {
    const classes = useStyles();

    const [upperEl, setUpperEl] = useState(null);
    const [lowerEl, setLowerEl] = useState(null);
    const updateStencil = useCallback(() => {
        if (!innerEl) return;
        const height = innerEl.getBoundingClientRect().height;
        const top = containerEl.scrollTop / height;
        const bottom = (containerEl.scrollTop + window.innerHeight) / height;
        if (upperEl) upperEl.style.bottom = `${(1 - top) * 100}%`;
        if (lowerEl) lowerEl.style.top = `${bottom * 100}%`;
    }, [innerEl, containerEl, upperEl, lowerEl]);
    useFrame(updateStencil);
    
    return <>
        <div ref={setUpperEl} className={classes.stencil} style={{ top: 0 }}/>
        <div ref={setLowerEl} className={classes.stencil} style={{ bottom: 0 }}/>
    </>;
}

export default Stencil;

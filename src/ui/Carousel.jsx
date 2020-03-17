import React, { useCallback } from 'react';
import Button from './Button';

function Carousel({ state, setState, states, icons }) {
    const ind = states.indexOf(state);
    const onClick = useCallback(() => {
        const next = states[(ind + 1) % states.length];
        setState(next);
    }, [ind, setState, states]);
    return (
        <Button onClick={onClick} selected={false} icon={icons[ind]}/>
    );
}

export default Carousel;

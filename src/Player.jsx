import React, { useCallback, useEffect } from 'react';

function Player({ song: { music } }) {
    const onKeyPress = useCallback((event) => {
        const { code } = event;
        switch (code) {
            case 'Space': {
                if (music.paused) music.play();
                else music.pause();
                event.stopPropagation();
                event.preventDefault();
                break;
            }
            default:
        }
    }, [music]);
    useEffect(() => {
        window.addEventListener('keypress', onKeyPress);
        return () => window.removeEventListener('keypress', onKeyPress);
    }, [onKeyPress]);
    return <div/>;
}

export default Player;
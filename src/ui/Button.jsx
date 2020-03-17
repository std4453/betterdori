import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import classNames from 'classnames';

const useStyles = makeStyles({
    root: {
        width: '2em',
        height: '2em',
        cursor: 'pointer',
        userSelect: 'none',
        position: 'relative',
        '&:after': {
            content: '\'\'',
            position: 'absolute',
            pointerEvents: 'none',
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            border: '0px solid black',
        },
        '&:hover:after': {
            borderWidth: 5,
        },
    },
    selected: {
        backgroundColor: 'rgba(0, 0, 0, 0.06)',
    },
    icon: {
        pointerEvents: 'none',
    },
    alt: {
        position: 'absolute',
        left: '100%',
        top: `${100 / 3}%`,
        height: `${100 / 3}%`,
        width: `${100 / 3}%`,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000',
        color: '#FFF',
        fontFamily: 'DIN',
        fontWeight: 'normal',
        fontSize: '0.6em',
        '& div': {
            marginBottom: 2,
        }
    },
});

function Button({ selected, onClick, alt, icon, ...props }) {
    const classes = useStyles(props);
    const [ctrl, setCtrl] = useState(false);
    useEffect(() => {
        const onKeyDown = (e) => { if (e.key === 'Control') setCtrl(true); };
        const onKeyUp = (e) => { if (e.key === 'Control') setCtrl(false); };
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);
        return () => {
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
        };
    }, []);
    return (
        <div
            className={classNames(classes.root, { [classes.selected]: selected })}
            onClick={onClick}>
            <img src={icon} alt="" className={classes.icon}/>
            {ctrl && alt && <div className={classes.alt}>
                <div>{alt}</div>
            </div>}
        </div>
    );
}

export default Button;

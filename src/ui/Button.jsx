import React from 'react';
import { makeStyles } from '@material-ui/styles';
import classNames from 'classnames';

const useStyles = makeStyles({
    root: {
        width: '2em',
        height: '2em',
        cursor: 'pointer',
        '&:hover $icon': {
            transform: 'scale(1.1)',
        },
        userSelect: 'none',
    },
    selected: {
        backgroundColor: 'rgba(0, 0, 0, 0.06)',
    },
    icon: {
        pointerEvents: 'none',
        transition: 'transform 70ms ease-in-out',
    },
});

function Button({ selected, onClick, icon, ...props }) {
    const classes = useStyles(props);
    return (
        <div
            className={classNames(classes.root, { [classes.selected]: selected })}
            onClick={onClick}>
            <img src={icon} alt="" className={classes.icon}/>
        </div>
    );
}

export default Button;

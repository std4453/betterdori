import React, { useCallback } from 'react';
import { makeStyles } from '@material-ui/styles';
import classNames from 'classnames';
import Button from './Button';

const useStyles = makeStyles({
    nonactive: {
        opacity: 0.35,
    },
});

function Switch({ state, setState, icon }) {
    const classes = useStyles();
    const onClick = useCallback(() => setState(state => !state), [setState]);
    return (
        <Button
            onClick={onClick}
            selected={false}
            icon={icon}
            classes={{ root: classNames({ [classes.nonactive]: !state }) }}/>
    );
}

export default Switch;

import React, { useCallback, Children } from 'react';
import Button from './Button';
import { makeStyles } from '@material-ui/styles';
import Toolbar from './Toolbar';

const useStyles = makeStyles({
    root: {
        position: 'relative',
    },
    container: {
        position: 'absolute',
        left: '100%',
        top: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.06)',
    },
});

function Control({ code, setCode, matchCode, children, index, ...rest }) {
    const classes = useStyles();
    const onClick = useCallback(() => setCode(matchCode), [matchCode, setCode]);
    const selected = code === matchCode;
    const childrenCount = Children.count(children);
    const margin = Math.min(childrenCount - 1, index);
    return (
        <div className={classes.root}>
            <Button onClick={onClick} selected={selected} {...rest}/>
            {selected && <div className={classes.container} style={{ top: `${-2 * margin}em` }}>
                <Toolbar>
                    {children}
                </Toolbar>
            </div>}
        </div>
    );
}

export default Control;

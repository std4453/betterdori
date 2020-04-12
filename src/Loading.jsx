import React from 'react';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles({
    middle: {
        position: 'absolute',
        left: '25%',
        top: 0,
        height: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: 470,
        fontSize: 28,
        fontWeight: 'bold',
        backgroundColor: '#000',
        color: '#FFF',
    },
    right: {
        position: 'absolute',
        right: 0,
        height: '100%',
        top: 0,
        width: '11em',
        fontSize: `${78 / 11}px`,
        backgroundColor: '#000',
    },
});

function Loading({ children }) {
    const classes = useStyles();
    return <>
        <div className={classes.middle}>
            {children}
        </div>
        <div className={classes.right}/>
    </>;
};

export default Loading;

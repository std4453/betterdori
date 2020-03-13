import React from 'react';
import { makeStyles } from '@material-ui/styles';
import Editor from './Editor';

const useStyles = makeStyles({
  root: {
    width: '100%',
    height: '100%',
  },
  left: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  middle: {
    position: 'absolute',
    left: '25%',
    top: 0,
    height: '100%',
  },
  right: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
});

function App() {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <div className={classes.left}>

      </div>
      <div className={classes.middle}>
        <Editor/>
      </div>
      <div className={classes.right}>

      </div>
    </div>
  );
}

export default App;

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
});

function App() {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <div className={classes.left}>

      </div>
      <Editor/>
    </div>
  );
}

export default App;

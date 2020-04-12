import React, { useState, useMemo } from 'react';
import { makeStyles } from '@material-ui/styles';
import test_music from './assets/test_music.mp3';
import Editor from './Editor';
import Menus from './ui/Menus';
import { load } from './chart/storage';

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
  const initialScore = useMemo(() => load(), []);
  const [score, setScore] = useState(initialScore);
  const musicURL = test_music;
  const params = { score, setScore, musicURL };
  return (
    <div className={classes.root}>
      <div className={classes.left}>
        <Menus {...params}/>
      </div>
      <Editor {...params}/>
    </div>
  );
}

export default App;

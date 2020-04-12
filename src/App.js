import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { makeStyles } from '@material-ui/styles';

import Menus from './ui/Menus';
import { load } from './chart/storage';
import useEvent from './tools/useEvent';
import Chart from './chart/Chart';
import Loading from './Loading';

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

  const [musicURL, setMusicURL] = useState(localStorage.getItem('music'));
  useEffect(() => {
    if (musicURL) localStorage.setItem('music', musicURL);
  }, [musicURL]);

  const music = useMemo(() => new Audio(), []);
  useEffect(() => {
    music.src = musicURL;
    music.load();
  }, [music, musicURL]);
  const [musicLoaded, setMusicLoaded] = useState(false);
  const onDurationChange = useCallback(() => setMusicLoaded(music.duration > 0), [music]);
  useEvent(music, 'durationchange', onDurationChange);
  const onEmptied = useCallback(() => setMusicLoaded(false), []);
  useEvent(music, 'emptied', onEmptied);

  const params = { score, setScore, musicURL, setMusicURL, music, musicLoaded };

  return (
    <div className={classes.root}>
      <div className={classes.left}>
        <Menus {...params}/>
      </div>
      {musicLoaded ? (
        <Chart {...params}/>
      ) : (
        <Loading>
          {musicURL === null ? '请先选择歌曲' : '加载中，请稍候'}
        </Loading>
      )}
    </div>
  );
}

export default App;

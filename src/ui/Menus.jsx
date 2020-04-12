import React, { useCallback } from 'react';
import { makeStyles } from '@material-ui/styles';
import Toolbar from './Toolbar';
import Button from './Button';
import { emptyScore } from '../chart/storage';
import { Dialog, useDialog, Sheet, Horizontal, Input, Title, Text, Cancel, Submit } from './Dialog';

import settings from '../assets/settings.svg';
import hamburger from '../assets/hamburger.svg';
import deleteIcon from '../assets/delete.svg';
import album from '../assets/album.svg';
import exportIcon from '../assets/export.svg';
import importIcon from '../assets/import.svg';

const useStyles = makeStyles({
    root: {
        position: 'relative',
        fontSize: 40,
    },
    bpm: {
        fontSize: '0.8em',
        lineHeight: 1,
        color: '#000',
        fontFamily: 'D-DIN',
        fontWeight: 'normal',
    },
    url: {
        width: `${560 / 34}em`,
        marginRight: `${80 / 34}em`,
    },
});

function Menus({ setScore, musicURL, setMusicURL }) {
    const classes = useStyles();
    const deleteDialog = useDialog();
    const openDeleteDialog = useCallback(async () => {
        try {
            await deleteDialog.open();
            // score state in App.js saves the initial score, which
            // resets the chart every time its *reference* changes.
            // here, we set score to a copy of the emptyScore object,
            // otherwise the second reset will not be effective
            setScore([...emptyScore]);
        } catch (e) {
            // do nothing
        }
    }, [deleteDialog, setScore]);
    const musicURLDialog = useDialog();
    const openMusicURLDialog = useCallback(async () => {
        try {
            const { url } = await musicURLDialog.open();
            setMusicURL(url);
        } catch (e) {
            // do nothing
        }
    }, [musicURLDialog, setMusicURL]);
    return (
        <div className={classes.root}>
            <Toolbar>
                <Button icon={hamburger}/>
                <Button icon={deleteIcon} onClick={openDeleteDialog}/>
                <Dialog dialog={deleteDialog}>
                    <Sheet>
                        <Horizontal>
                            <div>
                                <Title>删除谱面</Title>
                                <Text>确认删除谱面？此操作无法恢复。</Text>
                            </div>
                            <div>
                                <Cancel/>
                                <Submit/>
                            </div>
                        </Horizontal>
                    </Sheet>
                </Dialog>
                <Button icon={album} onClick={openMusicURLDialog}/>
                <Dialog dialog={musicURLDialog}>
                    <Sheet>
                        <Horizontal>
                            <div>
                                <Title>音频地址</Title>
                                <Input name="url" defaultValue={musicURL} classes={{ input: classes.url }}/>
                            </div>
                            <div>
                                <Cancel/>
                                <Submit/>
                            </div>
                        </Horizontal>
                    </Sheet>
                </Dialog>
                <Button icon={exportIcon}/>
                <Button icon={importIcon}/>
                <Button icon={settings}/>
            </Toolbar>
        </div>
    );
}

export default Menus;

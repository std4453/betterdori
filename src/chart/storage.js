import { useEffect, useMemo } from "react";

const emptyScore = [{
    type: 'System',
    cmd: 'BPM',
    beat: 0,
    bpm: 120,
}];

const load = () => {
    const item = localStorage.getItem('score');
    if (item === null) return emptyScore;
    else return JSON.parse(item);
};

const save = (data) => {
    localStorage.setItem('score', JSON.stringify(data));
};

const createSubmit = () => {
    let timers = null, notes = null;
    const convert = (timers, notes) => {
        const score = [];
        timers.forEach((beat, { bpm }) => {
            score.push({
                type: 'System',
                cmd: 'BPM',
                beat,
                bpm,
            });
        });
        notes.forEach((beat, { lane, ...note }) => {
            score.push({
                type: 'Note',
                beat,
                ...note,
                lane: lane + 1, // bestdori uses lanes starting from 1
            });
        });
        score.sort(({ beat: b1 }, { beat: b2 }) => b1 - b2);
        return score;
    };
    const submit = (newTimers, newNotes) => {
        timers = newTimers;
        notes = newNotes;
        setTimeout(() => {
            // check if we're the newest version, if not, return,
            // since another newer version is on the way.
            if (timers !== newTimers || notes !== newNotes) return; 
            save(convert(newTimers, newNotes));
            console.log('Score saved!');
        }, 5000); // saver after 5 seconds of inactivity
    };
    const saveImmediately = () => {
        save(convert(timers, notes));
    };
    return { submit, save: saveImmediately };
}

const useAutoSave = ({ timers, notes }) => {
    const { submit, save } = useMemo(createSubmit, []); // does not change
    useEffect(() => {
        window.addEventListener('beforeunload', save);
        return () => window.removeEventListener('beforeunload', save);
    }, [save]);
    useEffect(() => {
        submit(timers, notes);
    }, [notes, submit, timers]);
};

export { emptyScore, load, save, useAutoSave };

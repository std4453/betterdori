const createSong = (music, importNotes = []) => {
    const res = { ranges: [], notes: [], music };
    const { ranges, notes } = res;

    // collect ranges
    for (const { type, cmd, beat, bpm } of importNotes) {
        if (type !== 'System' || cmd !== 'BPM') continue;
        ranges.push({ beat, bpm });
    }

    // notes, assume last group has a beat lequal to the current note
    for (const { type, note, lane, beat, pos, end, flick = false } of importNotes) {
        if (type !== 'Note') continue;
        if (notes.length === 0 || notes[notes.length - 1].beat !== beat) {
            notes.push({ beat, lanes: new Array(7) });
        }
        const group = notes[notes.length - 1];
        // end and pos are slide-only
        group[lane] = { note, flick, pos, end };
    }

    return res;
};

const compileSong = ({ ranges, notes, music }) => {
    const res = { ranges: [], notes: [], music };
    if (ranges.length === 0) return res;
    let lastTime = 0, lastBeat = 0, lastBPM = ranges[0].bpm, index = 0;

    for (let rangeInd = 1; rangeInd < ranges.length; ++rangeInd) {
        res.ranges.push({ beat: lastBeat, bpm: lastBPM, time: lastTime });
        let { beat, bpm } = ranges[rangeInd];
        for (; index < notes.length && notes[index].beat < beat; ++index) {
            res.notes.push({
                beat: lastTime + (notes[index].beat - lastBeat) / lastBPM * 60,
                range: rangeInd - 1,
                lanes: notes[index].lanes,
            });
        }
        lastTime += (beat - lastBeat) / lastBPM * 60;
        lastBPM = bpm;
        lastBeat = beat;
    }
    res.ranges.push({ beat: lastBeat, bpm: lastBPM, time: lastTime });
    // add last range
    res.ranges.push({
        beat: lastBeat + (music.duration - lastTime) / 60 * lastBPM,
        bpm: lastBPM,
        time: music.duration,
    });

    for (; index < notes.length; ++index) {
        res.notes.push({
            beat: lastTime + (notes[index].beat - lastBeat) / lastBPM * 60,
            range: ranges.length - 1,
            lanes: notes[index].lanes,
        });
    }

    return res;
};

export { createSong, compileSong };

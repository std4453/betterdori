const quantize = (time, time2Timers, division) => {
    const { key: rangeStartTime, value: { bpm, beat: rangeStartBeat } } = time2Timers.le(time);
    const { value: { beat: rangeEndBeat } } = time2Timers.gt(time);
    let quantizedBeat = rangeStartBeat + Math.round(
        (time - rangeStartTime) / 60 * bpm * division
    ) / division;
    // if quantized result exceeds the previous range, it falls on the beginning
    // of the next range instead
    if (quantizedBeat > rangeEndBeat) quantizedBeat = rangeEndBeat;
    const quantizedTime = rangeStartTime + (quantizedBeat - rangeStartBeat) / bpm * 60;
    return { beat: quantizedBeat, time: quantizedTime};
};

export { quantize };

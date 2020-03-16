import select from '../assets/select.svg';
import single from '../assets/single.svg';
import slide1 from '../assets/slide-1.svg';
import slide2 from '../assets/slide-2.svg';
import flick from '../assets/flick.svg';
import timer from '../assets/timer.svg';
import player from '../assets/player.svg';

const buttons = [
    { code: 'select', keys: ['r'], icon: select },
    { code: 'placement/single', keys: ['f'], icon: single },
    { code: 'placement/slide-a', keys: ['s'], icon: slide1 },
    { code: 'placement/slide-b', keys: ['d'], icon: slide2 },
    { code: 'flick', keys: ['w'], icon: flick },
    { code: 'timer', keys: ['a'], icon: timer },
    { code: 'player', keys: ['r'], icon: player },
];

export { buttons };

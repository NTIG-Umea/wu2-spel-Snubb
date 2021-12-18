// importera alla scener
import PlayScene from './play-scene';
import PreloadScene from './preload-scene';
import MenuScene from './menu-scene';
import StartScene from './startmenu';
import TestScene from './testing';
import TestLongScene from './longtest';
import TutorialScene from './tutorial';
import CaveScene from './level2';
import GameOVerScene from './gameover';

// spelets config
const config = {
    type: Phaser.AUTO,
    width: 900,
    height: 550,
    pixelArt: true,
    transparent: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 400 },
            debug: true
        }
    },
    scene: [PreloadScene, PlayScene, MenuScene, StartScene, TestScene, TestLongScene, TutorialScene, CaveScene, GameOVerScene],
    parent: 'game'
};

// initiera spelet
new Phaser.Game(config);

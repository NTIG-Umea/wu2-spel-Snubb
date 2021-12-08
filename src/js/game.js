// importera alla scener
import PlayScene from './play-scene';
import PreloadScene from './preload-scene';
import MenuScene from './menu-scene';
import StartScene from './startmenu';
import TestScene from './testing';
import TestLongScene from './longtest';
import TutorialScene from './tutorial';

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
            debug: false
        }
    },
    scene: [PreloadScene, PlayScene, MenuScene, StartScene, TestScene, TestLongScene, TutorialScene],
    parent: 'game'
};

// initiera spelet
new Phaser.Game(config);

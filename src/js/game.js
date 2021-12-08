// importera alla scener
import PlayScene from './play-scene';
import PreloadScene from './preload-scene';
import MenuScene from './menu-scene';
import StartScene from './startmenu';
import TestScene from './testing';
import TestLongScene from './longtest';

// spelets config
const config = {
    type: Phaser.AUTO,
    width: 2000,
    height: 600,
    pixelArt: true,
    transparent: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 400 },
            debug: true
        }
    },
    scene: [PreloadScene, PlayScene, MenuScene, StartScene, TestScene, TestLongScene],
    parent: 'game'
};

// initiera spelet
new Phaser.Game(config);

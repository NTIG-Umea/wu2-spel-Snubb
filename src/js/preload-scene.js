class PreloadScene extends Phaser.Scene {
    constructor() {
        super('PreloadScene');
    }

    preload() {
        // säg åt phaser att lägga till /assets i alla paths
        this.load.setBaseURL('/assets');
        this.load.audio('bing', '/sounds/bing.mp3');
        this.load.audio('oof', '/sounds/oof.mp3');
        this.load.audio('vineBoom', '/sounds/VineBoom.mp3');
        this.load.image('background', '/images/background.png');
        this.load.image('spike', '/images/spike.png');
        this.load.image('snowball', './images/snowball.png');
        this.load.image('rock', './images/rock.png');
        this.load.image('white', './images/white.png');
        this.load.image('gate', '/images/fencegate.png');
        this.load.image('empty', '/images/empty.png');
        this.load.image('snowParticle', '/images/snowflake.png');
        this.load.image('jens', '/images/jens.png');
        this.load.atlas(
            'player',
            '/images/jefrens_hero.png',
            '/images/jefrens_hero.json'
        );
        this.load.atlas(
            'foe',
            '/images/jefrens_foe.png',
            '/images/jefrens_foe.json'
        );
        this.load.image('tiles', '/tilesets/jefrens_tilesheet.png');
        // här laddar vi in en tilemap med spelets "karta"
        this.load.tilemapTiledJSON('map', '/tilemaps/level1.json');
        this.load.tilemapTiledJSON('long_map', '/tilemaps/looong_looong_maaaaaaaan.json');
        this.load.tilemapTiledJSON('tutorial_map', '/tilemaps/snow_tutorial_level.json');
        this.load.tilemapTiledJSON('cave_map', '/tilemaps/level2.json');
    }

    create() {
        this.scene.start('StartScene');
    }
}

export default PreloadScene;
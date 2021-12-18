class GameOVerScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
    }

    create() {
        this.keyObR = this.input.keyboard.addKey('R', true, false);
        this.text = this.add.text(0, (this.game.config.height / 2) - 64, 'GAME OVER \n Press R to restart', {
            fontFamily: '"Mochiy Pop P One"',
            fontSize: '64px',
            fill: '#ff0000',
            align: 'center',
            fixedWidth: this.game.config.width,
            fixedHeight: this.game.config.height,
        });

        this.text.setDepth(100);
    }

    // scenens uppdate metod, lyssnar på keyDown
    update() {
        if (this.keyObR.isDown) {
            // resumera spelscenen
            this.scene.launch('CaveScene');
            // göm denna scen
            this.scene.setVisible(false);
            this.scene.pause();
        }
    }
}

export default GameOVerScene;

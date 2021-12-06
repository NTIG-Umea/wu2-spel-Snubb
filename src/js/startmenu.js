import TestScene from "./testing";
import TestLongScene from "./longtest";

var testTrigger = false;
var lvl1trigger = false;
var lvl2trigger = false;

class PreloadScene extends Phaser.Scene {
    constructor() {
        super('StartScene');
    }

    create() {
    

        
        this.text = this.add.text(0, (this.game.config.height / 2) - 64, 'Welcome Traveler', {
            fontFamily: '"Mochiy Pop P One"',
            fontSize: '64px',
            fill: '#ff0000',
            align: 'center',
            fixedWidth: this.game.config.width,
            fixedHeight: this.game.config.height,
        });

        var lvl1 = this.add.sprite(this.game.config.width / 2, (this.game.config.height / 2) + 64, 'spike').setInteractive();
        var lvl2 = this.add.sprite(this.game.config.width / 2, (this.game.config.height / 2) + 128, 'player').setInteractive();

        lvl1.on('pointerdown', function(pointer){
            lvl1trigger = true;
        });
        lvl2.on('pointerdown', function(pointer){
            lvl2trigger = true;
        });
    }

    // scenens uppdate metod, lyssnar på keyDown
    update() {
        //setVisible och launch fungerar enbart i update tror jag så därför använder jag trigger variablerna
        if(lvl1trigger) {
            lvl1trigger = false;
            this.scene.setVisible(false);
            this.scene.launch('TestScene')
        }
        if(lvl2trigger) {
            lvl2trigger = false;
            this.scene.setVisible(false);
            this.scene.launch('TestLongScene');
        }
    }
}

export default PreloadScene;

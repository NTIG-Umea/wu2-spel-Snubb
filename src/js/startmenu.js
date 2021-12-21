var testTrigger = false;
var lvl1trigger = false;
var lvl2trigger = false;
var lvl3trigger = false;
var leaderBoard = [];

class PreloadScene extends Phaser.Scene {
    constructor() {
        super('StartScene');
    }

    create() {
        if(JSON.parse(localStorage.getItem('localLeaderBoard') != null)) {
            leaderBoard = JSON.parse(localStorage.getItem('localLeaderBoard'));
        }
        for(let i = 0; i < 5; i++) {
            leaderBoard.push(999999);
        }
        leaderBoard.sort(function(a, b){a - b});
        leaderBoard.length = 5;
        this.updateLeaderBoard(leaderBoard);
    

        this.background = this.add.image(0, 0, 'newBackground').setOrigin(0).setScale(1, 1.7);    
        this.text = this.add.text(0, (this.game.config.height / 2) - 64, 'Take your revenge', {
            fontFamily: '"Mochiy Pop P One"',
            fontSize: '64px',
            fill: '#ff0000',
            align: 'center',
            fixedWidth: this.game.config.width,
            fixedHeight: this.game.config.height,
        });
        this.startText = this.add.text(0, (this.game.config.height / 2) + 32, 'Start', {
            fontFamily: '"Mochiy Pop P One"',
            fontSize: '32px',
            fill: '#ff0000',
            align: 'center',
            fixedWidth: this.game.config.width,
            fixedHeight: this.game.config.height,
        });
        this.startText.setInteractive();

        this.startText.on('pointerdown', function(pointer){
            lvl1trigger = true;
        })

        /*var lvl1 = this.add.sprite(this.game.config.width / 2, (this.game.config.height / 2) + 64, 'empty').setInteractive();
        var lvl2 = this.add.sprite(this.game.config.width / 2, (this.game.config.height / 2) + 128, 'player').setInteractive();
        var lvl3 = this.add.sprite(this.game.config.width / 2, (this.game.config.height / 2) + 192, 'spike').setInteractive();*/

        /*lvl1.on('pointerdown', function(pointer){
            lvl1trigger = true;
        });
        lvl2.on('pointerdown', function(pointer){
            lvl2trigger = true;
        });
        lvl3.on('pointerdown', function(pointer){
            lvl3trigger = true;
        });*/
    }

    // scenens uppdate metod, lyssnar på keyDown
    update() {
        //setVisible och launch fungerar enbart i update tror jag så därför använder jag trigger variablerna
        if(lvl1trigger) {
            lvl1trigger = false;
            this.scene.setVisible(false);
            this.scene.pause();
            this.scene.launch('TutorialScene')
        }
        if(lvl2trigger) {
            lvl2trigger = false;
            this.scene.pause();
            this.scene.setVisible(false);
            this.scene.launch('TestLongScene');
        }

        if(lvl3trigger) {
            lvl2trigger = false;
            this.scene.pause();
            this.scene.setVisible(false);
            this.scene.launch('CaveScene');
        }
    }
    updateLeaderBoard(array) {
        try{
            document.querySelector('#first').textContent = `1: ${array[0]}`;
            document.querySelector('#second').textContent = `2: ${array[1]}`;
            document.querySelector('#third').textContent = `3: ${array[2]}`;
            document.querySelector('#fourth').textContent = `4: ${array[3]}`;
            document.querySelector('#fifth').textContent = `5: ${array[4]}`;
        } catch { }
    }
}

export default PreloadScene;

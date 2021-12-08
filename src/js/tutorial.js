var newAngle = 0;

class TutorialScene extends Phaser.Scene {
    constructor() {
        super('TutorialScene');
    }

    create() {
        this.cameras.main.setSize(900, 600);
        this.cameras.main.setBounds(0,0, 3000, 600);

        this.physics.world.setBounds( 0, 0, 2500, 600 );


        //#region Key Listeners
        this.keyObjE = this.input.keyboard.addKey('E'); //For throwing snowballs
        this.keyObjQ = this.input.keyboard.addKey('Q'); // första ability
        this.keyObjW = this.input.keyboard.addKey('W');
        this.keyObjA = this.input.keyboard.addKey('A');
        this.keyObjS = this.input.keyboard.addKey('S');
        this.keyObjD = this.input.keyboard.addKey('D');
        this.keyObjZ = this.input.keyboard.addKey('Z');
        //#endregion

        //#region Variebellåda
        
        this.shootCooldown = 0; // cooldown for boss shooting
        //#endregion
        
        //#region Bilder och tilemap
        // skapa en tilemap från JSON filen vi preloadade
        const map = this.make.tilemap({ key: 'tutorial_map', tileWidth: 32, tileHeight: 32 });
        // ladda in tilesetbilden till vår tilemap
        const tileset = map.addTilesetImage('32_tileset', 'tiles');

        // initiera animationer, detta är flyttat till en egen metod
        // för att göra create metoden mindre rörig
        this.initAnims();

        this.background = map.createLayer('Background', tileset);

        this.gate = this.physics.add.group({
            allowGravity: false
        });
        this.firstGate = this.gate.create(1310, 450, 'gate').setScale(0.13, 0.5).setImmovable();

        this.gateButton = this.physics.add.sprite(1280, 350, ':)', {
            pressed: false
        });
        this.gateButton.setDataEnabled();
        this.gateButton.setImmovable();
        this.gateButton.body.setAllowGravity(false);

        // Ladda lagret Platforms från tilemappen
        // och skapa dessa
        // sätt collisionen
        this.platforms = map.createLayer('Platforms', tileset);
        this.platforms.setCollisionByExclusion(-1, true);

        
        //#endregion

        // keyboard cursors
        this.cursors = this.input.keyboard.createCursorKeys();

        // skapa en spelare och ge den studs
        this.player = this.physics.add.sprite(50, 300, 'player');
        this.player.setBounce(0);
        this.player.setCollideWorldBounds(true);

        // krocka med platforms lagret
        this.physics.add.collider(this.player, this.platforms);

        // exempel för att lyssna på events
        this.events.on('pause', function () {
            console.log('Play scene paused');
        });
        this.events.on('resume', function () {
            console.log('Play scene resumed');
        });
        //#region Physics groups
        //#region Snowballs
        this.snowballs = this.physics.add.group({
            time: 240
        });
        this.physics.add.collider(this.snowballs, this.platforms);
        this.ballCooldown = 0;

        //#endregion

        this.physics.add.collider(this.gate, this.player);

        this.physics.add.overlap(this.gateButton, this.snowballs, pressButton, null, this);
        function pressButton(button, ball) {
            if(!button.data.values.pressed) {
                button.data.values.pressed = true;
                button.x += 20;
            }
        }

        //#endregion
    }

    // play scenens update metod
    update() {

        if(this.gateButton.data.values.pressed) {
            console.log("PRESSED")
            if(this.firstGate != null) {
                this.firstGate.destroy();
            }
        }

        this.cameras.main.startFollow(this.player);
           
        //#region Throw snowball
        if(this.ballCooldown > 0) {
            this.ballCooldown--;
        }
        if(this.keyObjE.isDown && this.ballCooldown == 0) {
            this.ballCooldown = 10;
            var ball = this.snowballs.create(this.player.x + 15, this.player.y - 15, 'snowball').setScale(0.03);
            // mousePointer följer inte med när skärmen scrollar, därför måste man
            // även addera kamerans scroll.
            var angle = Math.atan2((this.game.input.mousePointer.y - ball.y), ((this.game.input.mousePointer.x + this.cameras.main.scrollX) - ball.x));
            ball.setGravityY(400);
            ball.setTint(0xffff00);
            ball.setDataEnabled();
            ball.setData({time: 240});
            ball.setBounce(1);
            ball.setCollideWorldBounds(true);
            ball.setVelocityY(Math.sin(angle)*1000);
            ball.setVelocityX(Math.cos(angle)*1000);
        }

        this.snowballs.children.iterate(function(child) {
            if(child != null) {
                if(child.getData('time') == 0) {
                    child.destroy();
                } else {
                    child.data.values.time -= 1;
                }
            }
        });
        //#endregion

        //#region Movement
        // följande kod är från det tutorial ni gjort tidigare
        // Control the player with left or right keys
        if (this.cursors.left.isDown || this.keyObjA.isDown) {
            this.player.setVelocityX(-200);
            if (this.player.body.onFloor()) {
                this.player.play('walk', true);
            }
        } else if (this.cursors.right.isDown || this.keyObjD.isDown) {
            this.player.setVelocityX(200);
            if (this.player.body.onFloor()) {
                this.player.play('walk', true);
            }
        } else {
            // If no keys are pressed, the player keeps still
            this.player.setVelocityX(0);
            // Only show the idle animation if the player is footed
            // If this is not included, the player would look idle while jumping
            if (this.player.body.onFloor()) {
                this.player.play('idle', true);
            }
        }

        // Player can jump while walking any direction by pressing the space bar
        // or the 'UP' arrow
        if (
            (this.cursors.space.isDown || this.cursors.up.isDown || this.keyObjW.isDown) &&
            this.player.body.onFloor()
        ) {
            this.player.setVelocityY(-350);
            this.player.play('jump', true);
        }

        if (this.player.body.velocity.x > 0) {
            this.player.setFlipX(false);
        } else if (this.player.body.velocity.x < 0) {
            // otherwise, make them face the other side
            this.player.setFlipX(true);
        }
    
    //#endregion

    }
        
       
    // metoden updateText för att uppdatera overlaytexten i spelet
    updateText() {
        this.text.setText(
            `Arrow keys to move. Space to jump. W to pause. Spiked: ${this.spiked}`
        );
    }

    // när vi skapar scenen så körs initAnims för att ladda spelarens animationer
    initAnims() {
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNames('player', {
                prefix: 'jefrens_',
                start: 1,
                end: 4
            }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'idle',
            frames: [{ key: 'player', frame: 'jefrens_2' }],
            frameRate: 10
        });

        this.anims.create({
            key: 'jump',
            frames: [{ key: 'player', frame: 'jefrens_5' }],
            frameRate: 10
        });
    }
}

export default TutorialScene;

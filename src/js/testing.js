class TestScene extends Phaser.Scene {
    constructor() {
        super('TestScene');
    }

    create() {

        // Key Listeners
        this.keyObjE = this.input.keyboard.addKey('E'); //For throwing snowballs

        //#region Variebellåda
        // variabel för att hålla koll på hur många gånger vi spikat oss själva
        this.spiked = 0;

        this.freezing = 1000; // hur lång tid innan man fryser.

        this.chocolateTimer = 500; //spawns chocolate every x frames
        //#endregion
        // ladda spelets bakgrundsbild, statisk
        // setOrigin behöver användas för att den ska ritas från top left
        this.add.image(0, 0, 'background').setOrigin(0, 0);

        // skapa en tilemap från JSON filen vi preloadade
        const map = this.make.tilemap({ key: 'map' });
        // ladda in tilesetbilden till vår tilemap
        const tileset = map.addTilesetImage('jefrens_platformer', 'tiles');

        // initiera animationer, detta är flyttat till en egen metod
        // för att göra create metoden mindre rörig
        this.initAnims();

        // keyboard cursors
        this.cursors = this.input.keyboard.createCursorKeys();

        // Ladda lagret Platforms från tilemappen
        // och skapa dessa
        // sätt collisionen
        this.platforms = map.createLayer('Platforms', tileset);
        this.platforms.setCollisionByExclusion(-1, true);
        // platforms.setCollisionByProperty({ collides: true });
        // this.platforms.setCollisionFromCollisionGroup(
        //     true,
        //     true,
        //     this.platforms
        // );
        // platforms.setCollision(1, true, true);


        // skapa en spelare och ge den studs
        this.player = this.physics.add.sprite(50, 300, 'player');
        this.player.setBounce(0);
        this.player.setCollideWorldBounds(true);

        // Tomtegubben
        this.foe = this.physics.add.sprite(400, 40, 'foe');
        this.foe.body.setAllowGravity(false);

        // skapa en fysik-grupp
        this.spikes = this.physics.add.group({
            allowGravity: false,
            immovable: true
        });

        // från platforms som skapats från tilemappen
        // kan vi ladda in andra lager
        // i tilemappen finns det ett lager Spikes
        // som innehåller spikarnas position
        console.log(this.platforms);
        map.getObjectLayer('Spikes').objects.forEach((spike) => {
            // iterera över spikarna, skapa spelobjekt
            const spikeSprite = this.spikes
                .create(spike.x, spike.y - spike.height, 'spike')
                .setOrigin(0);
            spikeSprite.body
                .setSize(spike.width, spike.height - 20)
                .setOffset(0, 20);
        });
        // lägg till en collider mellan spelare och spik
        // om en kollision sker, kör callback metoden playerHit
        this.physics.add.collider(
            this.player,
            this.spikes,
            this.playerHit,
            null,
            this
        );

        // krocka med platforms lagret
        this.physics.add.collider(this.player, this.platforms);

        // skapa text på spelet, texten är tom
        // textens innehåll sätts med updateText() metoden
        this.text = this.add.text(16, 16, '', {
            fontSize: '20px',
            fill: '#ffffff'
        });
        this.text.setScrollFactor(0);
        this.updateText();

        // lägg till en keyboard input för W
        this.keyObj = this.input.keyboard.addKey('W', true, false);

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

        this.physics.add.overlap(this.snowballs, this.foe, hurtFoe, null, this);
        function hurtFoe(foe, ball) {
            var vineBoom = this.sound.add('vineBoom').play();
            ball.destroy();
            foe.setTint(0xff4d5e);
            this.time.addEvent({
                delay: 30,
                callback: ()=>{
                    foe.clearTint();
                }
            });
        }
        //#endregion
        //#region Chocolate
        this.chocolate = this.physics.add.group({

        });
        this.physics.add.collider(this.chocolate, this.platforms);
        this.physics.add.overlap(this.chocolate, this.player, collectChoc, null, this);

        function collectChoc(player, chocolate) {
            chocolate.disableBody(true, true);
            this.freezing = 1000;
        }
        //#endregion
        //#endregion
    
        
    }

    // play scenens update metod
    update() {
        


        //#region Chocolate Spawner
        if(this.chocolateTimer <= 0) {
            this.chocolateTimer = 500;
            console.log("Spawned chocolate");
            var chocolatee = this.chocolate.create(Phaser.Math.FloatBetween(0, 896), 0, 'snowball').setScale(0.03);
            chocolatee.setGravityY(800);
        } else {
            this.chocolateTimer--;
        }
        //#endregion
        
        //#region freezing mechanic
        if(this.freezing > 0) {
            this.freezing--;   
        }
        if(this.freezing < 1000 && this.freezing > 800) {
            this.player.setTint(0x96e9ff);
        } else if(this.freezing < 800 && this.freezing > 600) {
            this.player.setTint(0x6ae0ff);
        } else if(this.freezing < 600 && this.freezing > 400) {
            this.player.setTint(0x36d6ff);
        } else if(this.freezing < 400 && this.freezing > 200) {
            this.player.setTint(0x00cbff);
        } else if(this.freezing < 200 && this.freezing > 0) {
            this.player.setTint(0x00a5d0);
        } else {
            this.player.setTint(0x000000);
        }
        //#endregion
           
        //#region Throw snowball
        if(this.ballCooldown > 0) {
            this.ballCooldown--;
        }
        if(this.keyObjE.isDown && this.ballCooldown == 0) {
            this.ballCooldown = 10;
            var ball = this.snowballs.create(this.player.x + 15, this.player.y - 15, 'snowball').setScale(0.03);
            var angle = Math.atan2((this.game.input.mousePointer.y - ball.y), (this.game.input.mousePointer.x - ball.x));
            ball.setGravityY(800);
            ball.setTint(0xffff00);
            ball.setDataEnabled();
            ball.setData({time: 240})
            ball.setBounce(1);
            ball.setCollideWorldBounds(true);
            ball.setVelocityY(Math.sin(angle)*1200);
            ball.setVelocityX(Math.cos(angle)*1200);
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
        
        //#region Pause
        // för pause
        if (this.keyObj.isDown) {
            // pausa nuvarande scen
            this.scene.pause();
            // starta menyscenene
            this.scene.launch('MenuScene');
        }
        //#endregion

        //#region Movement
        // följande kod är från det tutorial ni gjort tidigare
        // Control the player with left or right keys
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-200);
            if (this.player.body.onFloor()) {
                this.player.play('walk', true);
            }
        } else if (this.cursors.right.isDown) {
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
            (this.cursors.space.isDown || this.cursors.up.isDown) &&
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
   
        //#region tomeAI
        
        if(this.foe.body.x > this.player.body.x + 60 && this.foe.body.velocity.x > - 150) {
            this.foe.setVelocityX(this.foe.body.velocity.x - 4)
        } else if(this.foe.body.x > this.player.body.x && this.foe.body.velocity.x > - 50){
            this.foe.setVelocityX(this.foe.body.velocity.x - 2)
        } else {
            this.foe.setVelocityX(this.foe.body.velocity.x + 4)
        }
        
        if(this.foe.body.x < this.player.body.x - 60 && this.foe.body.velocity.x < 150) {
            this.foe.setVelocityX(this.foe.body.velocity.x + 4)
        } else if(this.foe.body.x < this.player.body.x && this.foe.body.velocity.x < 50){
            this.foe.setVelocityX(this.foe.body.velocity.x + 2)
        } else {
            this.foe.setVelocityX(this.foe.body.velocity.x - 4)
        }
        
        //#endregion

    }
        
       
    // metoden updateText för att uppdatera overlaytexten i spelet
    updateText() {
        this.text.setText(
            `Arrow keys to move. Space to jump. W to pause. Spiked: ${this.spiked}`
        );
    }

    
    // när spelaren landar på en spik, då körs följande metod
    playerHit(player, spike) {
        this.spiked++;
        player.setVelocity(0, 0);
        player.setX(50);
        player.setY(300);
        player.play('idle', true);
        let tw = this.tweens.add({
            targets: player,
            alpha: { start: 0, to: 1 },
            tint: { start: 0xff0000, to: 0xffffff },
            duration: 100,
            ease: 'Linear',
            repeat: 5
        });
        this.updateText();
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

export default TestScene;

class TestLongScene extends Phaser.Scene {
    constructor() {
        super('TestLongScene');
    }

    create() {
        this.cameras.main.setSize(900, 600);
        this.cameras.main.setBounds(0,0, 3000, 600);



        // Key Listeners
        this.keyObjE = this.input.keyboard.addKey('E'); //For throwing snowballs
        this.keyObjQ = this.input.keyboard.addKey('Q'); // första ability

        //#region Variebellåda
        // variabel för att hålla koll på hur många gånger vi spikat oss själva
        this.spiked = 0;

        this.freezing = 1000; // hur lång tid innan man fryser.

        this.chocolateTimer = 500; //spawns chocolate every x frames

        this.shootCooldown = 0; // cooldown for boss shooting

        this.bigCooldown = 100;

        this.foeHP = 1000;

        this.foeEnraged = false;
        //#endregion
        // ladda spelets bakgrundsbild, statisk
        // setOrigin behöver användas för att den ska ritas från top left
        this.add.image(0, 0, 'background').setOrigin(0, 0);

        // skapa en tilemap från JSON filen vi preloadade
        const map = this.make.tilemap({ key: 'long_map', tileWidth: 32, tileHeight: 32 });
        // ladda in tilesetbilden till vår tilemap
        const tileset = map.addTilesetImage('32_tileset', 'tiles');

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
        /*map.getObjectLayer('Spikes').objects.forEach((spike) => {
            // iterera över spikarna, skapa spelobjekt
            const spikeSprite = this.spikes
                .create(spike.x, spike.y - spike.height, 'spike')
                .setOrigin(0);
            spikeSprite.body
                .setSize(spike.width, spike.height - 20)
                .setOffset(0, 20);
        });*/
        // lägg till en collider mellan spelare och spik
        // om en kollision sker, kör callback metoden playerHit
        /*this.physics.add.collider(
            this.player,
            //this.spikes,
            this.playerHit,
            null,
            this
        );*/

        //this.rock = this.physics.add.sprite(-100, -100, 'rock');
        //this.rock.body.setAllowGravity(false);

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

        this.theRock = this.physics.add.group();
        this.physics.add.overlap(this.snowballs, this.foe, hurtFoe, null, this);
        function hurtFoe(foe, ball) {
            
            this.foeHP -= 10;
            var vineBoom = this.sound.add('vineBoom').play();
            //this.rock = this.physics.add.sprite(foe.x + foe.width/2, foe.y + foe.height/2, 'rock');
            var rock = this.theRock.create(foe.x, foe.y , 'rock');
            rock.setScale(0.5);
            rock.body.setAllowGravity(false);
            rock.alpha = 1;
            
            
            ball.destroy();
            foe.setTint(0xff4d5e);
            this.time.addEvent({
                delay: 30,
                callback: ()=>{
                    if(!this.foeEnraged) {

                        foe.clearTint();
                     } else {
                         foe.setTint(0x00FF00);
                     }
                }
            });
        }

        this.bigBalls = this.physics.add.group();

        this.physics.add.overlap(this.bigBalls, this.foe, hurtFoeBig, null, this);
        function hurtFoeBig(foe, bigBall) {
            this.foeHP -= 50;
            //var vineBoom = this.sound.add('vineBoom').setRate(1).play();
            bigBall.destroy();
            foe.setTint(0xff4d5e);
            this.time.addEvent({
                delay: 30,
                callback: ()=>{
                    if(!this.foeEnraged) {
                       foe.clearTint();
                    } else {
                        foe.setTint(0x00FF00);
                    }
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
        //#region enemySnowBalls
        this.enemySnowBall = this.physics.add.group();
        this.physics.add.overlap(this.enemySnowBall, this.player, hurt, null, this);
        function hurt(player, ball) {
            var oof = this.sound.add('oof', {
                volume: 1,
                seek: 1
            });

            //oof.play();
            ball.destroy();
            player.setTint(0xFF0000);
        }
        //#endregion
        
        //#endregion
        this.white = this.add.image(0, 0, 'white').setOrigin(0, 0);
        this.white.alpha = 0;
    }

    // play scenens update metod
    update() {
        this.theRock.children.iterate(function (child){
            child.alpha -= 0.05;
        });

        this.cameras.main.startFollow(this.player);

        console.log(this.cameras.main.scrollX);


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
            //this.white.alpha = 0.2;
        } else if(this.freezing < 800 && this.freezing > 600) {
            this.player.setTint(0x6ae0ff);
            //this.white.alpha = 0.4;
        } else if(this.freezing < 600 && this.freezing > 400) {
            this.player.setTint(0x36d6ff);
            //this.white.alpha = 0.6;
        } else if(this.freezing < 400 && this.freezing > 200) {
            this.player.setTint(0x00cbff);
            //this.white.alpha = 0.8;
        } else if(this.freezing < 200 && this.freezing > 0) {
            this.player.setTint(0x00a5d0);
            //this.white.alpha = 0.9;
        } else {
            this.player.setTint(0x000000);
            //this.white.alpha = 1;
        }
        //#endregion
           
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
        if(this.bigCooldown > 0) {
            this.bigCooldown--;
        }

        if(this.keyObjQ.isDown && this.bigCooldown == 0) {
            this.bigCooldown = 100;
            var bigBall = this.bigBalls.create(this.player.body.x, this.player.body.y, 'snowball').setScale(0.01);
            bigBall.body.setAllowGravity(false);
            
            
        }
        var foeX = this.foe.body.x + this.foe.width/2;
        var foeY = this.foe.body.y + this.foe.height/2;
        var playerX = this.player.body.x + this.player.width/2;
        var playerY = this.player.body.y + this.player.height/2;
        this.bigBalls.children.iterate(function(child) {
            if(child.scale > 0.1) {   
                var foeAngle = Math.atan2((foeY - child.y), (foeX - child.x));             
                child.setVelocityY(Math.sin(foeAngle)*500);
                child.setVelocityX(Math.cos(foeAngle)*500);

            } else {
                child.setScale(child.scale + 0.001);
                child.x = playerX;
                child.y = playerY;
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
   
        //#region tomteAI
        if(this.foeHP <= 500 && !this.foeEnraged) {
            this.foeEnraged = true;
            this.foe.setTint(0x00FF00);
            var bing = this.sound.add('bing');
            bing.play();
        }

        if(this.shootCooldown > 0) {
            this.shootCooldown--;
        }
        
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

        if(this.foe.body.x - this.player.body.x < 60 && this.shootCooldown == 0) {
            this.shootCooldown = 60;
            var enemyBullet = this.enemySnowBall.create(this.foe.body.x + this.foe.width/2, this.foe.body.y + this.foe.height/2, 'snowball').setScale(0.02);
            enemyBullet.setTint(0xFF0000);
            enemyBullet.setVelocityY(50);
                
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

export default TestLongScene;

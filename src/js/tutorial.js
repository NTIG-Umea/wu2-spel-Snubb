//#region En massa variabler och funktioner här utanför så att phaser blir glad
//Utan detta klagar den på massa ställen att saker inte är defined
var doors;
var doorFlag;
var enemies;
var dis;
var Faser;
var snowCrashEmitter;
var playerr;
var cleared = false;

function destroyBall(ball) {
    if(ball != null) {
        ball.data.values.emitter.on = false;
        let w = -10;
        if(ball.x - playerr.x > 0) {
            w = 16;
        }
        snowCrashEmitter.emitParticle(10, ball.x + w, ball.y);

        //Genom att delaya en frame så kraschar inte programmet när man träffar flera fiender.
        dis.time.addEvent({
            delay: 1,
            callback: ()=>{
                ball.destroy();
            }
        });
    }
}
//#endregion

class TutorialScene extends Phaser.Scene {
    constructor() {
        super('TutorialScene');
    }

    create() {
        //några onödiga variabler så jag kan använda dom i functions; phaser moment
        dis = this;
        Faser = Phaser;

        this.cameras.main.setSize(900, 600);
        this.cameras.main.setBounds(0,0, 2528, 600);

        this.physics.world.setBounds( 0, 0, 2500, 600 );

        enemies = this.physics.add.group({
            hp: 100
        })

        this.snowParticle = this.add.particles('snowParticle');


        //#region Key Listeners
        this.keyObjE = this.input.keyboard.addKey('E'); //For throwing snowballs
        this.keyObjQ = this.input.keyboard.addKey('Q'); // första ability
        this.keyObjW = this.input.keyboard.addKey('W');
        this.keyObjA = this.input.keyboard.addKey('A');
        this.keyObjS = this.input.keyboard.addKey('S');
        this.keyObjD = this.input.keyboard.addKey('D');
        this.keyObjZ = this.input.keyboard.addKey('Z');
        this.keyObjESC = this.input.keyboard.addKey('ESC');
        //#endregion

        //#region Variebellåda
        
        this.shootCooldown = 0; // cooldown for boss shooting
        //#endregion
        
        //#region Bilder och tilemap
        // skapa en tilemap från JSON filen vi preloadade
        const map = this.make.tilemap({ key: 'tutorial_map', tileWidth: 32, tileHeight: 32 });
        // ladda in tilesetbilden till vår tilemap
        const tileset = map.addTilesetImage('tileset_32', 'tiles2');

        // initiera animationer, detta är flyttat till en egen metod
        // för att göra create metoden mindre rörig
        //this.initAnims();
        this.initNewAnims();
        this.initSnowManAnims();

        this.background = map.createLayer('Background', tileset).setDepth(-100);
        this.imageBackground = this.add.image(0, 0, 'newBackground').setOrigin(0).setScale(1.6, 1.65).setScrollFactor(0.3).setDepth(-102);

        this.gate = this.physics.add.group({
            allowGravity: false
        });
        

        this.gateButton = this.physics.add.sprite(1280, 350, ':)', {
            pressed: false
        });
        this.gateButton.setDataEnabled();
        this.gateButton.setImmovable();
        this.gateButton.body.setAllowGravity(false);

        doors = this.physics.add.group({
            allowGravity: false,
            immovable: true,
            open: false
        });
        map.getObjectLayer('Doors').objects.forEach((door) => {
            // iterera över spikarna, skapa spelobjekt
            const doorSprite = doors
                .create(door.x, door.y, 'gate')
                .setOrigin(0)
                .setScale(0.10, 0.40) //Detta behövs inte om jag har en sprite som är rätt storlek
                .setDataEnabled();
        });

        // Ladda lagret Platforms från tilemappen
        // och skapa dessa
        // sätt collisionen
        this.platforms = map.createLayer('Platforms', tileset);
        this.platforms.setCollisionByExclusion(-1, true);

        this.snowPlatforms = map.createLayer('Snow', tileset);

        doorFlag = this.physics.add.group({
            allowGravity: false,
            immovable: true
        });
        map.getObjectLayer('DoorCloseFlag').objects.forEach((flag) => {
            // iterera över spikarna, skapa spelobjekt
            const newFlag = doorFlag
                .create(flag.x, flag.y, 'empty')
                .setOrigin(0);
            doorFlag.body
                //.setSize(flag.width, flag.height);
        });
        
        //#endregion

        // keyboard cursors
        this.cursors = this.input.keyboard.createCursorKeys();

        // skapa en spelare och ge den studs
        this.player = this.physics.add.sprite(50, 300, 'newPlayer');
        this.player.setBounce(0);
        this.player.setCollideWorldBounds(true);
        this.player.setDataEnabled();
        this.player.setData({
            hp: 100,
            immunity: false
        })
        playerr = this.player;

        // krocka med platforms lagret
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.player, doors);

        // exempel för att lyssna på events
        this.events.on('pause', function () {
            console.log('Play scene paused');
            dis.scene.launch('MenuScene');
        });
        this.events.on('resume', function () {
            console.log('Play scene resumed');
        });
        //#region Physics groups
        //#region Snowballs
        this.snowballs = this.physics.add.group({
            time: 240,
            emitter: null
        });
        this.physics.add.collider(this.snowballs, this.platforms);
        this.physics.add.overlap(this.snowballs, enemies, hurtEnemy, null, this)
        function hurtEnemy(ball, enemy) {
            destroyBall(ball);
            enemy.setTint(0xFF0000);
            this.time.addEvent({
                delay: 60,
                callback: ()=>{
                    enemy.setTint(0xFFFFFF);
                }
            });
            enemy.data.values.hp -= 10;
            if(enemy.data.values.hp <= 0) {
                enemy.destroy();
            }
            if(enemies.countActive(true) == 0) {
                pressButton(this.gateButton);
            }
        }
        this.physics.add.overlap(enemies, this.player, hurt, null, this);
        function hurt(player, koopa){
            if(!player.data.values.immunity) {
                player.data.values.immunity = true
                this.time.addEvent({
                    delay: 240,
                    callback: ()=>{
                        player.data.values.immunity = false;
                    }
                })
                player.data.values.hp -= 5;
                
            }
            if(player.data.values.hp <= 0) {
                player.data.values.hp = 0;
                dis.time.addEvent({
                    delay: 60,
                    callback: ()=>{
                        dis.scene.pause();
                        dis.scene.launch('GameOverScene1');
                    }
                })
            }
            player.setTint(0xFF0000);
            this.time.addEvent({
                delay: 60,
                callback: ()=>{
                    player.setTint(0xFFFFFF);
                }
            });
            this.updateText();
        }


        this.ballCooldown = 0;

        //#endregion

        //#region Door shenanigans
        this.physics.add.collider(doors, this.snowballs);

        var fade = this.tweens;
        this.physics.add.overlap(this.gateButton, this.snowballs, pressButton, null, this);
        function pressButton(button, ball) {
            if(!button.data.values.pressed) {
                button.data.values.pressed = true;
                button.x += 20;
                
                doors.children.iterate(function(child){
                    child.data.values.open = true;
                    let tw2 = fade.add({
                        targets: child,
                        y: child.y - 150,
                        duration: 500,
                        ease: 'Linear'
                    });
                })
            }
        }
        var tempButton = this.gateButton;
        this.physics.add.overlap(doorFlag, this.player, closeDoors, spawnEnemies, null, this);
        function closeDoors(player, doorFlag){
            doorFlag.destroy();
            doors.children.iterate(function(child){
                if(child.data.values.open) {
                    let tw = fade.add({
                        targets: child,
                        y: child.y + 150,
                        duration: 100,
                        ease: 'Linear'
                    })
                    child.data.values.open = false;
                }
            })
            tempButton.data.values.pressed = false;
        }
        //#endregion

        //#region enemies in door woo

        function spawnEnemies() {
            map.getObjectLayer('EnemySpawn').objects.forEach((enemy) => {
                // iterera över spikarna, skapa spelobjekt
                const newEnemy = enemies
                    .create(enemy.x, enemy.y, 'snowman')
                    .setOrigin(0)
                    .setDataEnabled()
                    .setData({hp: 100});
                
                newEnemy.setCircle(newEnemy.width/2);
            });
        }
        this.physics.add.collider(enemies, this.platforms);

        //#endregion

        //#endregion


        snowCrashEmitter = this.snowParticle.createEmitter({
            speed: {min: 10, max: 25},
            accelerationY: 200,
            on: false,
            lifespan: { min: 500, max: 1000 },
        })

        this.text = this.add.text(16, 16, '', {
            fontSize: '20px',
            fill: '#ffffff'
        });
        this.text.setScrollFactor(0);
        
        this.hpBarBack = this.add.rectangle(16, 16, 200, this.text.height, 0x000000);
        this.hpBarBack.setOrigin(0, 0);
        this.hpBarBack.setScrollFactor(0);

        this.hpBar = this.add.rectangle(16, 16, 200, this.text.height, 0x00FF00);
        this.hpBar.setOrigin(0);
        this.hpBar.setScrollFactor(0);
        
        this.updateText();
    }

    // play scenens update metod
    update() {
        this.cameras.main.startFollow(this.player);
           
        //#region Throw snowball
        if(this.keyObjE.isDown && this.ballCooldown == 0) {
            this.ballCooldown = 2;
            this.time.addEvent({
                delay: 200,
                callback: ()=>{
                    this.ballCooldown = 0;
                }
            })
            var ball = this.snowballs.create(this.player.x + 15, this.player.y - 15, 'snowball');
            // mousePointer följer inte med när skärmen scrollar, därför måste man
            // även addera kamerans scroll.
            var angle = Math.atan2((this.game.input.mousePointer.y - ball.y), ((this.game.input.mousePointer.x + this.cameras.main.scrollX) - ball.x));
            ball.setGravityY(400);
            ball.setDataEnabled();
            ball.setData({time: 240});
            ball.setBounce(0);
            ball.setCollideWorldBounds(true);
            ball.setVelocityY(Math.sin(angle)*1000);
            ball.setVelocityX(Math.cos(angle)*1000);
            ball.setCircle(ball.body.width/2);

            var snowParticle = dis.add.particles('snowParticle');
            ball.data.values.emitter = snowParticle.createEmitter({
                speed: 50,
                gravity: {x: 0, y: 400},
                lifespan: 200,
                x: ball.x + ball.width/2,
                y: ball.y + ball.height/2,
                quantity: 1
            })
            ball.data.values.emitter.startFollow(ball);
        }

        this.snowballs.children.iterate(function(child) {
            if(child != null) {
                if(child.getData('time') == 0 || child.body.velocity.x == 0 || child.body.velocity.y == 0) {
                    destroyBall(child);
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
            this.player.setVelocityX(-400);
            if (this.player.body.onFloor()) {
                this.player.play('walk', true);
            }
        } else if (this.cursors.right.isDown || this.keyObjD.isDown) {
            this.player.setVelocityX(400);
            if (this.player.body.onFloor()) {
                this.player.play('walk', true);
            }
        } else {
            // If no keys are pressed, the player keeps still
            this.player.setVelocityX(0);
            // Only show the idle animation if the player is footed
            // If this is not included, the player would look idle while jumping
            if (this.player.body.onFloor()) {
                //this.player.play('idle', true);
            }
        }

        // Player can jump while walking any direction by pressing the space bar
        // or the 'UP' arrow
        if (
            (this.cursors.space.isDown || this.cursors.up.isDown || this.keyObjW.isDown) &&
            this.player.body.onFloor()
        ) {
            this.player.setVelocityY(-450);
            this.player.play('jump', true);
        }

        if (this.player.body.velocity.x > 0) {
            this.player.setFlipX(false);
        } else if (this.player.body.velocity.x < 0) {
            // otherwise, make them face the other side
            this.player.setFlipX(true);
        }
    
    //#endregion

        enemies.children.iterate(function(child){
            child.play('snowWalk', true);
            if (child.body.velocity.x > 0) {
                child.setFlipX(false);
            } else if (child.body.velocity.x < 0) {
                // otherwise, make them face the other side
                child.setFlipX(true);
            }
            if(child.x - playerr.x + playerr.width > 0) {
                child.body.velocity.x = -50
            } else {
                child.body.velocity.x = 50;
            }
        });

        //#region pause

        if (this.keyObjESC.isDown) {
            // pausa nuvarande scen
            this.scene.pause();
            // starta menyscenene
            this.scene.launch('MenuScene');
        }

        //#endregion

        if(this.player.x > 2300 && !cleared) {
            cleared = true;
            /*this.text = this.add.text(playerr.x - 400, (this.game.config.height / 2) - 64, 'Congratulations \n you can play a bideo game', {
                fontFamily: '"Mochiy Pop P One"',
                fontSize: '32px',
                fill: '#ff0000',
                //align: 'center',
            });*/
            this.scene.pause();
            this.scene.setVisible(false);
            this.scene.launch('CaveScene');
            
        }
    }

    

    moveFirstGate() {
        let tw = this.tweens.add({
            targets: this.firstGate,
            y: this.firstGate.y - 100,
            duration: 500,
            ease: 'Linear',
            repeat: 1
        });
    }
        
       
    // metoden updateText för att uppdatera overlaytexten i spelet
    updateText() {
        this.text.setText(
            `HP: ${this.player.data.values.hp}`
        );
        this.hpBar.width = 2*this.player.data.values.hp;
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
    initNewAnims() {
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNames('newPlayer'),
            frameRate: 16
        })
    }
    initSnowManAnims(){
        this.anims.create({
            key: 'snowWalk',
            frames: this.anims.generateFrameNames('snowman'),
            frameRate: 16
        })
    }
}

export default TutorialScene;

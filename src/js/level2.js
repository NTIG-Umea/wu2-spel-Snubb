//#region En massa variabler och funktioner här utanför så att phaser blir glad

import { lineBreak } from "acorn";

//Utan detta klagar den på massa ställen att saker inte är defined
var dis;
var Faser;
var snowCrashEmitter;
var playerr;
var cleared = false;
var bossFlag;
var bossDoor;

function destroyBall(ball) {
    if(ball != null) {
        ball.data.values.emitter.on = false;
        let w = -10;
        if(ball.x - playerr.x > 0) {
            w = 16;
            console.log(w);
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

class CaveScene extends Phaser.Scene {
    constructor() {
        super('CaveScene');
    }

    create() {
        //några onödiga variabler så jag kan använda dom i functions; phaser moment
        dis = this;
        Faser = Phaser;

        this.cameras.main.setSize(900, 600);
        this.cameras.main.setBounds(0,0, 3000, 10000);
        this.cameras.main.setZoom(0.9);

        this.physics.world.setBounds( 0, 0, 2500, 10000 );

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
        const map = this.make.tilemap({ key: 'cave_map', tileWidth: 32, tileHeight: 32 });
        // ladda in tilesetbilden till vår tilemap
        const tileset = map.addTilesetImage('jefrens_tilesheet', 'tiles');

        // initiera animationer, detta är flyttat till en egen metod
        // för att göra create metoden mindre rörig
        this.initAnims();

        this.background = map.createLayer('Background', tileset).setDepth(-100);
        
        
        bossFlag = this.physics.add.group({
            allowGravity: false,
            immovable: true
        });
        map.getObjectLayer('BossFlag').objects.forEach((flag) => {
            // iterera över spikarna, skapa spelobjekt
            const newFlag = bossFlag
                .create(flag.x, flag.y, 'empty')
                .setOrigin(0);
            newFlag.body
                .setSize(flag.width, flag.height)
                .setOffset(0, 20);
        });
        
        
        // Ladda lagret Platforms från tilemappen
        // och skapa dessa
        // sätt collisionen
        this.platforms = map.createLayer('Platforms', tileset);
        this.platforms.setCollisionByExclusion(-1, true);

        
        
        //#endregion

        // keyboard cursors
        this.cursors = this.input.keyboard.createCursorKeys();

        // skapa en spelare och ge den studs
        this.player = this.physics.add.sprite(1000, 1000, 'player');
        this.player.setCircle(this.player.width/2);
        this.player.setBounce(0);
        this.player.setCollideWorldBounds(true);
        playerr = this.player;

        // krocka med platforms lagret
        this.physics.add.collider(this.player, this.platforms);

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
        
        this.ballCooldown = 0;

        //#endregion

        //#region boss room

        this.physics.add.overlap(bossFlag, this.player, initBoss, null, this);
        bossDoor = this.physics.add.group({
            allowGravity: false,
            immovable: true
        });
        this.physics.add.collider(bossDoor, this.player);
        function initBoss(player, doorFlag){
            doorFlag.destroy();
            this.cameras.main.setBounds(850,900, 600, 600);
            this.cameras.main.stopFollow();
            map.getObjectLayer('Doorpos').objects.forEach((flag) => {
                // iterera över spikarna, skapa spelobjekt
                const newDoor = bossDoor
                    .create(flag.x, flag.y, 'white_platform')
                    .setOrigin(0);
                newDoor.body
                    .setSize(flag.width, flag.height)
                    .setOffset(0, 0);
            });
            var Boss = this.boss.create(1000, 1000, 'jens').setScale(0.25);
            Boss.setDataEnabled();
            Boss.setData({
                hp: 1000,
                shotCooldown: 0,
                currentMove: "none",
                isTracking: false
            });
        }

        //#endregion

        //#region Boss

        this.boss = this.physics.add.group({
            hp: 3000,
            enraged: false,
            allowGravity: false,
            shotCooldown: 1000,
            currentMove: "none",
            isTracking: false
        });

        this.physics.add.collider(this.boss, this.platforms);
        this.physics.add.collider(this.boss, bossDoor);
        this.physics.add.overlap(this.boss, this.snowballs, hurtBoss, null, this);
        function hurtBoss(boss, ball) {
            boss.data.values.hp -= 10;
            console.log(boss.data.values.hp);
            destroyBall(ball);
            boss.setTint(0xFF0000);
            this.time.addEvent({
                delay: 60,
                callback: ()=>{
                    boss.setTint(0xFFFFFF);
                }
            });
        }

        this.enemySnowBall = this.physics.add.group();
        this.physics.add.overlap(this.enemySnowBall, this.player, hurt, null, this);
        function hurt(player, ball) {
            ball.destroy();
            player.setTint(0xFF0000);
            this.time.addEvent({
                delay: 60,
                callback: ()=>{
                    player.setTint(0xFFFFFF);
                }
            });
        }

        this.laserBall = this.physics.add.group({
            isTracking: false,
            allowGravity: false,
            line: null,
            hasBeenShot: false,
            parent: null
        });

        //#endregion

        //#endregion


        snowCrashEmitter = this.snowParticle.createEmitter({
            speed: {min: 10, max: 25},
            accelerationY: 200,
            on: false,
            lifespan: { min: 500, max: 1000 },
        })


        this.cameras.main.startFollow(this.player);
        
    }

    // play scenens update metod
    update() {
           
        //#region Throw snowball
        if(this.ballCooldown > 0) {
            this.ballCooldown--;
        }
        if(this.keyObjE.isDown && this.ballCooldown == 0) {
            this.ballCooldown = 2;
            var ball = this.snowballs.create(this.player.x + 15, this.player.y - 15, 'snowball').setScale(0.03);
            // mousePointer följer inte med när skärmen scrollar, därför måste man
            // även addera kamerans scroll.
            let angle = Math.atan2(((this.game.input.mousePointer.y + this.cameras.main.scrollY) - ball.y), ((this.game.input.mousePointer.x + this.cameras.main.scrollX) - ball.x));
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
                this.player.play('idle', true);
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

        //#region pause

        if (this.keyObjESC.isDown) {
            // pausa nuvarande scen
            this.scene.pause();
            // starta menyscenene
            this.scene.launch('MenuScene');
        }

        //#endregion

        //#region bossAI
        let bullet = this.enemySnowBall;
        let lazor = this.laserBall;

        if(this.boss.countActive(true) > 0) {
            this.boss.children.iterate(function(child){
                if(child.data.values.hp <= 0 && child.data.values.currentMove == "none") {
                    dis.finishBoss(child);
                } else if(child != null) {
                        if(child.data.values.shotCooldown > 0) {
                            child.data.values.shotCooldown--;
                        }

                        if(child.body.x > playerr.body.x + 60 && child.body.velocity.x > - 150) {
                            child.setVelocityX(child.body.velocity.x - 4)
                        } else if(child.body.x > playerr.body.x && child.body.velocity.x > - 50){
                            child.setVelocityX(child.body.velocity.x - 2)
                        } else {
                            child.setVelocityX(child.body.velocity.x + 4)
                        }

                        if(child.body.x < playerr.body.x - 60 && child.body.velocity.x < 150) {
                            child.setVelocityX(child.body.velocity.x + 4)
                        } else if(child.body.x < playerr.body.x && child.body.velocity.x < 50){
                            child.setVelocityX(child.body.velocity.x + 2)
                        } else {
                            child.setVelocityX(child.body.velocity.x - 4)
                        }
                    
                        if(child.body.x - playerr.body.x < 60 && child.data.values.shotCooldown == 0 && child.data.values.currentMove == "none") {
                            child.data.values.shotCooldown = 100;
                            var enemyBullet = bullet.create(child.body.x + 50, child.body.y + 50, 'snowball').setScale(0.05);
                            enemyBullet.setTint(0xFF0000);
                            enemyBullet.setVelocityY(150);

                        }
                    
                    
                        console.log(child.data.values.currentMove);
                        let rand = Faser.Math.FloatBetween(0, 1000);
                        if(rand < 10 && child.data.values.currentMove == "none") {
                            child.data.values.currentMove = "bulletSweep"
                            bulletSweep(child);
                        }
                }
                
            })
        
        }

        function bulletSweep(boss) {
            dis.tweens.add({
                targets: boss,
                x: 1000,
                y: 1000,
                duration: 3000,
                ease: 'Power4',
                delay: 0
            });
            dis.time.addEvent({
                delay: 2000,
                callback: ()=>{
                    dis.time.addEvent({
                        callback: ()=>{
                            boss.data.values.isTracking = true;
                            let shot = lazor.create(boss.x, boss.y, 'snowball');
                            shot.setScale(0.03);
                            shot.setTint(0x00FF00);
                            shot.setDataEnabled();
                            shot.setData({
                                line: dis.add.line(0, 0, shot.x, shot.y, playerr.x, playerr.y, 0x0000FF).setOrigin(0).setLineWidth(1),
                                isTracking: true,
                                hasBeenShot: false,
                                parent: boss
                            });
                        },
                        delay: 100,
                        repeat: 10
                    })
                },
            })
            dis.tweens.add({
                targets: boss,
                x: 1750,
                y: 1250,
                duration: 2000,
                ease: 'Power2',
                delay: 2000
            });
            dis.time.addEvent({
                delay: 7000,
                callback: ()=>{
                   boss.data.values.currentMove = "none";
                }
            })
        }


        //Känns onödigt att ha två separata identiska funktioner men Phasers hela physics system brakade 
        //när dem var under samma och jag vette fan varför
        if(this.boss.countActive(true) > 0) {
            this.laserBall.children.iterate(function(child){
                if(child.data.values.parent.data.values.isTracking) {
                    var angle = Math.atan2((playerr.y - child.y), (playerr.x - child.x));
                    child.data.values.line.setTo(child.x, child.y, child.x + Math.cos(angle)*1000, child.y + Math.sin(angle)*1000);
                    dis.time.addEvent({
                        delay: 3000,
                        callback: ()=>{
                            if(child.data.values.parent.data != undefined) {
                                child.data.values.parent.data.values.isTracking = false;
                            }
                        }
                    })
                }
            })
            this.laserBall.children.iterate(function(child){
                let angle = Math.atan2((playerr.y - child.y), (playerr.x - child.x));
                if(!child.data.values.parent.data.values.isTracking && !child.data.values.hasBeenShot) {
                    child.data.values.hasBeenShot = true;
                    dis.time.addEvent({
                        delay: 500,
                        callback: ()=>{
                            child.data.values.line.setVisible(false);
                            child.setVelocityY(Math.sin(angle)*1500);
                            child.setVelocityX(Math.cos(angle)*1500);
                        }
                    });
                }
            })
        }
    
        //#endregion
    }
        
       
    // metoden updateText för att uppdatera overlaytexten i spelet
    updateText() {
        this.text.setText(
            `Arrow keys to move. Space to jump. W to pause. doord: ${this.doord}`
        );
    }

    finishBoss(boss) {
        boss.destroy();
        dis.cameras.main.pan(playerr.x, playerr.y , 1000);
        dis.cameras.main.setBounds(0,0, 3000, 10000);
        dis.player.disableBody();
        dis.player.setVelocityX(0);
        dis.player.setVelocityY(0);
        bossDoor.children.iterate(function(child){
            child.destroy();
        });
        dis.time.addEvent({
            delay: 1000,
            callback: ()=>{
                dis.cameras.main.startFollow(this.player);
                dis.player.enableBody();
            }
        })
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

export default CaveScene;

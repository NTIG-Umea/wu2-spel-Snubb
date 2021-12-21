//#region En massa variabler och funktioner här utanför så att phaser blir glad

//Utan detta klagar den på massa ställen att saker inte är defined
var dis;
var Faser;
var snowCrashEmitter;
var laserEmitter;
var playerr;
var cleared = false;
var bossFlag;
var bossDoor;
var map;
var tileset;
var lasorArray = [];
var tempTimer;
var leaderBoard = [];

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

class CaveScene extends Phaser.Scene {
    constructor() {
        super('CaveScene');
    }
    init(data) {
        tempTimer = data.timer;
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
        
        this.timer = tempTimer;
        this.timerText = this.add.text(this.game.config.width, 0, '', {
            fontFamily: '"Mochiy Pop P One"',
            fontSize: '16px',
            fill: '#ff0000'
        });
        this.timerText.setScrollFactor(0);
        this.timerText.setDepth(50);

        this.time.addEvent({
            delay: 1,
            callback: ()=>{
                this.timer++;
                this.updateText();
            },
            repeat: -1
        })

        console.log(tempTimer);

        //några onödiga variabler så jag kan använda dom i functions; phaser moment
        dis = this;
        Faser = Phaser;

        this.cameras.main.setSize(900, 600);
        this.cameras.main.setBounds(0,0, 2528, 2112);
        this.cameras.main.setZoom(0.9);

        this.physics.world.setBounds( 0, 0, 2528, 2112 );

        this.snowParticle = this.add.particles('snowParticle');


        //#region Key Listeners
        this.input.on('pointerdown', function (pointer) {
            this.pointerIsDown = true;
        }, this);

        this.input.on('pointerup', function (pointer) {
            this.pointerIsDown = false;
        }, this);
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
        map = this.make.tilemap({ key: 'cave_map', tileWidth: 32, tileHeight: 32 });
        // ladda in tilesetbilden till vår tilemap
        tileset = map.addTilesetImage('tileset_32', 'tiles2');

        // initiera animationer, detta är flyttat till en egen metod
        // för att göra create metoden mindre rörig
        //this.initAnims();
        this.initNewAnims();
        this.initSnowManAnims();
        this.initBossAnims();
        this.initBatAnims();

        this.imageBackground = this.add.image(-40, -25, 'newnewBackground').setOrigin(0).setScale(1.5, 1).setScrollFactor(0.3).setDepth(-102);
        this.backgroundProof = map.createLayer('BackgroundProof', tileset).setDepth(-101);
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
                .setOffset(0, 0);
        });
        
        // Ladda lagret Platforms från tilemappen
        // och skapa dessa
        // sätt collisionen
        this.platforms = map.createLayer('Platforms', tileset);
        this.platforms.setCollisionByExclusion(-1, true);

        this.platformSnow = map.createLayer('Snow', tileset);

        this.tempPlatforms = map.createLayer('TempPlatforms', tileset);
        this.tempPlatforms.setCollisionByExclusion(-1, true);

        this.semiSolids = map.createLayer('SemiSolids', tileset);
        this.semiSolids.setVisible(false);
        
        //#endregion

        // keyboard cursors
        this.cursors = this.input.keyboard.createCursorKeys();

        // skapa en spelare och ge den studs
        this.player = this.physics.add.sprite(100, 100, 'newPlayer',{
            hp: 100,
            immunity: false
        });
        this.player.setDataEnabled();
        this.player.setData({hp: 100, immunity: false});
        this.player.setBounce(0);
        this.player.setCollideWorldBounds(true);
        playerr = this.player;

        // krocka med platforms lagret
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.player, this.tempPlatforms);

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
        this.physics.add.collider(this.snowballs, this.tempPlatforms);
        
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
            this.cameras.main.stopFollow();
            this.cameras.main.pan(1350, 1235, 600);
            this.time.addEvent({
                delay: 600,
                callback: ()=>{
                    this.cameras.main.setBounds(850,900, 600, 600)
                }
            })
            map.getObjectLayer('Doorpos').objects.forEach((flag) => {
                // iterera över spikarna, skapa spelobjekt
                const newDoor = bossDoor
                    .create(flag.x, flag.y, 'temp_platform')
                    .setOrigin(0);
                newDoor.body
                    .setSize(flag.width, flag.height)
                    .setOffset(0, 0);
            });
            var Boss = this.boss.create(1000, 1000, 'santa').setScale(2);
            Boss.setDataEnabled();
            Boss.setData({
                hp: 1000,
                shotCooldown: 0,
                currentMove: "none",
                isTracking: false,
                isEngraged: false,
                dead: false
            });
            Boss.setDepth(-50);
            this.santaTop = this.add.image(Boss.x + Boss.width, Boss.y - Boss.height - 10, 'santaTop').setScale(2);
        }

        //#endregion

        //#region Boss

        this.boss = this.physics.add.group({
            hp: 3000,
            enraged: false,
            allowGravity: false,
            shotCooldown: 1000,
            currentMove: "none",
            isTracking: false,
            isEngraged: false,
            dead: false
        });

        this.physics.add.collider(this.boss, this.platforms);
        this.physics.add.collider(this.boss, bossDoor);
        this.physics.add.overlap(this.boss, this.snowballs, hurtEnemy, null, this);
        function hurtEnemy(boss, ball) {
            boss.data.values.hp -= 10;
            destroyBall(ball);
            boss.setTint(0xFF0000);
            this.time.addEvent({
                delay: 60,
                callback: ()=>{
                    boss.setTint(0xFFFFFF);
                }
            });
        }

        this.enemySnowBall = this.physics.add.group({
            time: 1000
        });
        this.physics.add.overlap(this.enemySnowBall, this.player, hurt, null, this);
        function hurt(player, ball) {
            player.data.values.hp -= 5;
            if(player.data.values.hp <= 0) {
                player.data.values.hp = 0;
                dis.time.addEvent({
                    delay: 60,
                    callback: ()=>{
                        dis.scene.pause();
                        dis.scene.launch('GameOverScene');
                    }
                })
            }
            ball.setVisible(false);
            ball.disableBody();
            //ball.destroy();
            player.setTint(0xFF0000);
            this.time.addEvent({
                delay: 60,
                callback: ()=>{
                    player.setTint(0xFFFFFF);
                }
            });
            this.updateText();
        }

        this.laserBall = this.physics.add.group({
            isTracking: false,
            allowGravity: false,
            line: null,
            hasBeenShot: false,
            parent: null,
            time: 500
        });
        this.physics.add.overlap(this.laserBall, this.player, hurt, null, this);

        //#endregion

        //#region basic enemy
        this.koopa = this.physics.add.group({
            hp: 100,
            hasJumped: false
        });
        this.physics.add.collider(this.koopa, this.platforms);
        this.physics.add.overlap(this.koopa, this.player, enemyHurt, null, this);
        this.physics.add.overlap(this.koopa, this.snowballs, hurtBasicEnemy, null, this);
        function enemyHurt(player, koopa){
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
                        dis.scene.launch('GameOverScene');
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
        function hurtBasicEnemy(koopa, ball) {
            koopa.data.values.hp -= 10;
            destroyBall(ball);
            koopa.setTint(0xFF0000);
            this.time.addEvent({
                delay: 60,
                callback: ()=>{
                    koopa.setTint(0xFFFFFF);
                }
            });
        }

        map.getObjectLayer('Enemy spawn').objects.forEach((enemy) => {
            const newEnemy = this.koopa
                .create(enemy.x, enemy.y, 'snowman')
                .setOrigin(0)
                .play('snowWalk', true);
            newEnemy.body
                .setSize(55, 60)
                .setOffset(0, 5)
                .setVelocityX(60)
                .setBounceX(1);
            newEnemy.setDataEnabled();
            newEnemy.setData({
                hp: 100,
                hasJumped: false
            });
        });
        //#endregion

        //#region flying enemy
        this.flyer = this.physics.add.group({
            hp: 100,
            isTracking: false,
            allowGravity: false,
            right: false,
            heGoing: false
        });
        map.getObjectLayer('flyerSpawn').objects.forEach((enemy) => {
            // iterera över spikarna, skapa spelobjekt
            const newEnemy = this.flyer
                .create(enemy.x, enemy.y, 'bat')
                .setOrigin(0)
                .setScale(2);
            newEnemy.body
                .setSize(enemy.width, enemy.height)
                .setOffset(0, 0)
            newEnemy.setDataEnabled();
            newEnemy.setData({
                hp: 100,
                isTracking: false,
                right: false,
                heGoing: false
            });
            newEnemy.setCircle(newEnemy.width/2.25);
        });
        this.physics.add.collider(this.flyer, this.platforms);
        this.physics.add.overlap(this.flyer, this.player, enemyHurt, null, this);
        this.physics.add.overlap(this.flyer, this.snowballs, hurtBasicEnemy, null, this);
        //#endregion

        //#endregion
        laserEmitter = this.snowParticle.createEmitter({
            speed: {min: 25, max: 50},
            accelerationY: 100,
            angle: {min: 0, max: 180},
            on: false,
            lifespan: { min: 300, max: 600 },
            tint: 0x75b1ff
        });


        snowCrashEmitter = this.snowParticle.createEmitter({
            speed: {min: 10, max: 25},
            accelerationY: 200,
            on: false,
            lifespan: { min: 500, max: 1000 },
        });

        this.cameras.main.startFollow(this.player);
        
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

        this.lasor = this.physics.add.group({
            allowGravity: false,
            immovable: true,
            line: null
        });
        map.getObjectLayer('Lasor').objects.forEach((flag) => {
            // iterera över spikarna, skapa spelobjekt
            const newLasor = this.lasor
                .create(flag.x, flag.y, 'empty')
                .setOrigin(0);
            newLasor.body
                .setSize(flag.width, flag.height)
                .setOffset(0, 0);
            newLasor.setDataEnabled();
            newLasor.setData({
                //line: this.add.line(0, 0, flag.x + flag.width/2, flag.y, flag.x + flag.width/2, flag.y + flag.height, 0x0000FF, 0.5).setOrigin(0).setLineWidth(flag.width/2)
            })
        });
        this.lasorOverlap = this.physics.add.overlap(this.lasor, this.player, lasorHurt, null, this);
        this.lasorOverlap.active = false;
        function lasorHurt(player, lasor) {
            if(!player.data.values.immunity) {
                player.data.values.hp -= 40;
                if(player.data.values.hp <= 0) {
                    player.data.values.hp = 0;
                    dis.time.addEvent({
                        delay: 60,
                        callback: ()=>{
                            dis.scene.pause();
                            dis.scene.launch('GameOverScene');
                        }
                    })
                }
            }
            player.data.values.immunity = true;
            dis.time.addEvent({
                delay: 100,
                callback: ()=>{
                    player.data.values.immunity = false;
                }
            });
            dis.updateText();
        }

        map.getObjectLayer('Lasor').objects.forEach((flag) => {
            // iterera över spikarna, skapa spelobjekt
            let newLasor = dis.add.line(0, 0, flag.x + flag.width/2, flag.y, flag.x + flag.width/2, flag.y + flag.height, 0x0000FF, 1).setOrigin(0).setLineWidth(flag.width/2);
            newLasor.alpha = 0;
            lasorArray.push(newLasor);
        });

        this.clearFlag = this.physics.add.group({
            allowGravity: false,
            immovable: true
        });
        map.getObjectLayer('ClearFlag').objects.forEach((flag) => {
            // iterera över spikarna, skapa spelobjekt
            const newFlag = this.clearFlag
                .create(flag.x, flag.y, 'empty')
                .setOrigin(0);
            newFlag.body
                .setSize(flag.width, flag.height)
                .setOffset(0, 0);
        });
        this.physics.add.overlap(this.clearFlag, this.player, clear, null, this);
        function clear(clearflag, player){
            if(cleared) {
                cleared = false;
                leaderBoard.push(this.timer);
                leaderBoard.sort(function(a, b){return a - b});
                leaderBoard.length = 5;
                localStorage.setItem('localLeaderBoard', JSON.stringify(leaderBoard));

                dis.updateLeaderBoard(leaderBoard);
                this.grats = this.add.text(0, (this.game.config.height / 2) - 100, `Congrats \n The game is over\n Goodbye\nYour final time is: ${this.timer}`, {
                    fontFamily: '"Mochiy Pop P One"',
                    fontSize: '48px',
                    fill: '#ff0000',
                    align: 'center',
                    fixedWidth: this.game.config.width,
                    fixedHeight: this.game.config.height,
                });
                this.grats.setScrollFactor(0);
                this.scene.pause();
            }
        }

        this.graphics = this.add.graphics({
            lineStyle: {width: 1, color: 0xFF0000}
        })
    }

    // play scenens update metod
    update() {


        this.graphics.clear();
           
        //#region Throw snowball
        if((this.keyObjE.isDown || this.pointerIsDown) && this.ballCooldown == 0) {
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
            let angle = Math.atan2(((this.game.input.mousePointer.y + this.cameras.main.scrollY) - ball.y), ((this.game.input.mousePointer.x + this.cameras.main.scrollX) - ball.x));
            ball.setGravityY(400);
            ball.setDataEnabled();
            ball.setData({time: 240});
            ball.setBounce(0);
            ball.setCollideWorldBounds(true);
            ball.setVelocityY(Math.sin(angle)*1000);
            ball.setVelocityX(Math.cos(angle)*1000);
            //ball.setCircle(ball.body.width/2);

            ball.data.values.emitter = this.snowParticle.createEmitter({
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
        this.boss.children.iterate(function(child){
            dis.santaTop.x = child.x;
            dis.santaTop.y = child.y - child.height - 10;
            if(child.data.values.hp <= 0 && child.data.values.currentMove == "none" && !child.data.values.dead) {
                dis.finishBoss(child);
            }
        })
        if(this.boss.countActive(true) > 0) {
            this.boss.children.iterate(function(child){
                if(child != null && child.data.values.hp > 0) {
                    if(child.data.values.hp <= 500 && child.data.values.currentMove == "none" && !child.data.values.isEngraged) {
                        dis.enterPhase2(child);
                    }
                    if(child.data.values.shotCooldown > 0) {
                        child.data.values.shotCooldown--;
                    }
                    if((child.body.x + child.width/2) > (playerr.body.x - playerr.body.width/2) + 60 && child.body.velocity.x > - 200) {
                        child.setVelocityX(child.body.velocity.x - 12)
                    } else if((child.body.x + child.width/2) > (playerr.body.x - playerr.body.width/2) && child.body.velocity.x > - 50){
                        child.setVelocityX(child.body.velocity.x - 6)
                    } else {
                        child.setVelocityX(child.body.velocity.x + 12)
                    }
                    if((child.body.x + child.width/2) < (playerr.body.x - playerr.body.width/2) - 60 && child.body.velocity.x < 200) {
                        child.setVelocityX(child.body.velocity.x + 12)
                    } else if((child.body.x + child.width/2) < (playerr.body.x - playerr.body.width/2) && child.body.velocity.x < 50){
                        child.setVelocityX(child.body.velocity.x + 6)
                    } else {
                        child.setVelocityX(child.body.velocity.x - 12)
                    }
                    if(child.body.x - (playerr.body.x + playerr.body.width/2) < 60 && child.data.values.shotCooldown == 0 && child.data.values.currentMove == "none") {
                        child.play('bossShoot', true);
                        dis.time.addEvent({
                            delay: 240,
                            callback: ()=>{
                                child.play('bossIdle', true);
                            }
                        })
                        child.data.values.shotCooldown = 100;
                        var enemyBullet = bullet.create(child.body.x + child.width, child.body.y + child.height + 30, 'snowball').setScale(2);
                        enemyBullet.setTint(0xFF0000);
                        enemyBullet.setVelocityY(150);
                        enemyBullet.setDataEnabled();
                        enemyBullet.setData({time: 100});
                    }
                    let rand = Faser.Math.FloatBetween(0, 1000);
                    if(rand < 5 && child.data.values.currentMove == "none" && !child.data.values.isEngraged) {
                        child.data.values.currentMove = "bulletSweep";
                        dis.bulletSweep(child);
                    } else if(child.data.values.isEngraged && rand < 5 && child.data.values.currentMove == "none") {
                        child.data.values.currentMove = "bigLasor";
                        dis.bigLasor(child);
                    }
                }
            })
        }

        //Känns onödigt att ha två separata identiska funktioner men Phasers hela physics system brakade 
        //när dem var under samma och jag vette fan varför
        if(this.laserBall.countActive(true) > 0) {
            this.laserBall.children.iterate(function(child){
                if(child.data.values.parent.data.values.isTracking) {
                    var angle = Math.atan2((playerr.y - child.y), (playerr.x - child.x));
                    child.data.values.line.setTo(child.x, child.y, child.x + Math.cos(angle)*1000, child.y + Math.sin(angle)*1000);
                    dis.time.addEvent({
                        delay: 2000,
                        callback: ()=>{
                            if(child != null) {
                                try {
                                    if(child.data.values.parent.data != undefined) {
                                        child.data.values.parent.data.values.isTracking = false;
                                    }
                                } catch (error) { }
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
        
        this.enemySnowBall.children.iterate(function(child){
            if(child != null) {
                if(child.data.values.time > 0) {
                    child.data.values.time--;
                } else {
                    child.destroy();
                }
            }
        });

        this.laserBall.children.iterate(function(child){
            if(child != null) {
                if(child.data.values.time > 0) {
                    child.data.values.time--;
                } else {
                    child.destroy();
                }
            }
        });
        //#endregion
    
        //#region enemyAI
        this.koopa.children.iterate(function(child){
            if(child != null) {
                child.play('snowWalk', true);
                if (child.body.velocity.x > 0) {
                    child.setFlipX(false);
                } else if (child.body.velocity.x < 0) {
                    // otherwise, make them face the other side
                    child.setFlipX(true);
                }
                if(child.data.values.hp <= 0) {
                    child.destroy();
                } else if(!child.body.onFloor()){
                    if(!child.data.values.hasJumped) {
                        child.body.velocity.x *= -1;
                        child.setVelocityY(-20);
                        child.data.values.hasJumped = true;
                    }
                } else {
                    child.data.values.hasJumped = false;
                }
            }

            
        });
        //#endregion
    
        //#region flyerAI
        this.flyer.children.iterate(function(child){
            
            if(child != null){
                if (child.body.velocity.x > 0) {
                    child.setFlipX(true);
                } else if (child.body.velocity.x < 0) {
                    child.setFlipX(false);
                }
                if(child.data.values.hp <= 0) {
                    child.destroy();
                } else {
                    if(child.data.values.isTracking) {
                        child.play('batChase', true);
                        let angle = Math.atan2((playerr.y - (child.y + child.height/2)), (playerr.x - (child.x + child.width/2)));
                        child.setVelocityY(Math.sin(angle)*150);
                        child.setVelocityX(Math.cos(angle)*150);
                    } else {
                        child.play('batIdle', true);
                    }
                    if(!child.data.values.heGoing) {
                        child.data.values.heGoing = true;
                        if(child.data.values.right){
                            child.setVelocityX(150);
                        } else {
                            child.setVelocityX(-150);
                        }
                        dis.time.addEvent({
                            delay: 2000,
                            callback: ()=>{
                                try {
                                    child.data.values.right = !child.data.values.right;
                                    child.data.values.heGoing = false;
                                } catch (error) { }
                            }
                        });
                    }
                    if(Math.sqrt(Math.pow(child.x-playerr.x, 2)+Math.pow(child.y-playerr.y, 2)) < 400 && dis.rayCast(child, playerr) == 0) {
                        child.data.values.isTracking = true;
                    } else if((Math.sqrt(Math.pow(child.x-playerr.x, 2)+Math.pow(child.y-playerr.y, 2)) > 600 || dis.rayCast(child, playerr) > 0) && child.data.values.isTracking) {
                        child.data.values.isTracking = false;
                        child.setVelocityY(0);
                        child.setVelocityX(0);
                    }
                }
            }
        });
        //#endregion

        //#region clear condition
        
        //#endregion
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
        
       
    // metoden updateText för att uppdatera overlaytexten i spelet
    updateText() {
        this.text.setText(
            `HP: ${this.player.data.values.hp}`
        );
        this.timerText.setText(
            `${this.timer}`
        )
        this.hpBar.width = 2*this.player.data.values.hp;
    }

    enterPhase2(boss) {
        dis.tempPlatforms.setX(-20000);
        dis.cameras.main.setBounds(850,900, 1750, 600)
        dis.cameras.main.startFollow(playerr);
        dis.semiSolids.setVisible(true);
        dis.semiSolids.setCollisionByExclusion(-1, true);
        dis.physics.add.collider(dis.semiSolids, dis.player);
        dis.physics.add.collider(dis.semiSolids, dis.snowballs);
        boss.data.values.isEngraged = true;
    }

    finishBoss(boss) {
        cleared = true;
        boss.data.values.dead = true;
        boss.setVisible(false);
        boss.disableBody();
        dis.santaTop.setVisible(false);
        dis.time.addEvent({
            delay: 10000,
            callback: ()=>{
                boss.destroy();
                dis.santaTop.destroy();
            }
        });
        dis.cameras.main.pan(playerr.x, playerr.y , 3000);
        this.cameras.main.setBounds(0,0, 2528, 2112);
        dis.player.disableBody();
        dis.player.setVelocityX(0);
        dis.player.setVelocityY(0);
        bossDoor.children.iterate(function(child){
            child.destroy();
        });
        dis.time.addEvent({
            delay: 3000,
            callback: ()=>{
                dis.cameras.main.startFollow(this.player);
                dis.player.enableBody();
            }
        })
    }

    rayCast(user, target) {
        let line = new Phaser.Geom.Line(user.x + user.width, user.y + user.height, target.x, target.y);

        let overlappingTiles = this.platforms.getTilesWithinShape(line, { isColliding: true});

        return overlappingTiles.length
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
    initBossAnims(){
        this.anims.create({
            key: 'bossShoot',
            frames: this.anims.generateFrameNames('santa'),
            frameRate: 30
        })
        this.anims.create({
            key: 'bossIdle',
            frames: this.anims.generateFrameNames('santa', {
              start: 0,
              end: 0
            })
          });
          
    }
    initBatAnims(){
        this.anims.create({
            key: 'batIdle',
            frames: this.anims.generateFrameNames('bat'),
            frameRate: 10
        });
        this.anims.create({
            key: 'batChase',
            frames: this.anims.generateFrameNames('bat'),
            frameRate: 20
        })
    }
    bulletSweep(boss) {
        dis.santaTop.setTint(0x00FF00);
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
                        let shot = dis.laserBall.create(boss.x, boss.y, 'snowball');
                        shot.setTint(0x00FF00);
                        shot.setDataEnabled();
                        shot.setData({
                            line: dis.add.line(0, 0, shot.x, shot.y, playerr.x, playerr.y, 0x0000FF, 113).setOrigin(0).setLineWidth(1),
                            isTracking: true,
                            hasBeenShot: false,
                            parent: boss,
                            time: 250
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
        dis.tweens.add({
            targets: boss,
            y: 1000,
            duration: 2000,
            ease: 'linear',
            delay: 4000
        });
        dis.time.addEvent({
            delay: 6000,
            callback: ()=>{
                dis.santaTop.clearTint();
               boss.data.values.currentMove = "none";
            }
        })
    }

    bigLasor(boss) {
        dis.santaTop.setTint(0x0000FF);
        dis.time.addEvent({
            delay: 300,
            callback: ()=>{
                for(let i = 896; i < 2464; i += 20){
                    laserEmitter.emitParticle(3, i, 928);
                }
            },
            repeat: 5
        })

        for(let i = 0; i < lasorArray.length; i++) {
            dis.tweens.add({
                targets: lasorArray[i],
                alpha: 0.3,
                duration: 1000,
                delay: 1000,
                ease: 'linear'
            });
            dis.tweens.add({
                targets: lasorArray[i],
                alpha: 1,
                duration: 0,
                delay: 2000,
                ease: 'Sine.easeInOut'
            });
            dis.time.addEvent({
                delay: 2000,
                callback: ()=>{
                    lasorArray[i].alpha = 1;
                    dis.lasorOverlap.active = true;
                    dis.time.addEvent({
                        delay: 20,
                        callback: ()=>{
                            dis.lasorOverlap.active = false;
                            if(boss != undefined){
                                dis.santaTop.clearTint();
                                boss.data.values.currentMove = "none";
                            }
                            lasorArray[i].alpha = 0;
                        }
                    })
                }
            })
            dis.tweens.add({
                targets: lasorArray[i],
                alpha: 0,
                duration: 200,
                delay: 2020,
                ease: 'Sine.easeInOut'
            });
        }
    }
}

export default CaveScene;

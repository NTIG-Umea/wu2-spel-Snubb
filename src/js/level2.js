//#region En massa variabler och funktioner här utanför så att phaser blir glad
//Utan detta klagar den på massa ställen att saker inte är defined
var dis;
var Faser;
var snowCrashEmitter;
var playerr;
var cleared = false;
var bossFlag;

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
        this.player = this.physics.add.sprite(50, 300, 'player');
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
        var bossDoor = this.physics.add.group({
            allowGravity: false,
            immovable: true
        });
        this.physics.add.collider(bossDoor, this.player);
        function initBoss(player, doorFlag){
            doorFlag.destroy();
            console.log("DEATH");
            this.cameras.main.setBounds(850,900, 600, 600);
            map.getObjectLayer('Doorpos').objects.forEach((flag) => {
                // iterera över spikarna, skapa spelobjekt
                const newDoor = bossDoor
                    .create(flag.x, flag.y-20, 'gate')
                    .setOrigin(0);
                newDoor.body
                    .setSize(flag.width, flag.height)
                    .setOffset(0, 20);
            });
            var Boss = boss.create(1000, 1000, 'jens').setScale(0.25);
            Boss.setDataEnabled();
            Boss.setVelocityY(125);
            Boss.setVelocityX(125);
            Boss.setBounce(1);
        }

        //#endregion

        //#region Boss

        let boss = this.physics.add.group({
            hp: 3000,
            enraged: false,
            allowGravity: false
        });

        this.physics.add.collider(boss, this.platforms);
        this.physics.add.collider(boss, bossDoor);
        this.physics.add.overlap(boss, this.snowballs, hurtBoss, null, this);
        function hurtBoss(boss, ball) {
            boss.scale -= 0.01;
            boss.body.velocity.x += 20;
            boss.body.velocity.y += 20;
            destroyBall(ball);
        }

        //#endregion

        //#endregion


        snowCrashEmitter = this.snowParticle.createEmitter({
            speed: {min: 10, max: 25},
            accelerationY: 200,
            on: false,
            lifespan: { min: 500, max: 1000 },
        })

        
    }

    // play scenens update metod
    update() {


        this.cameras.main.startFollow(this.player);
           
        //#region Throw snowball
        if(this.ballCooldown > 0) {
            this.ballCooldown--;
        }
        if(this.keyObjE.isDown && this.ballCooldown == 0) {
            this.ballCooldown = 20;
            var ball = this.snowballs.create(this.player.x + 15, this.player.y - 15, 'snowball').setScale(0.03);
            // mousePointer följer inte med när skärmen scrollar, därför måste man
            // även addera kamerans scroll.
            var angle = Math.atan2(((this.game.input.mousePointer.y + this.cameras.main.scrollY) - ball.y), ((this.game.input.mousePointer.x + this.cameras.main.scrollX) - ball.x));
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

    
    }
        
       
    // metoden updateText för att uppdatera overlaytexten i spelet
    updateText() {
        this.text.setText(
            `Arrow keys to move. Space to jump. W to pause. doord: ${this.doord}`
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

export default CaveScene;

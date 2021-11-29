# Templat för spelprojektet

Detta är ett startprojekt för spelutvecklingen.
Projektet använder 
* [11ty](https://www.11ty.dev/) för att skapa html
* [Sass](https://sass-lang.com/) för att skapa css
* [Rollup](https://rollupjs.org/) för att kompilera javascript
* [Phaser 3](https://phaser.io/) som spelmotor

Detta är en fortsättning på det vi har övat tidigare och detta är för att ni ska fortsätta använda er av dessa tekniker.
Projektets nyheter kommer att förklaras här i denna fil.

## Kompilera

Rollup kompilerar javascript till en enkel fil. En så kallad bundle.
Detta gör att du kan skriva ditt spel och dela upp koden i flera filer. Rollup skapar sedan en fil och vi kan då även använda oss av [npm-paket](https://www.npmjs.com/) och annat för den JS som kommer att köras i webbläsaren.

Rollup behöver en [config-fil](rollup.config.js) och själva bygg-kommandot körs från projektets [package-script](package.json).

## Phaser3

Phaser3 laddas från en [CDN](https://www.cloudflare.com/en-gb/learning/cdn/what-is-a-cdn/). Detta för att byggtiden med Rollup blir enorm.

# Filer och mappar

```
dist/
src/
    _data/
    _includes/
        layouts/
            base.njk
        components/
        assets/
            spelgrafik
        js/
            game.js
            scenes.js
        scss/
    index.njk
.eleventy.js
rollup.config.js
package.json
```

Denna struktur bör du känna igen sedan tidigare. Kolla igenom filerna och bekanta dig med innehållet.

# Spelet

Själva spelet laddas in från index.html(byggs från index.njk). Phaser laddas från CDN och spelet från den bundle som Rollup bygger. Rollup tar alla filerna från js mappen och bygger en fil utav det. Den är länkad från index.html, bundle.js.

## Phaser 3 dokumentation

[API docs](https://newdocs.phaser.io/docs/3.55.2)
[Phaser3 notes](https://rexrainbow.github.io/phaser3-rex-notes/docs/site/)

Tutorials och annat, se [classroom](https://classroom.google.com/u/0/).
## Uppdelning

Till skillnad från tidigare exempel vi tittat på för Phaser så är nu spelet uppdelat i olika filer och skrivet med [ES6 klasser](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes?retiredLocale=sv-SE). 
Ni ser väl om ni gillar denna typ av syntax, det påminner mer om Java.

Phaser initieras först i filen [game.js](src/js/game.js). Filen importerar vilka scener som spelet ska använda och listar dem sen i config objektet.

```js
const config = {
    type: Phaser.AUTO,
    width: 896,
    height: 448,
    pixelArt: true,
    transparent: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 400 },
            debug: true
        }
    },
    scene: [PreloadScene, PlayScene, MenuScene],
    parent: 'game'
};
```

Sedan så initieras ett nytt Phaser spel med denna config.

### Scener

Scenerna är uppdelad och strukturen på detta är:

* preload
* play
* menu

Detta låter oss använda en preload scene först och när denna har laddat färdigt så visas spelet. Detta kan vara smart om det är mycket och stora filer som ska laddas. Om en önskar en loadingscreen / spinner så placerar ni denna i preload scenen.

När allt laddas från preload så startas play scenen.

**¨Kolla kommentarerna i koden!**

# Tiled

För projektet kommer vi att jobba med programmet [Tiled](https://www.mapeditor.org/) och tilemaps skapade med det.
Ladda ned och installera.

Klicka runt, kolla. Ladda [tilemap filen](src/assets/tilemaps/level1.json).

## Tutorial

Delar av det vi gör och grunden som estetklassen arbetat med är hämtat från denna [tutorial](https://stackabuse.com/phaser-3-and-tiled-building-a-platformer/).
Vill du veta mer om Tiled och hur en tilemap skapas så kolla igenom den.

## Tilemaps

Filerna som skapas från Tiled, tilemaps sparas sedan som [JSON](https://www.json.org/json-en.html) och kan laddas in i Phaser.

[Doc](https://newdocs.phaser.io/docs/3.55.2/Phaser.Tilemaps)
## Tilemap collisions i Phaser3

Kollisioner i Phaser kan göras på ett antal olika sätt. Med tilemaps så kan vi ladda in detta från tilemap filen. Det funkar sådär.

Tiled har en collisions editor, för att rita collisions på varje tile. Evig ära till den som får det att funka.

```js
// krocka med allt
this.platforms.setCollisionByExclusion(-1, true);
// om vi sätter en collision property på en tile i Tiled
this.platforms.setCollisionByProperty({ collides: true });
// ladda kollisioner från Tiles collisioner / grupp
this.platforms.setCollisionFromCollisionGroup(
    true,
    true,
    this.platforms
);
platforms.setCollision(1, true, true);
```

# Scener och meny

Projektet innehåller ett exempel för en PAUSED skärm. Detta illustrerar hur du kan använda en scen som en meny i spelet.

Anpassa och använd för hiscore, game over osv.

# Localstorage

Vill ni spara data som hi-scores kan ni använda [localstorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) i webbläsaren.

```js
let score = 100;

hiscore = localStorage.getItem('hiscore');

if (score > hiscore) {
    localStorage.setItem('hiscore', score);
}
```

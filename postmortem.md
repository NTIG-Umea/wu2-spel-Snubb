# Post mortem - Tomtenissens revenge

## Oliver Lundqvist - 2022/01/14

### **Inledning**

Syftet med detta arbete var att skapa ett webb-baserat spel med hjälp av Phaser spelmotorn. Allting skrevs i javascript.

### **Bakgrund**

Projektet var delvist ett grupparbete då vi i grupp brainstormade ideér för vad exakt spelet skulle handla om. Allt vi fick förbestämt var temat, något med jul att göra, och genret vilket var platformer.  
Allting annat planerades tillsammans i smågrupper. 

Smågrupperna var uppgjorde av några från Teknikklassen och några från estetklassen, då estetarna hade i uppgift att tillsammans skapa all spritework till spelet och teknikarna enskilt skapade varsitt spel med hjälp av den gemensamma planeringen och all spritework.
### **Positiva erfarenheter**

Överlag har det mesta gått rätt så bra. Även om lösningarna kanske inte är optimala(rakt av äckliga i vissa fall) så fungerar det som det ska, i det flesta fallen *mer om det senare*
### **Negativa erfarenheter**

Framförallt två saker som gick mindre bra. För det första kunde sammarbetet med estetarna gått bättre. Själva planeringsbiten gick bra men kommunikationen efter det blev sämre + estetarna hade inte riktigt nog med tid för att göra klart alla sprites. Originala planen var att estetarna skulle göra leveldesignen också men vi fick halvvägs igenom byta det och skapa nivåerna själva. I slutändan ledde det till att det färdiga spelet ser väldigt mycket annorlunda ut från den originala planeringen.

Det andra som inte gick så bra var speltestandet. Allting jag gjorde och testade var på skollaptopen vilket ledde till att den praktiskt sätt fungerar perfekt där. Problemet ligger i att phaser uppdaterar olika snabbt beroende på prestandan på datorn, med andra ord så är spelet smått snabbare när jag väl testade på min egen pc vilket ledde till att vissa timings blev annorlunda och att spelet till och med kraschar i vissa fall.  
Det enda sättet att undvika detta är att helt enkelt testa på andra enheter tidigare och försöka hitta en lösning då istället för en vecka innan projektet är klart.
### **Sammanfattning**

Även fast projektet blev lite kaotiskt och tidsbegränsat(delvis för att jag var ganska ambitiös i planeringen) så gick det väldigt bra. Jag har lärt mig rejält mycket om hela tankesättet när man jobbar med en spelmotor och att man inte kan lita på att estetarna gör allt dem ska.
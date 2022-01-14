# Till er stackare som ska jobba med Phaser

Lär dig om att importera klasser om du ska ha flera nivåer.
I mitt fall kopierade jag all kod för t.ex spelarkaraktären för att få han att fungera för båda nivåerna. En mycket bättre lösning är att skriva en separat spelar klass och importera in den i varje nivå. Hur man gör det i javascript vet jag ej så lycka till :).

Globala variabler kan vara användbara. I många fall kan Phaser klaga på att vissa saker inte är definierade, speciellt inuit funktioner. Ett sätt att lösa det är att skapa en kopia av den variabeln som en global variabel.
Exempelvis är 'this' en variabel som används väldigt mycket men som inte fungerar i vissa funktioner. I det fallet kan man skapa en tom variabel längst upp innan all annan kod längst upp(var dis;) och sedan ge den värdet i create() metoden(dis = this;). På så sätt kan man magiskt sätt använda dis inuti funktionerna. Kolla gjärna min kod för klarare exempel.
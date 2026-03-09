# Proscreen DS — BrightSign HTML5 -validointitesti

Yksinkertainen HTML5-testisovellus BrightSign-mediasoittimen raudan ja Chromium-moottorin validointiin.

## Mikä tämä on?

Tämä **ei ole** varsinainen digital signage -sovellus. Tämä on puhdas tekninen testi, jolla validoidaan:

- BrightSign-laitteen HTML5/Chromium-moottorin toimivuus
- Kuva- ja animaatiosisällön renderöinti LED-näytöllä
- 24/7 pitkäaikaiskestävyys (muistivuodot, kaatumiset)
- Verkkopohjainen sisällönlataus (URL → näyttö)

## Ominaisuudet

| Ominaisuus | Kuvaus |
|---|---|
| **5 testislotia** | Värigradi, kontrasti, placeholder, 2× Canvas-animaatio |
| **6s sykli** | Jokainen sisältö näkyy 6 sekuntia |
| **Fade-siirtymä** | 0.6s CSS opacity transition |
| **Diagnostiikka** | Uptime, luuppilaskuri, muistinkäyttö (`?debug=true`) |
| **Error recovery** | Automaattinen palautus virhetilanteesta |
| **Auto-reload** | Sivu lataa itsensä uudelleen klo 03:00 (>4h uptimen jälkeen) |
| **Fallback** | Proscreen-brändätty tausta, ei koskaan mustaa ruutua |

## Käyttöönotto

### 1. Deploy staattisena sivuna

Tiedosto `index.html` toimii sellaisenaan millä tahansa staattisella hostingilla:

**Vercel:**
```bash
npx vercel --prod
```

**Netlify:**
```bash
npx netlify deploy --prod --dir=.
```

**Tai mikä tahansa HTTP-palvelin:**
```bash
python3 -m http.server 8080
```

### 2. Konfiguroi BrightSign

1. Avaa **BrightAuthor:connected**
2. Luo uusi presentaatio → HTML5-sivu
3. Aseta URL: `https://ds-test.proscreen.fi` (tai oma deploy-URL)
4. Julkaise laitteelle

### 3. Diagnostiikkatila

Lisää URL:iin `?debug=true` nähdäksesi diagnostiikka-overlayn:

```
https://ds-test.proscreen.fi?debug=true
```

Overlay näyttää:
- Käynnissäoloaika (uptime)
- Luuppikierrosten määrä
- Nykyinen aika
- Muistinkäyttö (JS heap)
- Viimeisimmän vaihdon ajankohta

## Tekniset tiedot

- **Yksi tiedosto**: Kaikki CSS ja JavaScript inline `index.html`-tiedostossa
- **Ei riippuvuuksia**: Ei npm, ei build-työkaluja, ei frameworkeja
- **BrightSign-yhteensopiva**: ES6, perus-CSS, ei kokeellisia API:ja
- **Muistinhallinta**: Canvas-animaatiot pysäytetään kun slide ei ole aktiivinen
- **Ei ääntä**: Ei mitään audio-elementtejä

## Testiaineistot

| # | Tyyppi | Sisältö | Testaa |
|---|---|---|---|
| 1 | Staattinen Canvas | RGB-värigradi + teksti | Värien renderöinti |
| 2 | Staattinen Canvas | Valkoinen/musta + harmaasävypalkit | Kontrasti LED-näytöllä |
| 3 | Staattinen Canvas | Proscreen-brändätty placeholder | Tekstin ja kehyksen piirto |
| 4 | Canvas-animaatio | Liikkuvat väripalkit | requestAnimationFrame, sulavuus |
| 5 | Canvas-animaatio | Pyörivät ympyrät | Jatkuva animaatio, suorituskyky |

## Hyväksymiskriteerit (2–4 viikon testi)

| Kohde | Raja |
|---|---|
| 24/7-vakaus | Ei kaatumisia 7 vuorokauden aikana |
| Muistinkäyttö | Ei jatkuvaa kasvua |
| Animaatiot | Sulava, ei pätkimistä |
| Kuvan renderöinti | Oikeat värit, ei vääristymiä |
| Siirtymät | Sujuva fade, ei mustaa ruutua |
| Uptime | Diagnostiikka näyttää yhtäjaksoisen ajon |

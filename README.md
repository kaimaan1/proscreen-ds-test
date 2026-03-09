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
| **7 testislotia** | Värigradi, kontrasti, testikuva, placeholder, testivideo, 2× Canvas-animaatio |
| **Kuva/videotuki** | JPG/PNG-kuvat ja MP4-videot `assets/`-kansiosta |
| **6s sykli** | Jokainen sisältö näkyy 6 sekuntia |
| **Fade-siirtymä** | 0.6s CSS opacity transition |
| **Diagnostiikka** | Uptime, luuppilaskuri, muistinkäyttö (`?debug=true`) |
| **Error recovery** | Automaattinen palautus virhetilanteesta |
| **Auto-reload** | Sivu lataa itsensä uudelleen klo 03:00 (>4h uptimen jälkeen) |
| **Fallback** | Proscreen-brändätty tausta, ei koskaan mustaa ruutua |

## Käyttöönotto

### 1. Deploy GitHub Pagesiin

Repo sisältää valmiin GitHub Actions -workflown (`.github/workflows/deploy.yml`).

1. Mene repo → **Settings** → **Pages** → Source: **GitHub Actions**
2. Pushaa `main`-branchiin → deploy käynnistyy automaattisesti
3. Sivusto löytyy osoitteesta: `https://<user>.github.io/<repo>/`

**Tai lokaali testaus:**
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
| 1 | Canvas | RGB-värigradi + teksti | Värien renderöinti |
| 2 | Canvas | Valkoinen/musta + harmaasävypalkit | Kontrasti LED-näytöllä |
| 3 | **Kuva (JPG)** | `assets/test-image.jpg` | Kuvan lataus verkosta, renderöinti |
| 4 | Canvas | Proscreen-brändätty placeholder | Tekstin ja kehyksen piirto |
| 5 | **Video (MP4)** | `assets/test-video.mp4` | Videon toisto, H.264-dekoodaus |
| 6 | Canvas-animaatio | Liikkuvat väripalkit | requestAnimationFrame, sulavuus |
| 7 | Canvas-animaatio | Pyörivät ympyrät | Jatkuva animaatio, suorituskyky |

### Omien aineistojen lisääminen

1. Lisää kuvat/videot `assets/`-kansioon (1920×1080, landscape)
2. Muokkaa `index.html`-tiedoston `PLAYLIST`-taulukkoa:

```javascript
// Kuva:
{ type: 'image', name: 'Mainoskuva', src: 'assets/mainos.jpg' }

// Video:
{ type: 'video', name: 'Promo', src: 'assets/promo.mp4' }
```

Jos tiedosto puuttuu, näytetään automaattisesti Proscreen-brändätty fallback.

## Hyväksymiskriteerit (2–4 viikon testi)

| Kohde | Raja |
|---|---|
| 24/7-vakaus | Ei kaatumisia 7 vuorokauden aikana |
| Muistinkäyttö | Ei jatkuvaa kasvua |
| Animaatiot | Sulava, ei pätkimistä |
| Kuvan renderöinti | Oikeat värit, ei vääristymiä |
| Siirtymät | Sujuva fade, ei mustaa ruutua |
| Uptime | Diagnostiikka näyttää yhtäjaksoisen ajon |

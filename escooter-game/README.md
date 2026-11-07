# 🛴 Scooter Rush

Ein 3D-Fun-Game für **Android und iOS**: Du fährst mit deinem E-Trottinett über Straßen, durch Einkaufszentren und Supermärkte, sammelst Münzen und die Sachen auf deiner Einkaufsliste ein und kommst vor Ablauf der Zeit ins Ziel.

Gebaut mit **Three.js** (3D-Grafik) + **Vite** und als native App verpackt mit **Capacitor** (ein Code für Android & iOS). Alle Grafiken und Sounds werden im Code erzeugt, es gibt also keine externen Assets.

## Features

- **4 Kameraansichten**, jederzeit umschaltbar (🎥-Button oder Taste `C` / `1`–`4`):
  - **3D**: Verfolger-Kamera von hinten
  - **Ego**: First-Person-Sicht vom Lenker aus
  - **Seite**: Seitenansicht wie bei einem Side-Scroller, die Gebäude auf der Kameraseite werden ausgeblendet
  - **2D**: Draufsicht von oben (orthografisch)
- **8 Levels** in drei Welten: 🛣️ Straße (Verkehr, Zebrastreifen, Baustellen), 🏬 Mall (Shops, Kioske, Schiebetüren, Fußgänger) und 🛒 Supermarkt (Regalgänge, Einkaufswagen, nasse Böden). Dazu ein Nachtlevel mit Laternen und Scheinwerfer.
- **Einkaufsliste** pro Level (🍎 🍩 🛍️ 🎁 📱 👟 🍕)
- **Power-ups**: 🧲 Magnet, 🛡️ Schutzschild, 🚀 Turbo (rammt kleine Hindernisse weg), ⭐ Superstern
- **Akku-System** 🔋: Gas verbraucht Strom, mit leerem Akku fährst du langsam. Unterwegs liegen Batterien.
- **Sprünge und Rampen** mit Air-Bonus, **Combo-Multiplikator** bis x5
- **3-Sterne-Wertung**: ⭐ Ziel erreicht · ⭐⭐ Einkaufsliste komplett · ⭐⭐⭐ Punkteziel erreicht
- Level werden nacheinander freigeschaltet, Rekorde werden lokal gespeichert
- Touch-Steuerung, Haptik-Feedback (Capacitor Haptics), Android-Zurück-Taste pausiert das Spiel, Safe-Area-Support (Notch)

## Steuerung

| Aktion | Touch | Tastatur |
|---|---|---|
| Lenken | ◀ ▶ | ← → / A D |
| Gas | ⚡ | ↑ / W |
| Bremsen | ⏬ | ↓ / S |
| Springen | ⤴ | Leertaste |
| Kamera | 🎥 | C, 1–4 |
| Pause | II | P / Esc |

Auf Touch-Geräten ist **Auto-Gas** voreingestellt (das Trotti fährt von selbst mit Reisegeschwindigkeit). Du kannst es in den Einstellungen ausschalten.

## Entwickeln & im Browser testen

```bash
cd escooter-game
npm install
npm run dev        # http://localhost:5173 (auch im Handy-Browser im selben WLAN)
```

## Schnell aufs Handy

- **Android, fertige APK:** GitHub baut sie bei jedem Push automatisch (Workflow *Scooter Rush – Android APK*). Im Tab **Actions** den letzten Lauf öffnen und unter *Artifacts* `scooter-rush-apk` herunterladen. Das ZIP enthält `scooter-rush.apk`. Die Datei aufs Handy bringen und öffnen; die Installation aus unbekannten Quellen musst du dabei einmal erlauben.
- **Ohne Installation (Android & iPhone):** `npm run build:single` erzeugt `dist-single/scooter-rush.html`, das ganze Spiel in einer einzigen Datei. Auf einen Webserver legen, im Handy-Browser öffnen und *Zum Home-Bildschirm hinzufügen*.

## Android-App bauen

Voraussetzung: [Android Studio](https://developer.android.com/studio) mit Android SDK.

```bash
npm run android    # baut das Web-Bundle, synchronisiert und öffnet Android Studio
```

In Android Studio ▶ *Run* klicken (Gerät oder Emulator), oder für den Play Store *Build → Generate Signed App Bundle*.

## iOS-App bauen

Voraussetzung: ein Mac mit Xcode.

```bash
npm run ios        # baut, synchronisiert und öffnet Xcode
```

In Xcode unter *Signing & Capabilities* dein Team auswählen, dann ▶ *Run* auf dem iPhone oder im Simulator. Für den App Store: *Product → Archive*.

> Nach jeder Code-Änderung reicht `npm run cap:sync`, damit die nativen Projekte das neue Web-Bundle bekommen.

Die App ist auf dem Handy auf **Querformat** eingestellt (Android `sensorLandscape`, auf dem iPhone nur Landscape). Im Browser läuft sie auch im Hochformat.

## Projektstruktur

```
escooter-game/
├── index.html            # UI: Menüs, HUD, Touch-Buttons
├── src/
│   ├── main.js           # Game-Loop, Physik, Kameras, Kollisionen, UI-Logik
│   ├── world.js          # Level-Generator (Straße/Mall/Supermarkt, Hindernisse, Items)
│   ├── levels.js         # Die 8 Level-Definitionen. Hier neue Levels anlegen!
│   ├── models.js         # Low-Poly-Modelle (Trotti, Autos, Leute, Wagen, Items …)
│   ├── textures.js       # Prozedurale Canvas-Texturen
│   ├── audio.js          # WebAudio-Synth für Soundeffekte und Motorsound
│   └── style.css
├── capacitor.config.json # App-ID ch.scooterrush.game
├── android/              # Natives Android-Projekt (Capacitor)
└── ios/                  # Natives iOS-Projekt (Capacitor)
```

### Eigenes Level hinzufügen

In `src/levels.js` einen Eintrag anhängen. Segmentlängen müssen Vielfache von 40 sein:

```js
{
  name: 'Mein Level', desc: 'Beschreibung',
  segments: [{ type: 'street', len: 200 }, { type: 'mall', len: 400 }],
  sky: '#8fd3ff', night: false, density: 0.9, traffic: 0.5, time: 90, target: 3000, seed: 123,
  list: { gift: 3 }, pool: ['gift', 'bag', 'phone'],
}
```

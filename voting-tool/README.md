# App Feature Voting Tool

Ein modernes, minimalistisches Online-Voting-Tool für App-Feature-Vorschläge.

## Features

- ✨ **App-Auswahl**: Wähle aus verschiedenen Apps aus
- 💡 **Vorschläge einreichen**: Reiche neue Feature-Ideen ein
- 🗳️ **Voting**: Vote für bestehende Vorschläge (max. 1 Vote pro Vorschlag)
- 🎨 **Flat Design**: Modernes, minimalistisches Interface
- 📱 **Responsive**: Funktioniert auf Desktop und Mobile
- 🔐 **Keine Anmeldung**: Funktioniert ohne Account-Zwang

## Tech Stack

- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Backend**: Express.js (Serverless Functions)
- **Database**: Firebase Firestore
- **Deployment**: Vercel

## Setup

### 1. Firebase einrichten

1. Erstelle ein neues Firebase-Projekt
2. Aktiviere Firestore Database
3. Erstelle einen Service Account Key
4. Lade die Service Account JSON herunter

### 2. Environment Variables

Kopiere `.env.example` zu `.env` und fülle die Werte aus:

```bash
cp .env.example .env
```

### 3. Dependencies installieren

```bash
npm install
```

### 4. Demo Apps erstellen (optional)

```bash
npm run init-firebase
```

### 5. Lokal testen

```bash
npm run dev
```

### 6. Vercel Deployment

1. Installiere Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel --prod`
4. Setze Environment Variables in Vercel Dashboard

## Firestore Datenbank Schema

### Collections

```
apps/
  - id (auto)
  - name: string
  - description: string

suggestions/
  - id (auto)
  - appId: string
  - title: string
  - description: string
  - votes: number
  - createdAt: timestamp

votes/
  - id (auto)
  - suggestionId: string
  - userFingerprint: string (IP + User-Agent hash)
  - timestamp: timestamp
```

## API Endpoints

- `GET /api/apps` - Alle Apps abrufen
- `GET /api/apps/:appId/suggestions` - Vorschläge für eine App
- `POST /api/apps/:appId/suggestions` - Neuen Vorschlag erstellen
- `POST /api/suggestions/:suggestionId/vote` - Für Vorschlag voten
- `GET /api/suggestions/:suggestionId/voted` - Prüfen ob User bereits gevotet hat

## License

MIT
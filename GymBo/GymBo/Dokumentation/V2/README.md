# GymBo V2 - Dokumentation

**Stand:** 2025-10-22  
**Version:** 2.0.0-alpha  
**Status:** ✅ MVP funktionsfähig

---

## 📖 Dokumentations-Übersicht

### ⭐ START HIER
- **[CURRENT_STATE.md](./CURRENT_STATE.md)** - Aktueller Implementierungsstatus (was funktioniert)
- **[TODO.md](./TODO.md)** - Priorisierte Aufgaben (was als nächstes)

### 📋 Architektur & Design
- **[TECHNICAL_CONCEPT_V2.md](./TECHNICAL_CONCEPT_V2.md)** - Clean Architecture Specs (vollständig)
- **[UX_CONCEPT_V2.md](./UX_CONCEPT_V2.md)** - UX/UI Design & User Flows

### 📚 Weitere Dokumentation
- **[V2_CLEAN_ARCHITECTURE_ROADMAP.md](./V2_CLEAN_ARCHITECTURE_ROADMAP.md)** - Migrations-Roadmap
- **[V2_MASTER_PROGRESS.md](./V2_MASTER_PROGRESS.md)** - Sprint-Progress
- **[SPRINT_*.md](./SPRINT_1_1_PROGRESS.md)** - Sprint-Reports

### 🗄️ Archiviert
- **[Archive/ACTIVE_WORKOUT_REDESIGN.md](./Archive/ACTIVE_WORKOUT_REDESIGN.md)** - Design-Prozess (historisch)

---

## 🚀 Quick Start

**Neuer Entwickler:**
1. Lies `CURRENT_STATE.md` (10 Min) - Was ist implementiert?
2. Lies `TECHNICAL_CONCEPT_V2.md` Sections 1-3 (30 Min) - Wie funktioniert es?
3. Öffne Xcode, Run (⌘R), teste Session Start
4. Lies `TODO.md` (5 Min) - Was kommt als nächstes?

**Neue Feature implementieren:**
1. Checke `TODO.md` für Priorität
2. Folge Clean Architecture Pattern aus `TECHNICAL_CONCEPT_V2.md`
3. Update `CURRENT_STATE.md` wenn fertig
4. Add Task in `TODO.md` wenn neue TODOs entstehen

---

## 📊 Projekt-Status

### ✅ Fertig (Funktioniert)
- Clean Architecture Foundation (4 Layers)
- Session Management (Start, Complete Set, End)
- Active Workout UI (ScrollView Design)
- Rest Timer (conditional, 90s Countdown)
- SwiftData Persistence
- Session Restoration

### 🔴 Kritisch (Nächste Steps)
- Exercise Names (aktuell "Übung 1")
- Workout Repository (aktuell Test-Daten)
- Session History

### 🟡 Nice-to-Have (Später)
- Statistics & Charts
- Workout Builder
- Profile & Settings

---

## 🏗️ Architektur-Überblick

```
Domain (Business Logic)
├── Entities (DomainWorkoutSession, SessionExercise, SessionSet)
├── Use Cases (StartSession, CompleteSet, EndSession)
└── Repository Protocols (Contracts)

Data (Persistence)
├── Repositories (SwiftDataSessionRepository)
├── Mappers (SessionMapper - Domain ↔ Entity)
└── SwiftData Entities (@Model)

Presentation (UI)
├── Stores (SessionStore - Feature Store Pattern)
├── Views (ActiveWorkoutSheetView, TimerSection, CompactExerciseCard)
└── Services (RestTimerStateManager)

Infrastructure (Framework Isolation)
└── DI (DependencyContainer)
```

**Dependency Rule:** Abhängigkeiten zeigen nach innen (Domain hat keine Framework-Dependencies)

---

## 🎨 UI Design

**Active Workout:**
- ScrollView mit ALLEN Übungen (nicht TabView)
- Timer Section (conditional, schwarzer Hintergrund)
- Compact Exercise Cards (39pt corner radius)
- Bottom Action Bar (Repeat, Add, Reorder)
- Eye-Icon Toggle (Show/Hide completed)

**Details:** Siehe `CURRENT_STATE.md` Section "UI Design Specs"

---

## 🧪 Testing

**Domain Layer:** 44 Tests (Use Cases)  
**Integration Tests:** 0  
**UI Tests:** 0  

**TODO:** Siehe `TODO.md` Section "Testing"

---

## 📝 Conventions

### Code Style
- Swift Standard Style
- No Magic Numbers (use enums)
- German UI Text
- English Code Comments

### Naming
- Domain Entities: `Domain*` prefix (e.g., `DomainWorkoutSession`)
- Use Cases: `*UseCase` suffix (e.g., `StartSessionUseCase`)
- Stores: `*Store` suffix (e.g., `SessionStore`)
- Repositories: `*Repository` suffix

### File Structure
```
Domain/
├── Entities/
├── UseCases/
│   └── Session/
└── RepositoryProtocols/

Data/
├── Repositories/
└── Mappers/

Presentation/
├── Stores/
├── Services/
└── Views/
    └── [Feature]/
        └── Components/
```

---

## 🐛 Bug Reports

**Bekannte Bugs:** Keine (alle gefixt!)

**Neue Bugs melden:**
1. Beschreibe Reproduktions-Schritte
2. Console Logs anhängen
3. Screenshots/Videos wenn möglich
4. Add to `TODO.md` mit 🔴 KRITISCH Label

---

## 📚 Weitere Ressourcen

**Clean Architecture:**
- Uncle Bob's Blog: https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html
- iOS Clean Architecture: https://tech.olx.com/clean-architecture-and-mvvm-on-ios-c9d167d9f5b3

**SwiftData:**
- Apple Docs: https://developer.apple.com/documentation/swiftdata

**SwiftUI:**
- Apple Docs: https://developer.apple.com/documentation/swiftui

---

## 🤝 Contributing

**Before implementing:**
1. Check `TODO.md` für Priorität
2. Lese `TECHNICAL_CONCEPT_V2.md` für Architektur
3. Folge Clean Architecture Patterns

**After implementing:**
1. Update `CURRENT_STATE.md`
2. Update `TODO.md`
3. Add Tests (Domain Layer minimum)
4. Build ohne Warnings

---

**Letzte Aktualisierung:** 2025-10-22 22:40  
**Maintainer:** Ben Kohler

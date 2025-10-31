# GymBo V2 - TODO Liste

**Stand:** 2025-10-22 (End of Day)  
**MVP Status:** ✅ Funktionsfähig (Session Management + Active Workout UI)  
**Letzte Änderungen:** orderIndex Bug-Fix, @Observable Migration, UI Cleanup

---

## 📝 Session Notes (2025-10-22)

### Erledigte Fixes heute:
1. ✅ **orderIndex Bug** - Sets/Exercises haben jetzt explizite Reihenfolge (SwiftData @Relationship hat keine garantierte Order!)
2. ✅ **@Observable Migration** - Von ObservableObject zu iOS 17+ @Observable für bessere Reaktivität
3. ✅ **Timer Auto-Start** - Timer startet nicht mehr automatisch beim Workout-Launch
4. ✅ **Timer Always Visible** - TimerSection zeigt immer entweder Rest Timer ODER Workout Duration
5. ✅ **Doppel-Tap Bug** - Sets können jetzt mit einem Klick abgehakt werden
6. ✅ **UI Cleanup** - Duplicate kg/reps Labels entfernt

### Wichtige Learnings:
- **SwiftData @Relationship Arrays haben KEINE garantierte Reihenfolge!** → Immer `orderIndex` verwenden
- **@Observable ist besser als ObservableObject** für komplexe State-Updates in SwiftUI
- **TextField in ForEach kann zu Crashes führen** → Erstmal als separates Feature planen
- **UUIDs statt Array-Indices** verwenden für eindeutige Identifikation (wichtig für Reordering!)

### Offene TODOs für nächste Session:
- Weight/Reps editierbar machen (neuer Ansatz mit Sheet/Alert statt inline TextFields)
- Exercise Names aus Repository laden (aktuell: "Übung 1", "Übung 2")
- UpdateSetUseCase implementieren für persistente Weight/Reps Änderungen

---

## 🎯 Kurzfristig (Nächste Session)

### 1. Exercise Names anzeigen (30 Min) 🔴 KRITISCH
**Problem:** Aktuell "Übung 1", "Übung 2" (Platzhalter)  
**Lösung (Quick Fix):**
```swift
// In StartSessionUseCase.swift - createTestExercises()
let exerciseNames = ["Bankdrücken", "Lat Pulldown", "Kniebeugen"]

return exerciseNames.enumerated().map { index, name in
    DomainSessionExercise(
        exerciseId: UUID(),
        exerciseName: name,  // ← NEU: Name im Entity
        sets: [...]
    )
}

// In CompactExerciseCard.swift
exerciseName: exercise.exerciseName ?? "Übung \(index + 1)"
```

**Dateien:**
- `/Domain/Entities/SessionExercise.swift` - Add `exerciseName: String?`
- `/Domain/UseCases/Session/StartSessionUseCase.swift` - Add names to test data
- `/Presentation/Views/ActiveWorkout/Components/CompactExerciseCard.swift` - Use name

---

### 2. Equipment anzeigen (20 Min) 🟡 OPTIONAL
**Problem:** Equipment-Feld vorhanden aber nil  
**Lösung:**
```swift
// In StartSessionUseCase
exerciseName: "Bankdrücken",
equipment: "Barbell",  // ← NEU

// In CompactExerciseCard
equipment: exercise.equipment
```

**Dateien:**
- `/Domain/Entities/SessionExercise.swift` - Add `equipment: String?`
- Update test data

---

### 3. Quick-Add Set Funktionalität (1 Stunde) 🟡 NICE-TO-HAVE
**Aktuell:** TextField vorhanden, aber Regex-Parser nicht verbunden  
**TODO:**
- Verbinde `handleQuickAdd()` in CompactExerciseCard
- Erstelle `AddSetUseCase`
- Update UI nach Set-Addition

**Code:**
```swift
// Bereits vorhanden in CompactExerciseCard.swift:
private func parseSetInput(_ input: String) -> (weight: Double, reps: Int)? {
    let pattern = #"(\d+(?:\.\d+)?)\s*[xX×]\s*(\d+)"#
    // ... Regex matching
}

// TODO: Callback hinzufügen
CompactExerciseCard(
    onQuickAdd: { weight, reps in
        // Add set via use case
    }
)
```

---

## 🚀 Mittelfristig (Diese Woche)

### 4. Workout Repository (4-5 Stunden) 🔴 WICHTIG
**Ziel:** Echte Workouts statt Test-Daten

**Schritte:**
1. **Workout Entity** (Domain)
   ```swift
   struct DomainWorkout {
       let id: UUID
       var name: String
       var exercises: [DomainWorkoutExercise]  // Template!
   }
   
   struct DomainWorkoutExercise {
       let exerciseId: UUID
       var targetSets: Int
       var targetWeight: Double?
       var targetReps: Int?
       var restTime: TimeInterval
   }
   ```

2. **WorkoutRepositoryProtocol** (Domain)
   ```swift
   protocol WorkoutRepositoryProtocol {
       func fetch(id: UUID) async throws -> DomainWorkout?
       func fetchAll() async throws -> [DomainWorkout]
       func save(_ workout: DomainWorkout) async throws
   }
   ```

3. **SwiftDataWorkoutRepository** (Data)
   - WorkoutEntity (@Model)
   - WorkoutMapper
   - Repository Implementation

4. **StartSessionUseCase Update**
   ```swift
   // Ersetze createTestExercises() durch:
   let workout = try await workoutRepository.fetch(id: workoutId)
   let sessionExercises = workout.exercises.map { templateExercise in
       DomainSessionExercise(
           exerciseId: templateExercise.exerciseId,
           sets: (0..<templateExercise.targetSets).map { _ in
               DomainSessionSet(
                   weight: templateExercise.targetWeight ?? 0,
                   reps: templateExercise.targetReps ?? 0
               )
           },
           restTimeToNext: templateExercise.restTime
       )
   }
   ```

5. **Workout Picker in HomeView**
   - Liste aller Workouts
   - "Start" Button pro Workout

**Dateien:**
- `/Domain/Entities/Workout.swift` - NEW
- `/Domain/RepositoryProtocols/WorkoutRepositoryProtocol.swift` - NEW
- `/Data/Repositories/SwiftDataWorkoutRepository.swift` - NEW
- `/Data/Mappers/WorkoutMapper.swift` - NEW
- `/Data/SwiftDataEntities.swift` - Add WorkoutEntity
- Update `StartSessionUseCase`, `HomeView`

---

### 5. Exercise Repository (3-4 Stunden) 🔴 WICHTIG
**Ziel:** Exercise Database (Namen, Equipment, Kategorien)

**Schritte:**
1. **Exercise Entity** (Domain)
   ```swift
   struct DomainExercise {
       let id: UUID
       var name: String
       var equipment: EquipmentType
       var category: ExerciseCategory
       var muscleGroups: [MuscleGroup]
   }
   
   enum EquipmentType: String {
       case barbell, dumbbell, cable, machine, bodyweight
   }
   ```

2. **ExerciseRepository**
   - Seed Data (häufige Übungen)
   - Search/Filter Funktionalität

3. **Integration**
   - Load exercise names in ActiveWorkoutSheetView
   - Show equipment in CompactExerciseCard

---

### 6. Session History (2 Stunden) 🟡 NICE-TO-HAVE
**Ziel:** Vergangene Workouts anzeigen

**Schritte:**
1. `fetchRecentSessions()` in SessionRepository
2. HistoryView mit Liste
3. Session-Detail-View (read-only)

**UI:**
```
Training Tab → Segment "Verlauf"
└── List
    ├── Workout 1 (heute, 45 Min, 12 Sets)
    ├── Workout 2 (gestern, 1h 02 Min, 18 Sets)
    └── ...
```

---

## 📊 Langfristig (Nächste 2-4 Wochen)

### 7. Reordering: Sets & Übungen (2-3 Stunden) 🔴 WICHTIG
**Ziel:** Nutzer kann Reihenfolge von Sets und Übungen ändern

**Wichtig:**
- ⚠️ **NIEMALS Index verwenden** für Identifikation (siehe Set-Completion Bug!)
- ✅ **IMMER UUID verwenden** für eindeutige Identifikation
- Neue Reihenfolge muss im Workout persistiert werden

**Schritte:**
1. **Add orderIndex to Entities**
   ```swift
   // Domain/Entities/SessionExercise.swift
   struct DomainSessionExercise {
       let id: UUID
       var orderIndex: Int  // ← NEU: Explizite Reihenfolge
       // ...
   }
   
   // Domain/Entities/SessionSet.swift
   struct DomainSessionSet {
       let id: UUID
       var orderIndex: Int  // ← NEU: Explizite Reihenfolge
       // ...
   }
   ```

2. **Add ReorderExerciseUseCase**
   ```swift
   protocol ReorderExerciseUseCase {
       func execute(
           sessionId: UUID,
           exerciseId: UUID,
           newIndex: Int
       ) async throws -> DomainWorkoutSession
   }
   ```

3. **Add ReorderSetUseCase**
   ```swift
   protocol ReorderSetUseCase {
       func execute(
           sessionId: UUID,
           exerciseId: UUID,
           setId: UUID,
           newIndex: Int
       ) async throws -> DomainWorkoutSession
   }
   ```

4. **UI Implementation**
   ```swift
   // In ActiveWorkoutSheetView.swift
   ForEach(session.exercises.sorted(by: { $0.orderIndex < $1.orderIndex })) { exercise in
       CompactExerciseCard(...)
   }
   .onMove { indices, newOffset in
       Task {
           // Get exerciseId (NOT index!)
           let exerciseId = session.exercises[indices.first!].id
           await sessionStore.reorderExercise(
               exerciseId: exerciseId,
               newIndex: newOffset
           )
       }
   }
   
   // In CompactExerciseCard.swift
   ForEach(exercise.sets.sorted(by: { $0.orderIndex < $1.orderIndex })) { set in
       CompactSetRow(set: set)
   }
   .onMove { indices, newOffset in
       // Get setId (NOT index!)
       let setId = exercise.sets[indices.first!].id
       onReorderSet?(setId, newOffset)
   }
   ```

5. **Persistence**
   - Update SwiftData Entities mit orderIndex
   - Mapper aktualisieren
   - Repository speichert neue Reihenfolge

**Warum orderIndex statt Array-Position?**
- ✅ Explizit persistiert in Datenbank
- ✅ Unabhängig von Filter/Sort in UI
- ✅ Robust bei concurrency
- ✅ Ermöglicht Undo/Redo in Zukunft

**Testing:**
- User verschiebt Übung 3 nach Position 1
- App restart → Reihenfolge bleibt erhalten
- Set-Completion funktioniert weiterhin korrekt

**Dateien:**
- `/Domain/Entities/SessionExercise.swift` - Add orderIndex
- `/Domain/Entities/SessionSet.swift` - Add orderIndex
- `/Domain/UseCases/Session/ReorderExerciseUseCase.swift` - NEW
- `/Domain/UseCases/Session/ReorderSetUseCase.swift` - NEW
- `/Data/SwiftDataEntities.swift` - Update entities
- `/Data/Mappers/SessionMapper.swift` - Map orderIndex
- `/Presentation/Stores/SessionStore.swift` - Add reorder functions
- `/Presentation/Views/ActiveWorkout/ActiveWorkoutSheetView.swift` - Add .onMove
- `/Presentation/Views/ActiveWorkout/Components/CompactExerciseCard.swift` - Add .onMove

---

### 8. Statistics (Phase 3 aus TECHNICAL_CONCEPT_V2.md)
- Workout-Frequenz
- Volumen-Trends
- Personal Records (PRs)
- Charts (SwiftUI Charts)

### 9. Workout Builder (Phase 2 aus UX_CONCEPT_V2.md)
- Drag & Drop Exercises
- Template Management
- Folders

### 9. Profile & Settings
- User Profile
- Rest Timer Defaults
- Theme Settings

### 10. Testing
- Integration Tests (Store + Use Case)
- UI Tests (Critical Flows)
- Performance Tests

---

## 🐛 Bug-Fixes (Alle erledigt!)

- ✅ ~~"Keine Übungen" nach Set-Completion~~ (In-place updates)
- ✅ ~~Rest Timer startet nur einmal~~ (Timer nach jedem Set)

---

## 🔧 Technical Debt

### 1. Ordnerstruktur aufräumen (30 Min) 🟡 OPTIONAL
**Problem:** `GymBo/GymBo/GymBo/` verschachtelt  
**Lösung:** Flache Struktur (NACH MVP stabilisiert)  
**Risiko:** Xcode .pbxproj absolute Pfade könnten brechen

### 2. Logging verbessern (1 Stunde)
**Aktuell:** print() Statements  
**Besser:** Structured Logging mit AppLogger

```swift
AppLogger.session.info("Set completed", metadata: [
    "exerciseId": "\(exerciseId)",
    "setId": "\(setId)"
])
```

### 3. Error Handling verbessern
**Aktuell:** print() bei Fehlern  
**Besser:** User-facing Error Messages

```swift
@Published var errorMessage: String?

// In Store:
catch {
    errorMessage = error.localizedDescription
}

// In View:
.alert("Fehler", isPresented: $showError) {
    Text(sessionStore.errorMessage ?? "Unbekannter Fehler")
}
```

### 4. Preview Data auslagern
**Aktuell:** Preview Helper in Production Code  
**Besser:** Separate Preview Target

---

## 📋 Feature-Priorisierung (Empfehlung)

### Must-Have (MVP Launch)
1. ✅ Session Management ← **FERTIG**
2. ✅ Active Workout UI ← **FERTIG**
3. 🔴 Exercise Names ← **NÄCHSTES**
4. 🔴 Workout Repository ← **DANACH**
5. 🔴 Session History (simple Liste)

### Nice-to-Have (v2.1)
6. Statistics & Charts
7. Workout Builder
8. Exercise Database (erweitert)
9. Profile & Settings

### Future (v2.2+)
10. Cloud Sync
11. Social Features
12. AI Workout Generator
13. Video Tutorials

---

## 🎯 Nächste Session - Quick Win (2 Stunden)

**Ziel:** Exercise Names + Equipment anzeigen

**Checklist:**
- [ ] Add `exerciseName: String?` to SessionExercise
- [ ] Add `equipment: String?` to SessionExercise
- [ ] Update test data in StartSessionUseCase
- [ ] Update CompactExerciseCard to use names
- [ ] Build & Test
- [ ] Screenshot für Dokumentation

**Ergebnis:**
```
Statt: "Übung 1"
Jetzt: "Bankdrücken (Barbell)"
```

---

## 📊 Definition of Done

**Ein Feature ist "fertig" wenn:**
- ✅ Code kompiliert ohne Warnings
- ✅ Feature funktioniert im Simulator
- ✅ Grundlegende Tests vorhanden (Domain Layer)
- ✅ Code folgt Clean Architecture
- ✅ Keine hardcoded Magic Numbers
- ✅ Deutsche Lokalisierung
- ✅ Dokumentation aktualisiert (CURRENT_STATE.md)

---

## 📚 Referenzen

- `CURRENT_STATE.md` - Aktueller Implementierungsstatus
- `TECHNICAL_CONCEPT_V2.md` - Vollständige Architektur
- `UX_CONCEPT_V2.md` - UX/UI Konzept & User Flows
- `ACTIVE_WORKOUT_REDESIGN.md` - Design-Prozess (historisch)

---

**Letzte Aktualisierung:** 2025-10-22 22:40

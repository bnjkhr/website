# GymBo V2.0 - Clean Start Implementation Plan

**Date:** 2025-10-22  
**Decision:** Kill V1 integration attempts, build V2 as standalone app  
**Status:** READY TO START

---

## 🎯 The Clean Start Strategy

### Why Clean Start?

**The Problem with V1/V2 Integration:**
- V1 codebase is 8,000+ LOC of tightly coupled code
- Every V2 change breaks V1 in unexpected ways
- Naming conflicts everywhere (WorkoutSession vs WorkoutSessionV1 vs DomainWorkoutSession)
- Migration is becoming harder than rebuilding

**The Clean Start Approach:**
1. **Archive V1** - Put entire V1 codebase in archive branch
2. **Build V2 Fresh** - Start with what we have (1,847 LOC of clean architecture)
3. **Reuse UI Components** - Copy working UI from v2-ui-experiments
4. **Start Small** - Build ONE feature end-to-end first
5. **Data Migration Later** - Users can export/import workouts when ready

---

## 📊 What We Already Have (V2 Foundation)

### ✅ Complete & Ready

#### Domain Layer (Pure Swift, 100% Tested)
```
GymTracker/Domain/
├── Entities/
│   ├── WorkoutSession.swift           # DomainWorkoutSession (178 LOC)
│   ├── SessionExercise.swift          # DomainSessionExercise (89 LOC)
│   └── SessionSet.swift               # DomainSessionSet (67 LOC)
├── UseCases/Session/
│   ├── StartSessionUseCase.swift      # ✅ Tested
│   ├── CompleteSetUseCase.swift       # ✅ Tested
│   └── EndSessionUseCase.swift        # ✅ Tested
└── RepositoryProtocols/
    └── SessionRepositoryProtocol.swift # Contract defined
```

**Total:** ~800 LOC, 30 unit tests, 100% coverage

#### Data Layer (SwiftData Integration)
```
GymTracker/Data/
├── Entities/
│   ├── WorkoutSessionEntity.swift     # @Model for persistence
│   ├── SessionExerciseEntity.swift    # @Model with relationships
│   └── SessionSetEntity.swift         # @Model
├── Mappers/
│   └── SessionMapper.swift            # Domain ↔ Entity (tested)
└── Repositories/
    └── SwiftDataSessionRepository.swift # Full implementation
```

**Total:** ~600 LOC, 14 integration tests

#### Presentation Layer (Partial)
```
GymTracker/Presentation/
├── Stores/
│   └── SessionStore.swift             # @MainActor store (450 LOC)
└── Views/ActiveWorkout/
    └── [7 UI components from v2-ui-experiments]
```

**Total:** ~450 LOC (store) + 3,762 LOC (UI from experiments)

#### Infrastructure
```
GymTracker/Infrastructure/
└── DI/
    └── DependencyContainer.swift      # Factory methods ready
```

**Total:** ~150 LOC

### ❌ What We DON'T Have Yet

- **No Workout Management** (CRUD for workouts)
- **No Exercise Library** (browse/search exercises)
- **No Home View** (workout list, calendar)
- **No Statistics** (analytics, progress charts)
- **No Settings/Profile**
- **No App Entry Point** for V2 (still points to V1 ContentView)

---

## 🗂️ The Archive Strategy

### Step 1: Archive V1 Codebase

**Create Archive Branch:**
```bash
git checkout master
git checkout -b archive/v1-complete-codebase
git push origin archive/v1-complete-codebase
```

**What Goes in Archive:**
All V1 files (to be removed from main codebase):
- `GymTracker/Models/*` (except shared entities)
- `GymTracker/ViewModels/WorkoutStore.swift`
- `GymTracker/Coordinators/*`
- `GymTracker/Services/*` (V1 services)
- `GymTracker/Views/*` (V1 views)
- `GymTracker/ContentView.swift`
- `GymTracker/SwiftDataEntities.swift` (V1 entities)

**What STAYS (Shared Infrastructure):**
- `GymTracker/HealthKitManager.swift`
- `GymTracker/AppLogger.swift`
- `GymTracker/ExerciseSeeder.swift`
- SwiftData entities for exercises (shared by V1 and V2)

### Step 2: Clean Branch for V2

```bash
git checkout feature/v2-clean-architecture
git checkout -b feature/v2-clean-start

# Remove ALL V1 files
rm -rf GymTracker/Models
rm -rf GymTracker/ViewModels
rm -rf GymTracker/Coordinators
rm -rf GymTracker/Services
rm -rf GymTracker/Views
rm GymTracker/ContentView.swift
rm GymTracker/SwiftDataEntities.swift

# Keep only V2 architecture
# Domain/, Data/, Presentation/, Infrastructure/

git add -A
git commit -m "feat(v2): Clean slate - Remove all V1 code

Archived V1 codebase to archive/v1-complete-codebase

V2 foundation remains:
- Domain layer (800 LOC, 30 tests)
- Data layer (600 LOC, 14 tests)
- Presentation layer (450 LOC store)
- Infrastructure layer (150 LOC DI)

Ready for clean V2 implementation."
```

---

## 🏗️ V2 Clean Implementation Roadmap

### Phase 1: Minimal Viable App (Week 1)

**Goal:** ONE working feature end-to-end - Active Workout

#### Day 1: App Foundation (4h)

**Create New App Entry Point:**
```swift
// GymTracker/GymTrackerAppV2.swift
@main
struct GymTrackerAppV2: App {
    let container: ModelContainer
    let dependencyContainer: DependencyContainer
    
    init() {
        // SwiftData with V2 entities only
        container = try! ModelContainer(for: 
            WorkoutSessionEntity.self,
            SessionExerciseEntity.self,
            SessionSetEntity.self,
            ExerciseEntity.self  // Shared
        )
        
        dependencyContainer = DependencyContainer(
            modelContext: container.mainContext
        )
    }
    
    var body: some Scene {
        WindowGroup {
            MainTabView()
                .modelContainer(container)
                .environmentObject(dependencyContainer)
        }
    }
}
```

**Create Tab Structure:**
```swift
// GymTracker/Presentation/Views/MainTabView.swift
struct MainTabView: View {
    var body: some View {
        TabView {
            HomeViewPlaceholder()
                .tabItem { Label("Home", systemImage: "house") }
            
            ExercisesViewPlaceholder()
                .tabItem { Label("Exercises", systemImage: "figure.run") }
            
            ProgressViewPlaceholder()
                .tabItem { Label("Progress", systemImage: "chart.line.uptrend.xyaxis") }
        }
    }
}

// Placeholder views
struct HomeViewPlaceholder: View {
    var body: some View {
        VStack {
            Text("GymBo V2.0")
                .font(.largeTitle)
            Text("Clean Architecture")
                .foregroundColor(.secondary)
            
            Button("Start Quick Workout") {
                // TODO: Navigate to active workout
            }
            .buttonStyle(.borderedProminent)
        }
    }
}
```

**Files to Create:**
- `GymTrackerAppV2.swift` (new app entry)
- `Presentation/Views/MainTabView.swift`
- `Presentation/Views/Home/HomeViewPlaceholder.swift`
- `Presentation/Views/Exercises/ExercisesViewPlaceholder.swift`
- `Presentation/Views/Progress/ProgressViewPlaceholder.swift`

**Success Criteria:**
- [ ] App launches without V1 code
- [ ] Tab bar visible with 3 tabs
- [ ] No crashes, clean build

---

#### Day 2-3: Active Workout Feature (12h)

**Copy UI from v2-ui-experiments:**
```bash
# Assuming v2-ui-experiments branch has the working UI
git checkout archive/v2-ui-experiments -- \
    GymTracker/Presentation/Views/ActiveWorkout/ActiveWorkoutSheetView.swift \
    GymTracker/Presentation/Views/ActiveWorkout/ExerciseCard.swift \
    GymTracker/Presentation/Views/ActiveWorkout/TimerSection.swift \
    GymTracker/Presentation/Views/ActiveWorkout/CompactSetRow.swift \
    GymTracker/Presentation/Views/ActiveWorkout/DraggableExerciseSheet.swift
```

**Wire SessionStore to UI:**
```swift
// Update GymTrackerAppV2.swift
@StateObject var sessionStore: SessionStore

init() {
    // ... container setup
    _sessionStore = StateObject(wrappedValue: 
        dependencyContainer.makeSessionStore()
    )
}

var body: some Scene {
    WindowGroup {
        MainTabView()
            .environmentObject(sessionStore)
    }
}
```

**Create Session Start Flow:**
```swift
// HomeViewPlaceholder updated
struct HomeViewPlaceholder: View {
    @EnvironmentObject var sessionStore: SessionStore
    @State private var showActiveWorkout = false
    
    var body: some View {
        VStack {
            Button("Start Quick Workout") {
                Task {
                    // Use hardcoded workout ID for MVP
                    await sessionStore.startSession(workoutId: UUID())
                    showActiveWorkout = true
                }
            }
        }
        .sheet(isPresented: $showActiveWorkout) {
            if sessionStore.currentSession != nil {
                ActiveWorkoutSheetView(
                    sessionStore: sessionStore,
                    restTimerManager: RestTimerStateManager()
                )
            }
        }
    }
}
```

**Success Criteria:**
- [ ] Can start a workout session
- [ ] Active workout sheet appears
- [ ] Sets can be marked completed
- [ ] Session persists to SwiftData
- [ ] Can end session

---

#### Day 4: Exercise Library (Minimal) (6h)

**Goal:** Browse exercises to add to quick workout

**Create Exercise Repository:**
```swift
// Domain/RepositoryProtocols/ExerciseRepositoryProtocol.swift
protocol ExerciseRepositoryProtocol {
    func fetchAll() async -> Result<[Exercise], RepositoryError>
    func search(query: String) async -> Result<[Exercise], RepositoryError>
}

// Data/Repositories/SwiftDataExerciseRepository.swift
// Implementation using existing ExerciseEntity
```

**Create Exercise Store:**
```swift
// Presentation/Stores/ExerciseStore.swift
@MainActor
final class ExerciseStore: ObservableObject {
    @Published var exercises: [Exercise] = []
    @Published var isLoading = false
    
    private let repository: ExerciseRepositoryProtocol
    
    func loadExercises() async {
        // Load from repository
    }
}
```

**Simple Exercise List:**
```swift
// Presentation/Views/Exercises/ExerciseListView.swift
struct ExerciseListView: View {
    @StateObject var store: ExerciseStore
    
    var body: some View {
        List(store.exercises) { exercise in
            VStack(alignment: .leading) {
                Text(exercise.name)
                    .font(.headline)
                Text(exercise.muscleGroups.joined(separator: ", "))
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .task {
            await store.loadExercises()
        }
    }
}
```

**Success Criteria:**
- [ ] Can browse 161 exercises
- [ ] Exercise list loads from SwiftData
- [ ] Search works (basic text filter)

---

#### Day 5: End-to-End Testing (6h)

**Manual Test Checklist:**
- [ ] App launches to home screen
- [ ] Start quick workout creates session
- [ ] Active workout UI displays correctly
- [ ] Complete set updates UI + DB
- [ ] Rest timer works
- [ ] Workout duration tracks
- [ ] End session saves to DB
- [ ] Relaunch app shows no active session
- [ ] Browse exercises works
- [ ] Dark mode looks good
- [ ] No crashes, no memory leaks

**Fix Bugs:**
- Document all bugs found
- Fix critical bugs
- Defer minor issues to backlog

**Success Criteria:**
- [ ] Can complete full workout flow without crashes
- [ ] Data persists across app restarts
- [ ] Basic functionality works as designed

---

### Phase 2: Workout Management (Week 2)

#### Day 6-7: Workout CRUD (12h)

**Domain Layer:**
```swift
// Domain/Entities/Workout.swift
struct Workout: Identifiable {
    let id: UUID
    var name: String
    var exercises: [WorkoutExercise]
    var defaultRestTime: TimeInterval
}

// Domain/UseCases/Workout/CreateWorkoutUseCase.swift
// Domain/UseCases/Workout/UpdateWorkoutUseCase.swift
// Domain/UseCases/Workout/DeleteWorkoutUseCase.swift
```

**Data Layer:**
```swift
// Data/Entities/WorkoutEntity.swift (might reuse existing)
// Data/Repositories/SwiftDataWorkoutRepository.swift
```

**Presentation Layer:**
```swift
// Presentation/Stores/WorkoutStore.swift
// Presentation/Views/Workout/WorkoutListView.swift
// Presentation/Views/Workout/WorkoutBuilderView.swift
```

---

#### Day 8-9: Home View with Workouts (12h)

**Replace Placeholder:**
```swift
// Presentation/Views/Home/HomeView.swift
struct HomeView: View {
    @StateObject var workoutStore: WorkoutStore
    @StateObject var sessionStore: SessionStore
    
    var body: some View {
        NavigationStack {
            ScrollView {
                // Recent workouts
                // Quick start buttons
                // Calendar view
                // Stats summary
            }
        }
    }
}
```

**Features:**
- List of saved workouts
- Quick start any workout
- Recent workout sessions
- Calendar with workout markers

---

#### Day 10: Polish & Testing (6h)

- UI polish (animations, haptics)
- Edge case testing
- Performance profiling
- Bug fixes

---

### Phase 3: Statistics & Profile (Week 3)

#### Day 11-13: Statistics View (18h)

**Use Cases:**
- Calculate weekly volume
- Track personal records
- Exercise frequency
- Muscle group balance

**Views:**
- Statistics dashboard
- Progress charts
- Personal records list
- Exercise history

---

#### Day 14-15: Profile & Settings (12h)

**Features:**
- User profile (name, photo)
- App settings
- Units (kg/lbs)
- Theme preferences
- Data export/import

---

### Phase 4: Advanced Features (Week 4)

#### Day 16-18: Rest Timer Integration (18h)

- Move rest timer to Use Cases
- Background timer support
- Notifications
- Live Activities

#### Day 19-20: Polish & Release Prep (12h)

- Final bug fixes
- App icon
- Screenshots
- Release notes

---

## 🎯 MVP Feature Set (What's In, What's Out)

### ✅ MVP Features (Must Have)

**Session Management:**
- [x] Start workout session
- [x] Complete sets
- [x] End session
- [x] Session persistence
- [ ] Rest timer
- [ ] Workout duration tracking

**Workout Management:**
- [ ] Create workout templates
- [ ] Edit workouts
- [ ] Delete workouts
- [ ] Quick start workout

**Exercise Library:**
- [ ] Browse all exercises
- [ ] Search exercises
- [ ] Filter by muscle group
- [ ] Exercise details

**Statistics (Basic):**
- [ ] Workout history
- [ ] Total workouts count
- [ ] Volume per week

**Profile:**
- [ ] User name
- [ ] Preferred units (kg/lbs)

### ⏳ Post-MVP (Nice to Have)

- [ ] Workout folders
- [ ] Exercise templates (superset, dropset)
- [ ] Progress photos
- [ ] Advanced statistics (charts, trends)
- [ ] Exercise video links
- [ ] Social features
- [ ] HealthKit sync
- [ ] Siri shortcuts
- [ ] Apple Watch app

---

## 📦 Shared Infrastructure (Reuse from V1)

### Keep These Files (Already Working)

**Exercise Database:**
- `Resources/exercises.csv` (161 exercises)
- `ExerciseSeeder.swift` (loads CSV into SwiftData)
- `ExerciseEntity.swift` (SwiftData @Model)
- `ExerciseTranslationService.swift`

**Logging:**
- `AppLogger.swift` (OSLog wrapper)

**Data Migration:**
- Keep migration utilities for future V1 → V2 data import

---

## 🧪 Testing Strategy

### Unit Tests (Domain Layer)
- **Target:** 100% coverage
- **Current:** 30 tests (Session Use Cases)
- **TODO:** Add tests for Workout, Exercise Use Cases

### Integration Tests (Data Layer)
- **Target:** 80% coverage
- **Current:** 14 tests (SessionRepository, SessionMapper)
- **TODO:** Add tests for WorkoutRepository, ExerciseRepository

### UI Tests (Critical Flows)
- [ ] Start workout → Complete sets → End session
- [ ] Create workout → Edit → Delete
- [ ] Browse exercises → Add to workout

### Manual Testing
- [ ] Dark mode
- [ ] VoiceOver
- [ ] iPad layout
- [ ] Different screen sizes

---

## 🚀 Migration Path (V1 → V2)

### User Data Migration (Future)

**Option 1: Export/Import**
```
V1 App → Export JSON → V2 App → Import JSON
```

**Option 2: Shared SwiftData Container**
```
Read V1 entities → Map to V2 entities → Save
```

**Decision:** Start with Option 1 (simpler, safer)

---

## 📊 Success Metrics

### Phase 1 (MVP App)
- [ ] App builds without V1 code
- [ ] Can complete full workout session
- [ ] Data persists correctly
- [ ] < 5 crashes per 100 sessions
- [ ] App launch < 2s

### Phase 2 (Workout Management)
- [ ] Can create/edit/delete workouts
- [ ] Workout list loads < 1s
- [ ] Zero data loss

### Phase 3 (Statistics)
- [ ] Statistics calculate correctly
- [ ] Charts render smoothly (60fps)

### Phase 4 (Release)
- [ ] Test coverage > 70%
- [ ] All MVP features work
- [ ] App Store ready

---

## 🛠️ Development Workflow

### Daily Routine

**Morning:**
1. Review yesterday's progress
2. Update this document with status
3. Plan today's tasks (max 3 major tasks)

**During Development:**
1. Write test first (TDD for Use Cases)
2. Implement feature
3. Manual test in simulator
4. Commit with descriptive message

**Evening:**
1. Run full test suite
2. Check for memory leaks (Instruments)
3. Document tomorrow's tasks
4. Commit progress

### Git Workflow

**Branches:**
- `feature/v2-clean-start` - Main V2 development
- `archive/v1-complete-codebase` - V1 backup
- `archive/v2-ui-experiments` - UI prototypes

**Commits:**
```bash
# Feature
feat(domain): Add CreateWorkoutUseCase with validation

# Fix
fix(ui): Fix set completion not updating UI

# Test
test(data): Add WorkoutRepository integration tests

# Docs
docs(v2): Update clean start plan with Day 3 progress
```

---

## 📝 Daily Progress Tracking

### Day 1 - [DATE] - App Foundation
- [ ] Create GymTrackerAppV2.swift
- [ ] Create MainTabView
- [ ] Create placeholder views
- [ ] App builds and launches
- **Blockers:** [None yet]
- **Notes:** [Add notes here]

### Day 2 - [DATE] - Active Workout UI
- [ ] Copy UI from v2-ui-experiments
- [ ] Wire SessionStore
- [ ] Test session start
- **Blockers:**
- **Notes:**

[Continue for each day...]

---

## 🎓 Lessons Learned

### From V1/V2 Integration Attempts

**What Didn't Work:**
- ❌ Trying to make V1 and V2 coexist in same codebase
- ❌ Renaming entities (WorkoutSession → WorkoutSessionV1 → DomainWorkoutSession)
- ❌ Incremental migration (too many breaking changes)

**What Works Better:**
- ✅ Clean slate with V2 only
- ✅ Build ONE feature end-to-end first
- ✅ Reuse UI components (tested separately)
- ✅ Archive V1, don't delete
- ✅ Data migration comes last

---

## 📚 References

**V2 Documentation:**
- `TECHNICAL_CONCEPT_V2.md` - Architecture details
- `UX_CONCEPT_V2.md` - UI/UX design
- `ACTIVE_WORKOUT_REDESIGN.md` - Active workout feature spec
- `DATAFLOW_KONZEPT_V2.md` - State management

**V2 Code:**
- `Domain/` - Business logic (800 LOC, tested)
- `Data/` - Persistence (600 LOC, tested)
- `Presentation/` - UI & Stores (450 LOC)
- `Infrastructure/` - DI Container (150 LOC)

**V1 Archive:**
- `archive/v1-complete-codebase` branch

---

## ❓ Open Questions

1. **Exercise Images:** Where to store? Bundle vs Download?
2. **HealthKit:** MVP or Post-MVP?
3. **Cloud Sync:** iCloud or custom backend?
4. **Analytics:** Which events to track?

---

**Last Updated:** 2025-10-22  
**Status:** 🟢 READY TO START  
**Next Step:** Day 1 - Create App Foundation


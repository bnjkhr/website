# V1/V2 Coexistence Strategy

**Date:** 2025-10-22  
**Branch:** `feature/v2-clean-architecture`  
**Status:** ACTIVE (Phase 1 Complete, V1 Still Running)

---

## Overview

During the V2 Clean Architecture implementation (Phase 1: Sprint 1.1-1.4), we are building the new architecture **alongside** the existing V1 codebase. This allows for:

- ✅ Incremental migration (no "big bang" rewrite)
- ✅ Always-shippable code (V1 continues working)
- ✅ Isolated testing of V2 components
- ✅ Reduced risk of breaking production features

---

## Current State (Post Sprint 1.4)

### V1 Legacy Architecture (ACTIVE - Running in Production)

**Status:** Fully functional, handling all user-facing features

**Key Components:**
- `WorkoutStore` (ViewModels/WorkoutStore.swift) - 2000+ LOC monolith
- `WorkoutStoreCoordinator` - Session coordination
- `WorkoutDataService` - Data operations
- V1 Views: `ContentView`, `HomeView`, `WorkoutDetailView`, etc.
- V1 Models: `Workout`, `WorkoutSessionV1`, `Exercise`
- V1 SwiftData Entities: `WorkoutSessionEntityV1`, `WorkoutEntity`, `ExerciseEntity`

**Entity Naming:**
- **Struct**: `WorkoutSessionV1` (Models/WorkoutSessionV1.swift)
- **@Model Entity**: `WorkoutSessionEntityV1` (SwiftDataEntities.swift)

### V2 Clean Architecture (IN DEVELOPMENT - Not Yet Connected)

**Status:** Foundation complete, not yet integrated into main app flow

**Layers Built:**
1. **Domain Layer** (Pure Swift, zero dependencies) ✅
   - Entities: `DomainWorkoutSession`, `DomainSessionExercise`, `DomainSessionSet`
   - Use Cases: `StartSessionUseCase`, `CompleteSetUseCase`, `EndSessionUseCase`, etc.
   - Repository Protocols: `SessionRepositoryProtocol`

2. **Data Layer** (SwiftData integration) ✅
   - Entities: `WorkoutSessionEntity`, `SessionExerciseEntity`, `SessionSetEntity`
   - Mappers: `SessionMapper` (Domain ↔ Entity)
   - Repositories: `SwiftDataSessionRepository`

3. **Presentation Layer** (SwiftUI stores) ✅
   - Stores: `SessionStore`
   - Views: `ActiveWorkoutSheetView` (refactored, but not wired up)

4. **Infrastructure Layer** (DI, cross-cutting) ✅
   - `DependencyContainer` (factory methods for all V2 components)

**Entity Naming:**
- **Domain Struct**: `DomainWorkoutSession` (Domain/Entities/WorkoutSession.swift)
- **@Model Entity**: `WorkoutSessionEntity` (Data/Entities/WorkoutSessionEntity.swift)

---

## SwiftData Schema Configuration

To support both V1 and V2 simultaneously, **both** entity sets are registered in the SwiftData schema:

```swift
// GymTrackerApp.swift
let schema = Schema([
    // Shared entities (used by both V1 and V2)
    ExerciseEntity.self,
    ExerciseSetEntity.self,
    WorkoutExerciseEntity.self,
    WorkoutEntity.self,
    UserProfileEntity.self,
    ExerciseRecordEntity.self,
    WorkoutFolderEntity.self,
    
    // V1 Legacy entities (keep for compatibility)
    WorkoutSessionEntityV1.self,
    
    // V2 Clean Architecture entities
    WorkoutSessionEntity.self,
    SessionExerciseEntity.self,
    SessionSetEntity.self,
])
```

**Why This Works:**
- SwiftData supports multiple entity types in the same schema
- Entity types are distinguished by class name (no conflicts)
- Both V1 and V2 can persist data independently
- Migration from V1 → V2 can happen gradually

---

## Entity Comparison: V1 vs V2

### V1: `WorkoutSessionEntityV1`

**Purpose:** Legacy session tracking (monolithic design)

**Structure:**
```swift
@Model
final class WorkoutSessionEntityV1 {
    var id: UUID
    var templateId: UUID?
    var name: String
    var date: Date
    var exercises: [WorkoutExerciseEntity]  // Direct relationship
    var defaultRestTime: TimeInterval
    var duration: TimeInterval?
    var notes: String
    var minHeartRate: Int?
    var maxHeartRate: Int?
    var avgHeartRate: Int?
}
```

**Characteristics:**
- All session data in one entity
- Direct relationship to shared `WorkoutExerciseEntity`
- Heart rate data embedded
- Used by V1 `WorkoutStore`, `WorkoutStoreCoordinator`

---

### V2: `WorkoutSessionEntity`

**Purpose:** Clean Architecture session tracking (separated concerns)

**Structure:**
```swift
@Model
final class WorkoutSessionEntity {
    var id: UUID
    var workoutId: UUID  // Reference to template
    var startDate: Date
    var endDate: Date?
    var state: String  // "active", "paused", "completed"
    var exercises: [SessionExerciseEntity]  // V2-specific exercises
}
```

**Characteristics:**
- Minimal session metadata
- State machine support (active/paused/completed)
- Uses separate V2 entities (`SessionExerciseEntity`, `SessionSetEntity`)
- No business logic (pure data storage)
- Mapped to/from `DomainWorkoutSession` via `SessionMapper`

---

## File Organization

### V1 Files (Legacy - Still in Build Target)

```
GymTracker/
├── Models/
│   └── WorkoutSessionV1.swift           # V1 domain model
├── ViewModels/
│   └── WorkoutStore.swift               # V1 store (2000+ LOC)
├── Coordinators/
│   ├── WorkoutStoreCoordinator.swift
│   ├── WorkoutCoordinator.swift
│   └── HealthKitCoordinator.swift
├── Services/
│   ├── WorkoutDataService.swift
│   ├── WorkoutAnalyticsService.swift
│   └── SessionManagementService.swift
├── Views/
│   ├── ContentView.swift
│   ├── HomeView.swift
│   ├── WorkoutDetailView.swift
│   └── SessionDetailView.swift
└── SwiftDataEntities.swift              # V1 entities
```

### V2 Files (Clean Architecture - In Build Target)

```
GymTracker/
├── Domain/
│   ├── Entities/
│   │   ├── WorkoutSession.swift         # DomainWorkoutSession
│   │   ├── SessionExercise.swift        # DomainSessionExercise
│   │   └── SessionSet.swift             # DomainSessionSet
│   ├── UseCases/
│   │   └── Session/
│   │       ├── StartSessionUseCase.swift
│   │       ├── CompleteSetUseCase.swift
│   │       └── EndSessionUseCase.swift
│   └── RepositoryProtocols/
│       └── SessionRepositoryProtocol.swift
├── Data/
│   ├── Entities/
│   │   ├── WorkoutSessionEntity.swift
│   │   ├── SessionExerciseEntity.swift
│   │   └── SessionSetEntity.swift
│   ├── Mappers/
│   │   └── SessionMapper.swift
│   └── Repositories/
│       └── SwiftDataSessionRepository.swift
├── Presentation/
│   ├── Stores/
│   │   └── SessionStore.swift
│   └── Views/
│       └── ActiveWorkout/
│           └── ActiveWorkoutSheetView.swift  # Refactored but not connected
└── Infrastructure/
    └── DI/
        └── DependencyContainer.swift
```

---

## Current Integration Status

### What's Working (V1)

✅ All user-facing features run on V1 architecture:
- Start/end workout sessions
- Complete sets
- Track rest timer
- View workout history
- Analytics & statistics
- HealthKit integration

### What's Built But Not Connected (V2)

✅ V2 infrastructure is complete but **not yet wired into the UI**:
- Domain layer (entities, use cases, protocols)
- Data layer (repositories, mappers)
- Presentation layer (stores)
- DependencyContainer
- 30 automated tests (100% Domain/Data coverage)

⏳ V2 Views are refactored but still use V1 for actual functionality:
- `ActiveWorkoutSheetView` uses `SessionStore` but delegates to V1

---

## Migration Strategy

### Phase 1: Foundation (COMPLETE ✅)

**Goal:** Build V2 architecture without breaking V1

- [x] Create 4-layer folder structure
- [x] Implement Domain layer (pure Swift)
- [x] Implement Data layer (SwiftData)
- [x] Implement Presentation layer (stores)
- [x] Wire up DependencyContainer
- [x] Write tests (30 tests, 100% Domain/Data coverage)
- [x] Both V1 and V2 entities in schema

**Result:** V1 continues working, V2 ready for integration

---

### Phase 2: Gradual Cutover (NEXT - Sprint 2.x)

**Goal:** Switch features from V1 → V2 one at a time

**Planned Approach:**
1. **Session Management First** (Sprint 2.1)
   - Wire `SessionStore` into `ContentView`
   - Replace V1 session logic with V2
   - Keep V1 as fallback during testing
   - A/B test with feature flag

2. **Workout Management** (Sprint 2.2)
   - Implement `WorkoutStore` (V2)
   - Migrate CRUD operations to V2 Use Cases
   - Refactor `HomeView` to use V2

3. **Exercise Management** (Sprint 2.3)
   - Implement `ExerciseStore` (V2)
   - Migrate exercise library to V2

4. **Analytics & Statistics** (Sprint 2.4)
   - Implement `StatisticsStore` (V2)
   - Migrate stats views to V2

---

### Phase 3: V1 Removal (Future - Sprint 3.x)

**Goal:** Delete V1 code entirely

**Criteria for V1 Removal:**
- [ ] All features migrated to V2
- [ ] V2 passes all integration tests
- [ ] No regressions in production
- [ ] Performance equal or better than V1
- [ ] User testing confirms stability

**V1 Files to Remove:**
- 40+ files (~8,000 LOC)
- See: `Dokumentation/V2/V1_CLEANUP_CHECKLIST.md` (to be created)

---

## Naming Conventions

To avoid conflicts during coexistence, we follow strict naming:

### V1 Naming
- **Models**: Suffixed with `V1` (e.g., `WorkoutSessionV1`)
- **Entities**: Suffixed with `V1` (e.g., `WorkoutSessionEntityV1`)
- **Services**: No suffix (e.g., `WorkoutDataService`)
- **Stores**: No suffix (e.g., `WorkoutStore`)

### V2 Naming
- **Domain Models**: Prefixed with `Domain` (e.g., `DomainWorkoutSession`)
- **Entities**: No prefix (e.g., `WorkoutSessionEntity`)
- **Use Cases**: Suffixed with `UseCase` (e.g., `StartSessionUseCase`)
- **Stores**: No suffix (e.g., `SessionStore`)
- **Repositories**: Prefixed with implementation (e.g., `SwiftDataSessionRepository`)

**Why These Conventions?**
- **V1 suffix**: Clearly marks legacy code for future removal
- **Domain prefix**: Prevents conflicts with V1 models (e.g., `WorkoutSession` vs `DomainWorkoutSession`)
- **Clean V2 names**: After V1 removal, we can rename `DomainWorkoutSession` → `WorkoutSession`

---

## Build Configuration

### Xcode Target Membership

**Both V1 and V2** files are included in the `GymTracker` build target:
- ✅ V1 files: In target (running in production)
- ✅ V2 files: In target (infrastructure ready, not yet connected)

### Why Keep Both in Target?

1. **Gradual Migration:** Can switch features V1 → V2 incrementally
2. **Feature Flags:** Can A/B test V2 before full rollout
3. **Rollback Safety:** If V2 has bugs, can quickly revert to V1
4. **Code Sharing:** Some utilities/helpers used by both

---

## Testing Strategy

### V1 Testing (Manual)
- V1 code has minimal automated tests
- Relies on manual testing in simulator/device
- User acceptance testing

### V2 Testing (Automated + Manual)
- **Unit Tests:** 30 tests (Domain + Data layers)
- **Integration Tests:** Use Cases → Repositories
- **Manual Tests:** Presentation layer (stores + views)

**Test Coverage:**
- Domain Layer: 100% ✅
- Data Layer: 100% ✅
- Presentation Layer: 0% (manual only)
- Overall: ~60%

---

## Known Issues & TODOs

### Current Limitations

1. **V2 Not Connected to UI**
   - SessionStore exists but not used by ContentView
   - ActiveWorkoutSheetView refactored but still delegates to V1
   - Need to wire SessionStore → ContentView in Sprint 2.1

2. **Incomplete V2 Use Cases**
   - Missing: AddSetUseCase, DeleteSetUseCase
   - Missing: RestTimer Use Cases
   - These will be implemented in Sprint 2.1

3. **No Data Migration Plan Yet**
   - V1 sessions stored in `WorkoutSessionEntityV1`
   - V2 sessions stored in `WorkoutSessionEntity`
   - Need migration utility to convert V1 → V2 (Sprint 2.5)

4. **Performance Unknowns**
   - V2 not yet tested at scale
   - Need to profile V2 with large datasets
   - Benchmark against V1 performance

---

## Rollback Plan

If V2 causes issues, we can quickly revert:

### Immediate Rollback (< 5 minutes)
```swift
// In ContentView or GymTrackerApp
// Comment out V2 initialization
// let sessionStore = dependencyContainer.makeSessionStore()

// Use V1 instead
@StateObject var workoutStore = WorkoutStore()
```

### Full Rollback (< 1 hour)
1. Checkout previous commit before V2 integration
2. Keep V1 entities in schema (data preserved)
3. Remove V2 files from build target
4. Test build
5. Deploy

**Data Safety:**
- V1 data remains in `WorkoutSessionEntityV1` (never deleted)
- V2 data in `WorkoutSessionEntity` (can be ignored/deleted)
- No data loss risk

---

## Success Metrics

### Phase 1 (Foundation) - ✅ COMPLETE

- [x] V1 continues working without regressions
- [x] V2 infrastructure compiles and passes tests
- [x] App builds successfully with both V1 and V2
- [x] SwiftData schema includes both entity sets
- [x] Zero crashes or data corruption

### Phase 2 (Integration) - 🔜 NEXT

- [ ] First feature (Session Management) running on V2
- [ ] Performance equal to V1
- [ ] Zero user-facing bugs
- [ ] Feature flag allows V1/V2 switching
- [ ] Tests pass for both V1 and V2

### Phase 3 (V1 Removal) - 🔮 FUTURE

- [ ] All features on V2
- [ ] V1 code deleted (~8,000 LOC removed)
- [ ] Compile time < 20s (down from 45s)
- [ ] App size reduced
- [ ] Codebase maintainability improved

---

## FAQs

### Q: Why not just rewrite V1 directly?

**A:** High risk of breaking production features. Coexistence allows incremental migration with rollback safety.

### Q: Will having both V1 and V2 slow down the app?

**A:** No. Only active code paths affect performance. V2 code is inert until connected to UI.

### Q: When will V1 be removed?

**A:** After all features migrate to V2 (estimated: Sprint 3.x, ~6-8 weeks from now).

### Q: Can users access both V1 and V2 data?

**A:** Currently, V1 and V2 data are separate. A migration utility will convert V1 → V2 data in Sprint 2.5.

### Q: What if V2 has worse performance than V1?

**A:** We'll profile early (Sprint 2.1) and optimize before full rollout. If unfixable, we'll stick with V1.

---

## Related Documentation

- **V2 Architecture:** `TECHNICAL_CONCEPT_V2.md`
- **Sprint Progress:** `SPRINT_1_4_PROGRESS.md`
- **Roadmap:** `V2_CLEAN_ARCHITECTURE_ROADMAP.md`
- **Master Progress:** `V2_MASTER_PROGRESS.md`

---

**Last Updated:** 2025-10-22  
**Status:** V1 Active, V2 Foundation Complete, Integration Pending

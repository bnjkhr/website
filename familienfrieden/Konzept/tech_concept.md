# FamilyManager iOS App - Technical Concept

## Executive Summary

**Project Name:** FamilyManager  
**Platform:** iOS 17.0+  
**Primary Language:** Swift 6  
**UI Framework:** SwiftUI  
**Backend:** Supabase (PostgreSQL + Realtime + Storage + Auth)  
**Architecture Pattern:** MVVM + Clean Architecture  
**Target Audience:** Familien (besonders Patchwork-Familien) mit Kindern  

**Core Value Proposition:**  
Eine Family Management App, die Haushaltsorganisation mit einem Belohnungssystem kombiniert. Kinder verdienen Credits durch erledigte Aufgaben und können diese in Bildschirmzeit umwandeln. Die App unterstützt Patchwork-Familien, bei denen Kinder in mehreren Haushalten leben können.

---

## 1. System Architecture

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     iOS App (Swift)                      │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │         Presentation Layer (SwiftUI)            │    │
│  │  - Views, ViewModels, UI Components             │    │
│  └─────────────────┬───────────────────────────────┘    │
│                    │                                     │
│  ┌─────────────────▼───────────────────────────────┐    │
│  │         Domain Layer (Business Logic)           │    │
│  │  - Entities, Use Cases, Repository Protocols    │    │
│  └─────────────────┬───────────────────────────────┘    │
│                    │                                     │
│  ┌─────────────────▼───────────────────────────────┐    │
│  │            Data Layer                            │    │
│  │  - Repositories, Data Sources, DTOs             │    │
│  │                                                  │    │
│  │  ┌──────────────┐        ┌──────────────┐      │    │
│  │  │   Remote     │        │    Local     │      │    │
│  │  │ (Supabase)   │        │ (Core Data)  │      │    │
│  │  └──────────────┘        └──────────────┘      │    │
│  └──────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │      Supabase Backend Services       │
        │  - PostgreSQL Database               │
        │  - Authentication                    │
        │  - Realtime Subscriptions            │
        │  - File Storage (Task Photos)        │
        │  - Row Level Security (RLS)          │
        └──────────────────────────────────────┘
```

### 1.2 Layer Responsibilities

#### **Presentation Layer**
- SwiftUI Views (UI rendering)
- ViewModels (UI state management, user interactions)
- Navigation coordination
- User input validation
- Error presentation

**Key Principle:** Views are dumb, ViewModels orchestrate Use Cases.

#### **Domain Layer**
- Business entities (User, Task, Household, CreditAccount)
- Use Cases (business logic operations)
- Repository protocols (abstractions)
- Business rules and validations
- Domain-specific errors

**Key Principle:** Platform-agnostic, no iOS framework dependencies (except Foundation).

#### **Data Layer**
- Repository implementations
- Remote Data Sources (Supabase API calls)
- Local Data Sources (Core Data operations)
- DTOs (Data Transfer Objects)
- Data mapping (DTO ↔ Entity)
- Caching strategy

**Key Principle:** Isolate data access, enable offline-first approach.

---

## 2. Technology Stack

### 2.1 iOS Development

| Component | Technology | Version | Rationale |
|-----------|-----------|---------|-----------|
| **Language** | Swift | 6.0 | Latest features, strict concurrency |
| **UI Framework** | SwiftUI | iOS 17+ | Declarative, modern, less boilerplate |
| **Concurrency** | Swift Concurrency | async/await | Native, thread-safe, no callbacks |
| **Local Database** | Core Data | iOS 17+ | Mature, iCloud sync support, offline-first |
| **Networking** | URLSession | Native | Built-in, sufficient for needs |
| **Image Loading** | Kingfisher | 7.x | Caching, async image loading |
| **Dependency Injection** | Manual | - | Lightweight, no framework needed |

### 2.2 Backend Services (Supabase)

| Service | Purpose |
|---------|---------|
| **PostgreSQL** | Relational database with ACID guarantees |
| **Supabase Auth** | Email/password authentication, JWT tokens |
| **Realtime** | WebSocket subscriptions for live updates |
| **Storage** | File storage for task photos, avatars |
| **Row Level Security** | Database-level access control |
| **Database Functions** | Automatic credit calculations via triggers |

### 2.3 Third-Party Dependencies

```swift
// Package.swift dependencies
dependencies: [
    .package(url: "https://github.com/supabase/supabase-swift", from: "2.0.0"),
    .package(url: "https://github.com/onevcat/Kingfisher", from: "7.0.0")
]
```

**Minimal dependencies philosophy:** Only add dependencies that provide significant value and are well-maintained.

---

## 3. Data Model

### 3.1 Core Entities

#### **User (Profile)**
```swift
struct User: Identifiable, Codable, Equatable {
    let id: UUID
    let email: String
    var displayName: String
    var avatarURL: String?
    var dateOfBirth: Date?
    let createdAt: Date
    var updatedAt: Date
}
```

#### **Household**
```swift
struct Household: Identifiable, Codable, Equatable {
    let id: UUID
    var name: String
    var description: String?
    var avatarURL: String?
    let createdBy: UUID
    let createdAt: Date
    var updatedAt: Date
}
```

#### **HouseholdMember**
```swift
struct HouseholdMember: Identifiable, Codable, Equatable {
    let id: UUID
    let householdId: UUID
    let userId: UUID
    let role: MemberRole
    var nickname: String?
    let joinedAt: Date
}

enum MemberRole: String, Codable {
    case parent
    case child
    case guardian
}
```

#### **Task**
```swift
struct Task: Identifiable, Codable, Equatable {
    let id: UUID
    let householdId: UUID
    var title: String
    var description: String?
    var category: TaskCategory
    let difficulty: TaskDifficulty
    let creditValue: Int
    let assignedTo: UUID
    let createdBy: UUID
    var status: TaskStatus
    var dueDate: Date?
    var completedAt: Date?
    var approvedBy: UUID?
    var approvedAt: Date?
    var rejectionReason: String?
    let requiresPhoto: Bool
    var photoURL: String?
    let isRecurring: Bool
    var recurrenceRule: String?
    let createdAt: Date
    var updatedAt: Date
}

enum TaskStatus: String, Codable {
    case open
    case inProgress = "in_progress"
    case pendingApproval = "pending_approval"
    case completed
    case rejected
}

enum TaskDifficulty: String, Codable {
    case easy
    case medium
    case hard
    
    var defaultCredits: Int {
        switch self {
        case .easy: return 5
        case .medium: return 10
        case .hard: return 20
        }
    }
}

enum TaskCategory: String, Codable, CaseIterable {
    case chores
    case homework
    case roomCleaning = "room_cleaning"
    
    var displayName: String {
        switch self {
        case .chores: return "Hausarbeit"
        case .homework: return "Hausaufgaben"
        case .roomCleaning: return "Zimmer aufräumen"
        }
    }
    
    var icon: String {
        switch self {
        case .chores: return "house.fill"
        case .homework: return "book.fill"
        case .roomCleaning: return "bed.double.fill"
        }
    }
}
```

#### **CreditAccount**
```swift
struct CreditAccount: Identifiable, Codable, Equatable {
    let id: UUID
    let householdId: UUID
    let userId: UUID
    var balance: Int
    var totalEarned: Int
    var totalSpent: Int
    let createdAt: Date
    var updatedAt: Date
}
```

#### **CreditTransaction**
```swift
struct CreditTransaction: Identifiable, Codable, Equatable {
    let id: UUID
    let accountId: UUID
    let amount: Int // Positive = earned, Negative = spent
    let transactionType: TransactionType
    let taskId: UUID?
    let description: String
    let createdBy: UUID?
    let createdAt: Date
}

enum TransactionType: String, Codable {
    case taskCompleted = "task_completed"
    case screentimeRedeemed = "screentime_redeemed"
    case bonus
    case penalty
    case manualAdjustment = "manual_adjustment"
}
```

#### **ScreentimeSetting**
```swift
struct ScreentimeSetting: Identifiable, Codable, Equatable {
    let id: UUID
    let householdId: UUID
    let userId: UUID
    var creditsPerMinute: Int
    var weeklyBaseAllowance: Int
    var maxDailyMinutes: Int?
    let createdAt: Date
    var updatedAt: Date
}
```

#### **ScreentimeRedemption**
```swift
struct ScreentimeRedemption: Identifiable, Codable, Equatable {
    let id: UUID
    let accountId: UUID
    let creditsSpent: Int
    let minutesGranted: Int
    let redeemedAt: Date
    let expiresAt: Date?
}
```

#### **CalendarEvent**
```swift
struct CalendarEvent: Identifiable, Codable, Equatable {
    let id: UUID
    let householdId: UUID
    var title: String
    var description: String?
    var startTime: Date
    var endTime: Date
    var location: String?
    var isAllDay: Bool
    var recurrenceRule: String?
    var category: String?
    var color: String?
    let createdBy: UUID
    var assignedTo: UUID?
    var isShared: Bool
    let createdAt: Date
    var updatedAt: Date
}
```

### 3.2 Entity Relationships

```
User ──────┬─────── HouseholdMember ─────── Household
           │
           ├─────── Task (assigned_to)
           │
           ├─────── CreditAccount
           │
           └─────── CalendarEvent (assigned_to)

Household ─┬─────── HouseholdMember
           │
           ├─────── Task
           │
           ├─────── CreditAccount
           │
           ├─────── CalendarEvent
           │
           └─────── ShoppingList

CreditAccount ───── CreditTransaction
              └──── ScreentimeRedemption

Task ───────────── CreditTransaction (reference)
```

**Key Relationships:**
- User can belong to multiple Households (Patchwork support)
- Each Child has separate CreditAccount per Household
- Tasks belong to one Household only
- Credits are automatically awarded via database trigger when Task is approved

---

## 4. Business Logic (Use Cases)

### 4.1 Authentication Use Cases

#### **SignUpUseCase**
```swift
protocol SignUpUseCase {
    func execute(email: String, password: String, displayName: String) async throws -> User
}
```

**Flow:**
1. Validate email format
2. Validate password strength (min 8 chars)
3. Call Supabase Auth signup
4. Create profile in `profiles` table
5. Return User entity

#### **SignInUseCase**
```swift
protocol SignInUseCase {
    func execute(email: String, password: String) async throws -> User
}
```

**Flow:**
1. Call Supabase Auth signin
2. Fetch user profile from `profiles` table
3. Return User entity

#### **SignOutUseCase**
```swift
protocol SignOutUseCase {
    func execute() async throws
}
```

### 4.2 Household Use Cases

#### **CreateHouseholdUseCase**
```swift
protocol CreateHouseholdUseCase {
    func execute(name: String, description: String?) async throws -> Household
}
```

**Flow:**
1. Validate name is not empty
2. Create household in database
3. Automatically add creator as parent member
4. Return Household entity

#### **InviteMemberUseCase**
```swift
protocol InviteMemberUseCase {
    func execute(householdId: UUID, email: String, role: MemberRole) async throws
}
```

**Flow:**
1. Verify inviter is parent/guardian in household
2. Check if user with email exists
3. Create household_member entry
4. Send invitation notification (future: push notification)
5. If role is child, automatically create CreditAccount

#### **SwitchHouseholdUseCase**
```swift
protocol SwitchHouseholdUseCase {
    func execute(householdId: UUID) async throws
}
```

**Flow:**
1. Verify user is member of household
2. Update current household in app state
3. Trigger data refresh for new household

### 4.3 Task Use Cases

#### **CreateTaskUseCase**
```swift
protocol CreateTaskUseCase {
    func execute(
        householdId: UUID,
        title: String,
        description: String?,
        category: TaskCategory,
        difficulty: TaskDifficulty,
        assignedTo: UUID,
        dueDate: Date?,
        requiresPhoto: Bool
    ) async throws -> Task
}
```

**Authorization:** Only parents/guardians can create tasks.

**Flow:**
1. Verify creator is parent/guardian in household
2. Verify assignedTo user is child in household
3. Calculate creditValue based on difficulty
4. Create task with status = .open
5. Return Task entity

#### **StartTaskUseCase**
```swift
protocol StartTaskUseCase {
    func execute(taskId: UUID) async throws
}
```

**Authorization:** Only assigned child can start task.

**Flow:**
1. Verify current user is assigned to task
2. Verify task status is .open
3. Update status to .inProgress
4. Update updatedAt timestamp

#### **CompleteTaskUseCase**
```swift
protocol CompleteTaskUseCase {
    func execute(taskId: UUID, photoURL: String?) async throws
}
```

**Authorization:** Only assigned child can complete task.

**Flow:**
1. Verify current user is assigned to task
2. Verify task status is .open or .inProgress
3. If requiresPhoto is true, verify photoURL is provided
4. Update status to .pendingApproval
5. Set completedAt timestamp
6. Update photoURL if provided

#### **ApproveTaskUseCase**
```swift
protocol ApproveTaskUseCase {
    func execute(taskId: UUID, approverId: UUID) async throws
}
```

**Authorization:** Only parents/guardians can approve tasks.

**Flow:**
1. Verify approver is parent/guardian in household
2. Verify task status is .pendingApproval
3. Update status to .completed
4. Set approvedBy and approvedAt
5. **Database trigger automatically:**
   - Adds credits to child's CreditAccount
   - Creates CreditTransaction entry

#### **RejectTaskUseCase**
```swift
protocol RejectTaskUseCase {
    func execute(taskId: UUID, approverId: UUID, reason: String) async throws
}
```

**Authorization:** Only parents/guardians can reject tasks.

**Flow:**
1. Verify approver is parent/guardian in household
2. Verify task status is .pendingApproval
3. Update status to .rejected
4. Set rejectionReason
5. Reset completedAt to nil
6. No credits awarded

#### **FetchTasksUseCase**
```swift
protocol FetchTasksUseCase {
    func execute(
        householdId: UUID,
        assignedTo: UUID?,
        status: TaskStatus?
    ) async throws -> [Task]
}
```

**Flow:**
1. Query tasks from repository with filters
2. Return sorted by dueDate (ascending) then createdAt (descending)

### 4.4 Credit Use Cases

#### **FetchCreditAccountUseCase**
```swift
protocol FetchCreditAccountUseCase {
    func execute(householdId: UUID, userId: UUID) async throws -> CreditAccount
}
```

**Authorization:** User can only fetch their own account, or parents can fetch children's accounts.

#### **FetchCreditTransactionsUseCase**
```swift
protocol FetchCreditTransactionsUseCase {
    func execute(accountId: UUID, limit: Int?) async throws -> [CreditTransaction]
}
```

**Flow:**
1. Fetch transactions sorted by createdAt descending
2. Apply limit if provided (default: 50)

#### **RedeemScreentimeUseCase**
```swift
protocol RedeemScreentimeUseCase {
    func execute(
        accountId: UUID,
        minutesToRedeem: Int
    ) async throws -> ScreentimeRedemption
}
```

**Flow:**
1. Fetch CreditAccount
2. Fetch ScreentimeSetting for household/user
3. Calculate required credits: `creditsNeeded = minutesToRedeem * creditsPerMinute`
4. Verify sufficient balance
5. Verify maxDailyMinutes not exceeded (if set)
6. Create ScreentimeRedemption
7. **Database trigger automatically:**
   - Deducts credits from balance
   - Creates CreditTransaction

#### **AdjustCreditsUseCase** (Admin/Parent)
```swift
protocol AdjustCreditsUseCase {
    func execute(
        accountId: UUID,
        amount: Int,
        reason: String
    ) async throws
}
```

**Authorization:** Only parents/guardians.

**Flow:**
1. Verify caller is parent/guardian
2. Create CreditTransaction with type .manualAdjustment or .bonus/.penalty
3. Update CreditAccount balance

---

## 5. Data Flow & State Management

### 5.1 Offline-First Strategy

**Philosophy:** App must work without internet connection, syncing in background when available.

#### **Read Flow (Fetch Data)**

```
1. User requests data
2. ViewModel calls Use Case
3. Use Case calls Repository
4. Repository checks Local Cache (Core Data)
   ├─ If cached & fresh → Return immediately
   └─ If stale or missing → Continue to step 5
5. Repository fetches from Remote (Supabase)
6. Repository saves to Local Cache
7. Return data to Use Case → ViewModel → View
```

**Implementation:**
```swift
func fetchTasks(householdId: UUID) async throws -> [Task] {
    // Try local cache first
    if let cached = try? await localDataSource.getTasks(householdId),
       !cached.isEmpty {
        // Return cached data immediately
        Task {
            // Fetch fresh data in background
            try? await syncTasks(householdId)
        }
        return cached
    }
    
    // No cache, must fetch from remote
    let remote = try await remoteDataSource.getTasks(householdId)
    try await localDataSource.saveTasks(remote)
    return remote
}

private func syncTasks(_ householdId: UUID) async throws {
    let remote = try await remoteDataSource.getTasks(householdId)
    try await localDataSource.saveTasks(remote)
    // Notify observers of data change
}
```

#### **Write Flow (Update Data)**

```
1. User performs action (e.g., complete task)
2. ViewModel calls Use Case
3. Use Case validates business rules
4. Use Case calls Repository
5. Repository updates Local Cache immediately (Optimistic Update)
6. ViewModel updates UI immediately
7. Repository sends update to Remote (Supabase) in background
   ├─ Success → Done
   └─ Failure → Revert local change, show error to user
```

**Implementation:**
```swift
func completeTask(_ task: Task, photoURL: String?) async throws {
    var updatedTask = task
    updatedTask.status = .pendingApproval
    updatedTask.photoURL = photoURL
    updatedTask.completedAt = Date()
    
    // Optimistic update
    try await localDataSource.updateTask(updatedTask)
    
    do {
        // Sync to remote
        try await remoteDataSource.updateTask(updatedTask)
    } catch {
        // Revert on failure
        try await localDataSource.updateTask(task)
        throw error
    }
}
```

### 5.2 Realtime Updates (Supabase Realtime)

**Use Cases:**
- Task status changes (child completes, parent approves)
- New tasks assigned
- Credit balance updates
- New messages in household chat

**Implementation:**
```swift
class TaskRealtimeService {
    private var channel: RealtimeChannel?
    
    func subscribe(householdId: UUID, onUpdate: @escaping (Task) -> Void) {
        channel = supabase
            .channel("tasks:\(householdId)")
            .on(
                .postgresChanges(
                    event: .all,
                    schema: "public",
                    table: "tasks",
                    filter: "household_id=eq.\(householdId)"
                )
            ) { payload in
                if let task = self.parseTask(from: payload) {
                    onUpdate(task)
                }
            }
            .subscribe()
    }
    
    func unsubscribe() async {
        await channel?.unsubscribe()
        channel = nil
    }
}
```

**ViewModel Integration:**
```swift
@MainActor
class TaskListViewModel: ObservableObject {
    @Published var tasks: [Task] = []
    private let realtimeService: TaskRealtimeService
    
    func startListening(householdId: UUID) {
        realtimeService.subscribe(householdId: householdId) { [weak self] updatedTask in
            self?.updateTask(updatedTask)
        }
    }
    
    func stopListening() async {
        await realtimeService.unsubscribe()
    }
    
    private func updateTask(_ task: Task) {
        if let index = tasks.firstIndex(where: { $0.id == task.id }) {
            tasks[index] = task
        } else {
            tasks.append(task)
        }
    }
}
```

### 5.3 State Management Pattern

**Approach:** Each ViewModel manages its own state with `@Published` properties.

```swift
@MainActor
class TaskListViewModel: ObservableObject {
    // UI State
    @Published var tasks: [Task] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var filterStatus: TaskStatus?
    
    // Dependencies
    private let fetchTasksUseCase: FetchTasksUseCase
    private let completeTaskUseCase: CompleteTaskUseCase
    private let currentHouseholdId: UUID
    
    // Initialization
    init(
        fetchTasksUseCase: FetchTasksUseCase,
        completeTaskUseCase: CompleteTaskUseCase,
        currentHouseholdId: UUID
    ) {
        self.fetchTasksUseCase = fetchTasksUseCase
        self.completeTaskUseCase = completeTaskUseCase
        self.currentHouseholdId = currentHouseholdId
    }
    
    // Actions
    func loadTasks() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }
        
        do {
            tasks = try await fetchTasksUseCase.execute(
                householdId: currentHouseholdId,
                assignedTo: nil,
                status: filterStatus
            )
        } catch {
            errorMessage = error.localizedDescription
        }
    }
    
    func completeTask(_ task: Task, photoURL: String?) async {
        do {
            try await completeTaskUseCase.execute(
                taskId: task.id,
                photoURL: photoURL
            )
            await loadTasks() // Refresh
        } catch {
            errorMessage = error.localizedDescription
        }
    }
    
    func setFilter(_ status: TaskStatus?) {
        filterStatus = status
        Task {
            await loadTasks()
        }
    }
}
```

**Global App State:**
```swift
@MainActor
class AppState: ObservableObject {
    @Published var currentUser: User?
    @Published var currentHousehold: Household?
    @Published var isAuthenticated = false
    
    func setUser(_ user: User) {
        self.currentUser = user
        self.isAuthenticated = true
    }
    
    func signOut() {
        self.currentUser = nil
        self.currentHousehold = nil
        self.isAuthenticated = false
    }
    
    func switchHousehold(_ household: Household) {
        self.currentHousehold = household
    }
}
```

---

## 6. Security Architecture

### 6.1 Authentication & Authorization

#### **Token Storage**
- **NEVER** store tokens in UserDefaults or any plain text storage
- **ALWAYS** use iOS Keychain for token storage
- Tokens: Supabase JWT (access token + refresh token)

**Implementation:**
```swift
class KeychainManager {
    static func save(_ value: String, for key: String) throws {
        let data = value.data(using: .utf8)!
        
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecValueData as String: data,
            kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlock
        ]
        
        // Delete old entry if exists
        SecItemDelete(query as CFDictionary)
        
        // Add new entry
        let status = SecItemAdd(query as CFDictionary, nil)
        guard status == errSecSuccess else {
            throw KeychainError.saveFailed
        }
    }
    
    static func get(for key: String) throws -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true
        ]
        
        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)
        
        guard status == errSecSuccess,
              let data = result as? Data,
              let value = String(data: data, encoding: .utf8) else {
            return nil
        }
        
        return value
    }
    
    static func delete(for key: String) throws {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key
        ]
        
        let status = SecItemDelete(query as CFDictionary)
        guard status == errSecSuccess || status == errSecItemNotFound else {
            throw KeychainError.deleteFailed
        }
    }
}
```

#### **Row Level Security (RLS) in Supabase**

All tables have RLS enabled. Users can only access data they're authorized to see.

**Example Policy (Tasks):**
```sql
-- Users can view tasks of their households
CREATE POLICY "Users can view household tasks"
ON tasks FOR SELECT
USING (
    household_id IN (
        SELECT household_id 
        FROM household_members 
        WHERE user_id = auth.uid()
    )
);

-- Only parents can create tasks
CREATE POLICY "Parents can create tasks"
ON tasks FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM household_members
        WHERE household_id = tasks.household_id
        AND user_id = auth.uid()
        AND role IN ('parent', 'guardian')
    )
);

-- Children can only update their own tasks (status change)
CREATE POLICY "Children can update their own tasks"
ON tasks FOR UPDATE
USING (
    assigned_to = auth.uid() AND
    status IN ('open', 'in_progress')
);

-- Parents can update any task in their household
CREATE POLICY "Parents can update household tasks"
ON tasks FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM household_members
        WHERE household_id = tasks.household_id
        AND user_id = auth.uid()
        AND role IN ('parent', 'guardian')
    )
);
```

**Key Security Rules:**
1. Children can only see and modify their own assigned tasks
2. Parents can see and modify all tasks in their household
3. Credits are automatically managed by database triggers (no client-side manipulation possible)
4. Users can only access households they're members of
5. File uploads (photos) are scoped to household

### 6.2 Biometric Authentication (Face ID / Touch ID)

**Use Case:** Protect parent-specific features (task approval, credit adjustments).

**Implementation:**
```swift
import LocalAuthentication

class BiometricAuth {
    enum BiometricType {
        case faceID
        case touchID
        case none
    }
    
    static func availableBiometric() -> BiometricType {
        let context = LAContext()
        var error: NSError?
        
        guard context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) else {
            return .none
        }
        
        switch context.biometryType {
        case .faceID:
            return .faceID
        case .touchID:
            return .touchID
        default:
            return .none
        }
    }
    
    static func authenticate(reason: String) async throws -> Bool {
        let context = LAContext()
        context.localizedCancelTitle = "Abbrechen"
        
        return try await context.evaluatePolicy(
            .deviceOwnerAuthenticationWithBiometrics,
            localizedReason: reason
        )
    }
}

// Usage in ViewModel
func approveTask(_ task: Task) async {
    do {
        // Require biometric auth for approval
        let authenticated = try await BiometricAuth.authenticate(
            reason: "Authentifizierung erforderlich um Aufgabe zu genehmigen"
        )
        
        guard authenticated else {
            errorMessage = "Authentifizierung fehlgeschlagen"
            return
        }
        
        try await approveTaskUseCase.execute(
            taskId: task.id,
            approverId: currentUser.id
        )
    } catch {
        errorMessage = error.localizedDescription
    }
}
```

### 6.3 Data Privacy

**GDPR/Privacy Compliance:**
1. User data is stored in Supabase (EU region recommended)
2. Users can request data export (future feature)
3. Users can delete their account (cascade delete all personal data)
4. No third-party analytics in MVP (privacy-first)
5. Photos are stored in Supabase Storage with household-scoped access

**App Privacy Manifest (Privacy Nutrition Label):**
- Data collected: Email, Name, Photos (for task completion)
- Data usage: Only for app functionality, not shared with third parties
- Data retention: Until user deletes account

---

## 7. Error Handling

### 7.1 Error Types

**Domain Errors:**
```swift
enum DomainError: LocalizedError {
    case taskNotFound
    case insufficientCredits
    case unauthorized
    case invalidTaskState
    case photoRequired
    case taskAlreadyCompleted
    case userNotMemberOfHousehold
    
    var errorDescription: String? {
        switch self {
        case .taskNotFound:
            return "Aufgabe nicht gefunden"
        case .insufficientCredits:
            return "Nicht genug Credits verfügbar"
        case .unauthorized:
            return "Keine Berechtigung für diese Aktion"
        case .invalidTaskState:
            return "Aufgabe kann in diesem Status nicht bearbeitet werden"
        case .photoRequired:
            return "Foto erforderlich"
        case .taskAlreadyCompleted:
            return "Aufgabe wurde bereits erledigt"
        case .userNotMemberOfHousehold:
            return "Nutzer ist kein Mitglied dieses Haushalts"
        }
    }
}
```

**Network Errors:**
```swift
enum NetworkError: LocalizedError {
    case noInternet
    case timeout
    case serverError(Int)
    case unauthorized
    case notFound
    case unknown(Error)
    
    var errorDescription: String? {
        switch self {
        case .noInternet:
            return "Keine Internetverbindung"
        case .timeout:
            return "Zeitüberschreitung"
        case .serverError(let code):
            return "Server-Fehler (\(code))"
        case .unauthorized:
            return "Nicht autorisiert"
        case .notFound:
            return "Ressource nicht gefunden"
        case .unknown(let error):
            return error.localizedDescription
        }
    }
}
```

**Data Errors:**
```swift
enum DataError: LocalizedError {
    case decodingFailed
    case encodingFailed
    case saveFailed
    case notFound
    
    var errorDescription: String? {
        switch self {
        case .decodingFailed:
            return "Daten konnten nicht gelesen werden"
        case .encodingFailed:
            return "Daten konnten nicht gespeichert werden"
        case .saveFailed:
            return "Speichern fehlgeschlagen"
        case .notFound:
            return "Daten nicht gefunden"
        }
    }
}
```

### 7.2 Error Handling Strategy

**Layered Error Handling:**

1. **Data Layer**: Catch and convert low-level errors (network, database) to domain errors
2. **Domain Layer**: Validate business rules, throw domain-specific errors
3. **Presentation Layer**: Catch all errors, present user-friendly messages

**Example:**
```swift
// Repository (Data Layer)
func updateTask(_ task: Task) async throws {
    do {
        try await remoteDataSource.updateTask(task)
    } catch let error as URLError {
        if error.code == .notConnectedToInternet {
            throw NetworkError.noInternet
        } else if error.code == .timedOut {
            throw NetworkError.timeout
        } else {
            throw NetworkError.unknown(error)
        }
    } catch {
        throw DataError.saveFailed
    }
}

// Use Case (Domain Layer)
func execute(taskId: UUID) async throws {
    let task = try await repository.getTask(by: taskId)
    
    guard task.status == .pendingApproval else {
        throw DomainError.invalidTaskState
    }
    
    // ... business logic
}

// ViewModel (Presentation Layer)
func approveTask(_ task: Task) async {
    do {
        try await approveTaskUseCase.execute(taskId: task.id)
        await loadTasks()
    } catch let error as DomainError {
        errorMessage = error.errorDescription
    } catch let error as NetworkError {
        errorMessage = error.errorDescription
        // Show retry option for network errors
        showRetryOption = true
    } catch {
        errorMessage = "Ein unerwarteter Fehler ist aufgetreten"
    }
}
```

### 7.3 User Feedback

**Loading States:**
```swift
@Published var isLoading = false
@Published var errorMessage: String?
@Published var successMessage: String?
```

**UI Presentation:**
- **Loading**: Show ProgressView or loading overlay
- **Error**: Alert or Toast with error message and retry option
- **Success**: Brief toast message, then dismiss automatically

**Example View:**
```swift
.alert("Fehler", isPresented: .constant(viewModel.errorMessage != nil)) {
    Button("OK") {
        viewModel.errorMessage = nil
    }
    if viewModel.showRetryOption {
        Button("Erneut versuchen") {
            Task {
                await viewModel.retry()
            }
        }
    }
} message: {
    if let error = viewModel.errorMessage {
        Text(error)
    }
}
```

---

## 8. Testing Strategy

### 8.1 Unit Tests (Domain Layer)

**Test Coverage Target:** 80%+ for Use Cases

**What to Test:**
- Business logic in Use Cases
- Edge cases and error conditions
- Input validation
- Business rule enforcement

**Example:**
```swift
final class ApproveTaskUseCaseTests: XCTestCase {
    var sut: ApproveTaskUseCaseImpl!
    var mockRepository: MockTaskRepository!
    var mockAuthService: MockAuthService!
    
    override func setUp() {
        super.setUp()
        mockRepository = MockTaskRepository()
        mockAuthService = MockAuthService()
        sut = ApproveTaskUseCaseImpl(
            taskRepository: mockRepository,
            authService: mockAuthService
        )
    }
    
    func testApproveTask_Success() async throws {
        // Given
        let task = Task.mock(status: .pendingApproval)
        let approverId = UUID()
        mockRepository.taskToReturn = task
        mockAuthService.currentUserId = approverId
        mockAuthService.isParent = true
        
        // When
        try await sut.execute(taskId: task.id, approverId: approverId)
        
        // Then
        XCTAssertTrue(mockRepository.updateTaskCalled)
        XCTAssertEqual(mockRepository.updatedTask?.status, .completed)
        XCTAssertEqual(mockRepository.updatedTask?.approvedBy, approverId)
    }
    
    func testApproveTask_WhenNotParent_ThrowsUnauthorized() async {
        // Given
        let task = Task.mock(status: .pendingApproval)
        mockRepository.taskToReturn = task
        mockAuthService.isParent = false
        
        // When/Then
        do {
            try await sut.execute(taskId: task.id, approverId: UUID())
            XCTFail("Should throw error")
        } catch DomainError.unauthorized {
            // Expected
        } catch {
            XCTFail("Wrong error type")
        }
    }
    
    func testApproveTask_WhenInvalidStatus_ThrowsInvalidState() async {
        // Given
        let task = Task.mock(status: .open)
        mockRepository.taskToReturn = task
        mockAuthService.isParent = true
        
        // When/Then
        do {
            try await sut.execute(taskId: task.id, approverId: UUID())
            XCTFail("Should throw error")
        } catch DomainError.invalidTaskState {
            // Expected
        } catch {
            XCTFail("Wrong error type")
        }
    }
}

// Mock Repository
class MockTaskRepository: TaskRepository {
    var taskToReturn: Task?
    var updateTaskCalled = false
    var updatedTask: Task?
    
    func getTask(by id: UUID) async throws -> Task {
        guard let task = taskToReturn else {
            throw DomainError.taskNotFound
        }
        return task
    }
    
    func updateTask(_ task: Task) async throws {
        updateTaskCalled = true
        updatedTask = task
    }
}
```

### 8.2 Integration Tests (Data Layer)

**Test Coverage Target:** Key data flows

**What to Test:**
- Repository implementations with real Supabase (test database)
- DTO ↔ Entity mapping
- Local cache (Core Data) persistence

**Setup:**
```swift
final class TaskRepositoryIntegrationTests: XCTestCase {
    var sut: TaskRepositoryImpl!
    var supabaseClient: SupabaseClient!
    var testHouseholdId: UUID!
    var testUserId: UUID!
    
    override func setUp() async throws {
        // Use test Supabase instance
        supabaseClient = SupabaseClient(
            supabaseURL: URL(string: TestConfig.supabaseURL)!,
            supabaseKey: TestConfig.supabaseKey
        )
        
        // Create test household and user
        testHouseholdId = UUID()
        testUserId = UUID()
        
        sut = TaskRepositoryImpl(
            remoteDataSource: TaskRemoteDataSource(supabase: supabaseClient),
            localDataSource: TaskLocalDataSource()
        )
    }
    
    func testFetchTasks_ReturnsTasksFromSupabase() async throws {
        // Given: Task exists in test database
        let taskId = try await createTestTask()
        
        // When
        let tasks = try await sut.getTasks(for: testHouseholdId)
        
        // Then
        XCTAssertFalse(tasks.isEmpty)
        XCTAssert(tasks.contains(where: { $0.id == taskId }))
        
        // Cleanup
        try await deleteTestTask(taskId)
    }
}
```

### 8.3 UI Tests (Presentation Layer)

**Test Coverage Target:** Critical user flows only (not every screen)

**What to Test:**
- Complete task flow (child perspective)
- Approve task flow (parent perspective)
- Sign up / Sign in flow
- Household creation flow

**Example:**
```swift
final class CompleteTaskUITests: XCTestCase {
    var app: XCUIApplication!
    
    override func setUp() {
        super.setUp()
        app = XCUIApplication()
        app.launchArguments = ["UI-Testing"]
        app.launch()
    }
    
    func testCompleteTaskFlow() {
        // Given: User is logged in and sees task list
        loginAsChild()
        
        // When: Tap on a task
        let taskCell = app.buttons["task-cell-0"]
        XCTAssertTrue(taskCell.exists)
        taskCell.tap()
        
        // Then: Task detail screen appears
        XCTAssertTrue(app.navigationBars["Aufgabe"].exists)
        
        // When: Tap complete button
        let completeButton = app.buttons["complete-task"]
        completeButton.tap()
        
        // Then: Photo picker appears (if photo required)
        // Or: Confirmation appears
        let confirmButton = app.buttons["Zur Genehmigung einreichen"]
        XCTAssertTrue(confirmButton.exists)
        confirmButton.tap()
        
        // Then: Success message appears
        XCTAssertTrue(app.staticTexts["Aufgabe eingereicht"].waitForExistence(timeout: 2))
    }
}
```

### 8.4 Mock Data for Testing

**Test Fixtures:**
```swift
extension Task {
    static func mock(
        id: UUID = UUID(),
        householdId: UUID = UUID(),
        title: String = "Test Aufgabe",
        status: TaskStatus = .open,
        creditValue: Int = 10,
        assignedTo: UUID = UUID(),
        requiresPhoto: Bool = false
    ) -> Task {
        Task(
            id: id,
            householdId: householdId,
            title: title,
            description: "Test Beschreibung",
            category: .chores,
            difficulty: .medium,
            creditValue: creditValue,
            assignedTo: assignedTo,
            createdBy: UUID(),
            status: status,
            dueDate: nil,
            completedAt: nil,
            approvedBy: nil,
            approvedAt: nil,
            rejectionReason: nil,
            requiresPhoto: requiresPhoto,
            photoURL: nil,
            isRecurring: false,
            recurrenceRule: nil,
            createdAt: Date(),
            updatedAt: Date()
        )
    }
}
```

---

## 9. Performance Optimization

### 9.1 Database Optimization

**Indexes (Already in Schema):**
```sql
CREATE INDEX idx_tasks_household ON tasks(household_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_calendar_events_start_time ON calendar_events(start_time);
```

**Query Optimization:**
- Use `.select()` with specific columns instead of `SELECT *`
- Use pagination for large lists (limit + offset)
- Use composite indexes for common query patterns

**Example:**
```swift
// ❌ Bad: Fetch all data
let tasks: [Task] = try await supabase
    .from("tasks")
    .select()
    .execute()
    .value

// ✅ Good: Fetch only needed columns with filter
let tasks: [TaskDTO] = try await supabase
    .from("tasks")
    .select("id, title, status, credit_value, due_date")
    .eq("household_id", value: householdId)
    .eq("assigned_to", value: userId)
    .order("due_date", ascending: true)
    .limit(50)
    .execute()
    .value
```

### 9.2 Image Optimization

**Photo Upload:**
- Compress images before upload (JPEG quality 0.7)
- Resize to max 1920px width
- Upload in background Task
- Show upload progress

**Implementation:**
```swift
func uploadTaskPhoto(_ image: UIImage) async throws -> String {
    // Resize image
    let resized = image.resize(maxWidth: 1920)
    
    // Compress
    guard let imageData = resized.jpegData(compressionQuality: 0.7) else {
        throw ImageError.compressionFailed
    }
    
    // Generate unique filename
    let filename = "\(UUID().uuidString).jpg"
    let path = "task-photos/\(currentHouseholdId)/\(filename)"
    
    // Upload to Supabase Storage
    try await supabase.storage
        .from("task-photos")
        .upload(
            path: path,
            file: imageData,
            options: FileOptions(contentType: "image/jpeg")
        )
    
    // Get public URL
    let publicURL = try supabase.storage
        .from("task-photos")
        .getPublicURL(path: path)
    
    return publicURL.absoluteString
}
```

**Image Caching (Kingfisher):**
```swift
import Kingfisher

// In SwiftUI View
KFImage(URL(string: task.photoURL))
    .placeholder {
        ProgressView()
    }
    .resizable()
    .aspectRatio(contentMode: .fill)
    .frame(width: 300, height: 200)
    .clipped()
    .cornerRadius(12)
```

### 9.3 UI Performance

**LazyVStack for Long Lists:**
```swift
ScrollView {
    LazyVStack(spacing: 12) {
        ForEach(viewModel.tasks) { task in
            TaskCard(task: task)
        }
    }
    .padding()
}
```

**Pagination:**
```swift
class TaskListViewModel: ObservableObject {
    @Published var tasks: [Task] = []
    private var currentPage = 0
    private let pageSize = 20
    private var hasMorePages = true
    
    func loadTasks() async {
        guard !isLoading, hasMorePages else { return }
        
        isLoading = true
        defer { isLoading = false }
        
        do {
            let newTasks = try await fetchTasksUseCase.execute(
                householdId: currentHouseholdId,
                offset: currentPage * pageSize,
                limit: pageSize
            )
            
            tasks.append(contentsOf: newTasks)
            hasMorePages = newTasks.count == pageSize
            currentPage += 1
        } catch {
            errorMessage = error.localizedDescription
        }
    }
    
    func shouldLoadMore(currentTask: Task) -> Bool {
        // Load more when scrolling near end
        guard let lastTask = tasks.last else { return false }
        return currentTask.id == lastTask.id
    }
}

// In View
ForEach(viewModel.tasks) { task in
    TaskCard(task: task)
        .onAppear {
            if viewModel.shouldLoadMore(currentTask: task) {
                Task {
                    await viewModel.loadTasks()
                }
            }
        }
}
```

---

## 10. Deployment & DevOps

### 10.1 Environment Configuration

**Config Files (.xcconfig):**

`Debug.xcconfig`:
```
SUPABASE_URL = https://test-project.supabase.co
SUPABASE_ANON_KEY = your_test_key_here
```

`Release.xcconfig`:
```
SUPABASE_URL = https://prod-project.supabase.co
SUPABASE_ANON_KEY = your_prod_key_here
```

**Access in Code:**
```swift
enum Config {
    static let supabaseURL = Bundle.main.infoDictionary?["SUPABASE_URL"] as? String ?? ""
    static let supabaseAnonKey = Bundle.main.infoDictionary?["SUPABASE_ANON_KEY"] as? String ?? ""
}
```

**⚠️ IMPORTANT:** Add `.xcconfig` files to `.gitignore` to prevent committing secrets!

### 10.2 CI/CD (GitHub Actions)

**Basic Workflow:**
```yaml
name: iOS CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: macos-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Select Xcode
      run: sudo xcode-select -s /Applications/Xcode_15.0.app
    
    - name: Run tests
      run: xcodebuild test -scheme FamilyManager -destination 'platform=iOS Simulator,name=iPhone 15,OS=17.0'
    
    - name: Run SwiftLint
      run: swiftlint lint --strict
```

### 10.3 Versioning

**Semantic Versioning:** `MAJOR.MINOR.PATCH`
- **MAJOR**: Breaking changes (e.g., 2.0.0)
- **MINOR**: New features, backwards compatible (e.g., 1.1.0)
- **PATCH**: Bug fixes (e.g., 1.0.1)

**Build Number:** Auto-increment via CI/CD or manually

### 10.4 App Store Deployment

**Pre-Release Checklist:**
- [ ] All tests passing
- [ ] No hardcoded credentials
- [ ] Privacy policy added
- [ ] App icons (all sizes)
- [ ] Screenshots prepared (all device sizes)
- [ ] App description written
- [ ] Keywords optimized
- [ ] Age rating determined
- [ ] TestFlight beta testing completed

---

## 11. Future Considerations

### 11.1 Scalability

**Database:**
- Monitor query performance with Supabase Dashboard
- Add composite indexes as needed
- Consider read replicas for heavy read loads

**Storage:**
- Implement CDN for images (Supabase Storage has built-in CDN)
- Set up image optimization pipeline (auto-resize on upload)

### 11.2 Android Version

**Shared Backend:** Supabase works for both iOS and Android ✅

**Considerations:**
- Reuse same database schema
- Reuse same RLS policies
- Implement same business logic in Android (Kotlin)
- Shared API documentation (OpenAPI spec)

### 11.3 Advanced Features (Post-MVP)

**Recurring Tasks:**
- RRULE parser for recurrence rules
- Automatic task instance generation
- "Edit series" vs "Edit instance"

**iOS Screen Time API Integration:**
- Requires Screen Time API (limited availability)
- Parental Controls integration
- Real enforcement of screen time limits

**Widgets:**
- Home Screen Widget (Today's tasks, Credit balance)
- Lock Screen Widget (Quick task counter)
- Live Activities (Task progress)

**Apple Watch:**
- Quick task view
- Task completion from watch
- Credit balance glance

**Analytics:**
- Task completion rate over time
- Credit earning trends
- Most productive days/times
- Export reports for parents

---

## 12. Common Pitfalls & Solutions

### 12.1 Avoid These Mistakes

#### **Mistake 1: Force Unwrapping**
```swift
// ❌ Bad
let task = tasks.first!
let user = currentUser!

// ✅ Good
guard let task = tasks.first else { return }
guard let user = currentUser else { return }
```

#### **Mistake 2: Retain Cycles**
```swift
// ❌ Bad
viewModel.loadData {
    self.updateUI()
}

// ✅ Good
viewModel.loadData { [weak self] in
    self?.updateUI()
}
```

#### **Mistake 3: Main Thread Blocking**
```swift
// ❌ Bad
func loadTasks() {
    let tasks = try! await repository.getTasks() // Blocking!
    self.tasks = tasks
}

// ✅ Good
@MainActor
func loadTasks() async {
    do {
        let tasks = try await repository.getTasks()
        self.tasks = tasks
    } catch {
        errorMessage = error.localizedDescription
    }
}
```

#### **Mistake 4: Storing Secrets in Code**
```swift
// ❌ Bad
let supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

// ✅ Good
let supabaseKey = Bundle.main.infoDictionary?["SUPABASE_ANON_KEY"] as? String ?? ""
```

#### **Mistake 5: No Error Handling**
```swift
// ❌ Bad
func deleteTask() async {
    try! await repository.deleteTask(task.id)
}

// ✅ Good
func deleteTask() async {
    do {
        try await repository.deleteTask(task.id)
        successMessage = "Aufgabe gelöscht"
    } catch {
        errorMessage = error.localizedDescription
    }
}
```

### 12.2 Performance Anti-Patterns

#### **Anti-Pattern 1: Fetching Too Much Data**
```swift
// ❌ Bad
let allTasks = try await supabase.from("tasks").select().execute()

// ✅ Good
let tasks = try await supabase
    .from("tasks")
    .select("id, title, status")
    .eq("household_id", value: householdId)
    .limit(50)
    .execute()
```

#### **Anti-Pattern 2: N+1 Queries**
```swift
// ❌ Bad
for task in tasks {
    let user = try await supabase
        .from("profiles")
        .select()
        .eq("id", value: task.assignedTo)
        .single()
        .execute()
}

// ✅ Good (use JOIN or batch fetch)
let tasks = try await supabase
    .from("tasks")
    .select("*, assigned_user:profiles!assigned_to(*)")
    .eq("household_id", value: householdId)
    .execute()
```

---

## 13. Success Metrics (KPIs)

### 13.1 Technical Metrics

- **App Launch Time:** < 2 seconds
- **Screen Load Time:** < 1 second
- **API Response Time:** < 500ms (p95)
- **Crash Rate:** < 1%
- **Test Coverage:** > 80% (Domain Layer)

### 13.2 User Engagement Metrics (Post-Launch)

- **Daily Active Users (DAU)**
- **Task Completion Rate:** % of assigned tasks completed
- **Credit Redemption Rate:** % of earned credits redeemed
- **Session Length:** Avg time spent in app
- **Retention Rate:** % of users returning after 7/30 days

---

## 14. Documentation Requirements

### 14.1 Code Documentation

**Use DocC-style comments for public APIs:**
```swift
/// Creates a new task and assigns it to a child.
///
/// - Parameters:
///   - householdId: The household where the task belongs
///   - title: The task title
///   - assignedTo: The child user ID to assign the task to
/// - Returns: The created task
/// - Throws: `DomainError.unauthorized` if caller is not parent/guardian
///          `DomainError.userNotMemberOfHousehold` if assignedTo user is not a child in household
func createTask(
    householdId: UUID,
    title: String,
    assignedTo: UUID
) async throws -> Task
```

### 14.2 Architecture Decision Records (ADRs)

Document major technical decisions in `/docs/adr/`:

**Example: ADR-001-supabase-backend.md**
```markdown
# ADR 001: Use Supabase as Backend

## Status
Accepted

## Context
Need a backend with authentication, database, realtime, and file storage.

## Decision
Use Supabase instead of Firebase or custom backend.

## Consequences
- Positive: PostgreSQL with RLS provides strong security model
- Positive: Realtime subscriptions built-in
- Positive: Open source, self-hostable
- Negative: Smaller community than Firebase
- Negative: Less mature than Firebase
```

### 14.3 API Documentation

Generate OpenAPI spec for backend endpoints (future: if exposing custom API).

---

## 15. Contact & Support

**Project Lead:** [Your Name]  
**Technical Documentation:** This file  
**Database Schema:** `supabase_schema.sql`  
**Project Setup:** `README.md`  

**Resources:**
- Supabase Docs: https://supabase.com/docs
- Swift Docs: https://docs.swift.org
- SwiftUI Tutorials: https://developer.apple.com/tutorials/swiftui

---

## Appendix A: Quick Reference

### Essential Commands

**Run Tests:**
```bash
xcodebuild test -scheme FamilyManager -destination 'platform=iOS Simulator,name=iPhone 15'
```

**Run SwiftLint:**
```bash
swiftlint lint
```

**Clean Build:**
```bash
xcodebuild clean -scheme FamilyManager
```

### Key Files to Create First

1. `FamilyManagerApp.swift` - App entry point
2. `AppDependencies.swift` - DI container
3. `Config.swift` - Environment configuration
4. `SupabaseClientManager.swift` - Supabase singleton
5. `CoreDataStack.swift` - Core Data singleton
6. `KeychainManager.swift` - Secure token storage
7. Domain entities: `User.swift`, `Household.swift`, `Task.swift`, `CreditAccount.swift`

### First Features to Implement (in Order)

1. ✅ Authentication (Sign Up, Sign In, Sign Out)
2. ✅ Profile Management
3. ✅ Household Creation & Member Invitation
4. ✅ Task CRUD
5. ✅ Task Completion Flow (Child)
6. ✅ Task Approval Flow (Parent)
7. ✅ Credit Display
8. ✅ Screentime Redemption

---

**Document Version:** 1.0  
**Last Updated:** 2025-01-21  
**Next Review:** Before Phase 2 implementation
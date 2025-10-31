//
//  StartSessionUseCase.swift
//  GymTracker
//
//  Created on 2025-10-22.
//  V2 Clean Architecture - Domain Layer
//

import Foundation

/// Use Case for starting a new workout session
///
/// **Responsibility:**
/// - Create a new DomainWorkoutSession from a workout template
/// - Load exercises from workout template
/// - Ensure no other active sessions exist
/// - Save session to repository
///
/// **Business Rules:**
/// - Only ONE active session allowed at a time
/// - Session starts with all sets marked as incomplete
/// - Session state is `.active` by default
/// - Start date is set to current time
///
/// **Usage:**
/// ```swift
/// let useCase = DefaultStartSessionUseCase(repository: repository)
/// let session = try await useCase.execute(workoutId: workoutId)
/// ```
protocol StartSessionUseCase {
    /// Start a new workout session
    /// - Parameter workoutId: ID of the workout template to use
    /// - Returns: The newly created session
    /// - Throws: UseCaseError if session cannot be started
    func execute(workoutId: UUID) async throws -> DomainWorkoutSession
}

// MARK: - Implementation

/// Default implementation of StartSessionUseCase
final class DefaultStartSessionUseCase: StartSessionUseCase {

    // MARK: - Properties

    private let sessionRepository: SessionRepositoryProtocol

    // TODO: Sprint 1.3 - Add WorkoutRepository to load workout template
    // private let workoutRepository: WorkoutRepositoryProtocol

    // MARK: - Initialization

    init(sessionRepository: SessionRepositoryProtocol) {
        self.sessionRepository = sessionRepository
    }

    // MARK: - Execute

    func execute(workoutId: UUID) async throws -> DomainWorkoutSession {
        print("🔵 StartSessionUseCase: Starting execution")

        // BUSINESS RULE: Only one active session allowed
        if let existingSession = try await sessionRepository.fetchActiveSession() {
            print("❌ StartSessionUseCase: Active session already exists")
            throw UseCaseError.activeSessionExists(existingSession.id)
        }

        // TODO: Sprint 2 - Load workout template from WorkoutRepository
        // let workout = try await workoutRepository.fetch(id: workoutId)
        // guard let workout = workout else {
        //     throw UseCaseError.workoutNotFound(workoutId)
        // }

        // TEMPORARY: Create session with test exercises for MVP demo
        // Will be replaced when WorkoutRepository is implemented
        print("🔵 StartSessionUseCase: Creating test exercises")
        let testExercises = createTestExercises()
        print("   - Created \(testExercises.count) exercises")

        let session = DomainWorkoutSession(
            workoutId: workoutId,
            startDate: Date(),
            exercises: testExercises,
            state: .active,
            workoutName: "Quick Workout"  // TODO: Load from workout template
        )

        print("   - Session created with ID: \(session.id.uuidString)")
        print("   - Exercises in session: \(session.exercises.count)")

        // Save session to repository
        print("🔵 StartSessionUseCase: Saving session to repository")
        do {
            try await sessionRepository.save(session)
            print("✅ StartSessionUseCase: Session saved successfully")
        } catch {
            print("❌ StartSessionUseCase: Failed to save session: \(error)")
            throw UseCaseError.saveFailed(error)
        }

        return session
    }

    // MARK: - Temporary Test Data (TODO: Remove in Sprint 2)

    /// Create test exercises for MVP demo
    /// This will be replaced when WorkoutRepository is implemented
    private func createTestExercises() -> [DomainSessionExercise] {
        let exercise1Id = UUID()
        let exercise2Id = UUID()
        let exercise3Id = UUID()

        return [
            DomainSessionExercise(
                exerciseId: exercise1Id,
                sets: [
                    DomainSessionSet(weight: 100, reps: 8, orderIndex: 0),
                    DomainSessionSet(weight: 100, reps: 8, orderIndex: 1),
                    DomainSessionSet(weight: 100, reps: 8, orderIndex: 2),
                ],
                notes: nil,
                restTimeToNext: 90,  // 1.5 minutes rest
                orderIndex: 0
            ),
            DomainSessionExercise(
                exerciseId: exercise2Id,
                sets: [
                    DomainSessionSet(weight: 80, reps: 10, orderIndex: 0),
                    DomainSessionSet(weight: 80, reps: 10, orderIndex: 1),
                    DomainSessionSet(weight: 80, reps: 10, orderIndex: 2),
                ],
                notes: "Focus on form",
                restTimeToNext: 90,
                orderIndex: 1
            ),
            DomainSessionExercise(
                exerciseId: exercise3Id,
                sets: [
                    DomainSessionSet(weight: 60, reps: 12, orderIndex: 0),
                    DomainSessionSet(weight: 60, reps: 12, orderIndex: 1),
                    DomainSessionSet(weight: 60, reps: 12, orderIndex: 2),
                ],
                notes: nil,
                restTimeToNext: 60,  // 1 minute rest
                orderIndex: 2
            ),
        ]
    }
}

// MARK: - Use Case Errors

/// Errors that can occur during Use Case execution
enum UseCaseError: Error, LocalizedError {
    /// Another session is already active
    case activeSessionExists(UUID)

    /// Workout template not found
    case workoutNotFound(UUID)

    /// Session not found
    case sessionNotFound(UUID)

    /// Set not found in session
    case setNotFound(UUID)

    /// Exercise not found in session
    case exerciseNotFound(UUID)

    /// Failed to save to repository
    case saveFailed(Error)

    /// Failed to update in repository
    case updateFailed(Error)

    /// Invalid operation (e.g., completing already completed set)
    case invalidOperation(String)

    var errorDescription: String? {
        switch self {
        case .activeSessionExists(let id):
            return
                "Cannot start a new session. Another session (\(id.uuidString)) is already active. Please complete or pause the active session first."
        case .workoutNotFound(let id):
            return "Workout with ID \(id.uuidString) not found"
        case .sessionNotFound(let id):
            return "Session with ID \(id.uuidString) not found"
        case .setNotFound(let id):
            return "Set with ID \(id.uuidString) not found in session"
        case .exerciseNotFound(let id):
            return "Exercise with ID \(id.uuidString) not found in session"
        case .saveFailed(let error):
            return "Failed to save: \(error.localizedDescription)"
        case .updateFailed(let error):
            return "Failed to update: \(error.localizedDescription)"
        case .invalidOperation(let message):
            return "Invalid operation: \(message)"
        }
    }
}

// MARK: - Tests
// TODO: Move inline tests to separate Test target file
// Tests were removed from production code to avoid XCTest import issues

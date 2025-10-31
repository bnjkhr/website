//
//  RestTimerStateManager.swift
//  GymBo
//
//  Created on 2025-10-22.
//  Rest Timer State Management
//

import Combine
import Foundation

/// State representing an active rest timer
struct RestTimerState: Codable {
    let duration: TimeInterval
    let endDate: Date

    var isExpired: Bool {
        Date() >= endDate
    }
}

/// Manager for rest timer state
///
/// **Features:**
/// - Start/stop rest timers
/// - Persist state across app restarts
/// - Observable for UI updates
///
/// **Usage:**
/// ```swift
/// let manager = RestTimerStateManager()
/// manager.startRest(duration: 90) // 90 seconds
/// if let state = manager.currentState {
///     print("Time remaining: \(state.endDate.timeIntervalSinceNow)")
/// }
/// ```
class RestTimerStateManager: ObservableObject {

    // MARK: - Properties

    @Published var currentState: RestTimerState?

    private let userDefaults = UserDefaults.standard
    private let stateKey = "restTimerState"

    // MARK: - Initialization

    init() {
        loadState()
    }

    // MARK: - Public Methods

    /// Start a new rest timer
    /// - Parameter duration: Duration in seconds
    func startRest(duration: TimeInterval) {
        let endDate = Date().addingTimeInterval(duration)
        currentState = RestTimerState(duration: duration, endDate: endDate)
        saveState()
    }

    /// Cancel the current rest timer
    func cancelRest() {
        currentState = nil
        clearState()
    }

    /// Check if timer has expired and auto-clear
    func checkExpiration() {
        guard let state = currentState, state.isExpired else { return }
        cancelRest()
    }

    // MARK: - Persistence

    func saveState() {
        guard let state = currentState,
            let data = try? JSONEncoder().encode(state)
        else {
            return
        }
        userDefaults.set(data, forKey: stateKey)
    }

    private func loadState() {
        guard let data = userDefaults.data(forKey: stateKey),
            let state = try? JSONDecoder().decode(RestTimerState.self, from: data)
        else {
            return
        }

        // Only load if not expired AND was saved recently (within 10 minutes)
        // This prevents old timers from auto-starting on new workout
        let tenMinutesAgo = Date().addingTimeInterval(-600)
        let wasRecentlySaved = state.endDate > tenMinutesAgo

        if !state.isExpired && wasRecentlySaved {
            currentState = state
        } else {
            clearState()
        }
    }

    private func clearState() {
        userDefaults.removeObject(forKey: stateKey)
    }
}

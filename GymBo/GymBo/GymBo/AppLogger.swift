import Foundation

/// Centralized logging system for GymBo app
/// Simple print-based logging for MVP
///
/// Usage:
/// ```swift
/// AppLogger.workouts.info("Workout saved: \(workout.name)")
/// AppLogger.data.error("Failed to save: \(error.localizedDescription)")
/// ```
enum AppLogger {

    // MARK: - Category Loggers

    static let workouts = Logger(category: "Workouts")
    static let data = Logger(category: "Data")
    static let health = Logger(category: "HealthKit")
    static let exercises = Logger(category: "Exercises")
    static let app = Logger(category: "App")
    static let ui = Logger(category: "UI")
    static let media = Logger(category: "Media")
    static let backup = Logger(category: "Backup")
    static let liveActivity = Logger(category: "LiveActivity")
    static let system = Logger(category: "System")

    // MARK: - Simple Logger

    struct Logger {
        let category: String

        func info(_ message: String) {
            print("ℹ️ [\(category)] \(message)")
        }

        func debug(_ message: String) {
            #if DEBUG
                print("🔍 [\(category)] \(message)")
            #endif
        }

        func error(_ message: String) {
            print("❌ [\(category)] \(message)")
        }

        func warning(_ message: String) {
            print("⚠️ [\(category)] \(message)")
        }
    }
}

//
//  TimerSection.swift
//  GymBo
//
//  Created on 2025-10-22.
//  Active Workout Redesign - Timer Component
//

import SwiftUI

/// Timer section component for active workout view
///
/// **Features:**
/// - Shows Rest Timer OR Workout Duration
/// - Conditional rendering based on rest timer state
/// - Timer controls (±15s, Skip) only when rest timer is active
/// - Black background (always, even in light mode)
///
/// **Design:**
/// - Large timer display (96pt, heavy weight)
/// - Secondary time display below (workout duration when resting)
/// - Control buttons only visible during rest
struct TimerSection: View {

    // MARK: - Properties

    /// Rest timer state manager (optional - might not have active rest)
    let restTimerManager: RestTimerStateManager?

    /// Workout start date for duration calculation
    let workoutStartDate: Date?

    // MARK: - State

    @State private var currentTime = Date()

    // MARK: - Layout Constants

    private enum Layout {
        static let timerHeight: CGFloat = 300
        static let timerFontSize: CGFloat = 96
        static let secondaryFontSize: CGFloat = 32
        static let buttonSpacing: CGFloat = 40
        static let verticalPadding: CGFloat = 40
    }

    // MARK: - Body

    var body: some View {
        VStack(spacing: 0) {
            Spacer()

            if let restState = restTimerManager?.currentState {
                // Rest Timer Active
                restTimerView(restState: restState)
            } else {
                // No Rest Timer - Show Workout Duration
                workoutDurationView
            }

            Spacer()

            // Controls (only if rest timer active)
            if restTimerManager?.currentState != nil {
                timerControls
                    .padding(.bottom, Layout.verticalPadding)
            }
        }
        .frame(height: Layout.timerHeight)
        .frame(maxWidth: .infinity)
        .background(Color.black)
        .foregroundStyle(.white)
        .onAppear {
            // Update timer every second
            Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { _ in
                currentTime = Date()
            }
        }
    }

    // MARK: - Subviews

    /// Rest timer display with countdown
    private func restTimerView(restState: RestTimerState) -> some View {
        VStack(spacing: 8) {
            // Main timer (rest countdown)
            Text(formatRestTime(restState: restState))
                .font(.system(size: Layout.timerFontSize, weight: .heavy, design: .rounded))
                .monospacedDigit()

            Text("PAUSE")
                .font(.caption)
                .foregroundStyle(.gray)

            // Workout duration below
            if let startDate = workoutStartDate {
                Text(formatWorkoutDuration(from: startDate))
                    .font(
                        .system(size: Layout.secondaryFontSize, weight: .medium, design: .rounded)
                    )
                    .foregroundStyle(.gray)
                    .monospacedDigit()
                    .padding(.top, 8)
            }
        }
    }

    /// Workout duration only (no rest timer)
    private var workoutDurationView: some View {
        VStack(spacing: 8) {
            if let startDate = workoutStartDate {
                Text(formatWorkoutDuration(from: startDate))
                    .font(.system(size: Layout.timerFontSize, weight: .heavy, design: .rounded))
                    .monospacedDigit()

                Text("Workout")
                    .font(.caption)
                    .foregroundStyle(.gray)
            } else {
                Text("00:00")
                    .font(.system(size: Layout.timerFontSize, weight: .heavy, design: .rounded))
                    .monospacedDigit()
                    .foregroundStyle(.gray)
            }
        }
    }

    /// Timer control buttons (±15s, Skip)
    private var timerControls: some View {
        HStack(spacing: Layout.buttonSpacing) {
            // -15 seconds
            Button {
                restTimerManager?.adjustTimer(by: -15)
            } label: {
                Image(systemName: "minus.circle")
                    .font(.title2)
                    .foregroundStyle(.white)
            }

            // Skip
            Button {
                restTimerManager?.cancelRest()
                // Post notification for parent view
                NotificationCenter.default.post(name: .skipRestTimer, object: nil)
            } label: {
                Text("Skip")
                    .font(.headline)
                    .foregroundStyle(.white)
                    .padding(.horizontal, 24)
                    .padding(.vertical, 8)
                    .background(
                        Capsule()
                            .strokeBorder(.white, lineWidth: 1.5)
                    )
            }

            // +15 seconds
            Button {
                restTimerManager?.adjustTimer(by: 15)
            } label: {
                Image(systemName: "plus.circle")
                    .font(.title2)
                    .foregroundStyle(.white)
            }
        }
    }

    // MARK: - Helpers

    /// Format rest time remaining (MM:SS)
    private func formatRestTime(restState: RestTimerState) -> String {
        let remaining = max(0, restState.endDate.timeIntervalSince(currentTime))
        let minutes = Int(remaining) / 60
        let seconds = Int(remaining) % 60
        return String(format: "%02d:%02d", minutes, seconds)
    }

    /// Format workout duration (MM:SS or HH:MM:SS)
    private func formatWorkoutDuration(from startDate: Date) -> String {
        let duration = currentTime.timeIntervalSince(startDate)
        let totalSeconds = max(0, Int(duration))
        let hours = totalSeconds / 3600
        let minutes = (totalSeconds % 3600) / 60
        let seconds = totalSeconds % 60

        if hours > 0 {
            return String(format: "%d:%02d:%02d", hours, minutes, seconds)
        } else {
            return String(format: "%02d:%02d", minutes, seconds)
        }
    }
}

// MARK: - RestTimerStateManager Extension

extension RestTimerStateManager {
    /// Adjust timer by adding/subtracting seconds
    /// - Parameter seconds: Seconds to add (positive) or subtract (negative)
    func adjustTimer(by seconds: TimeInterval) {
        guard let state = currentState else { return }

        // Create new state with adjusted end date
        let newEndDate = state.endDate.addingTimeInterval(seconds)
        let adjustedState = RestTimerState(
            duration: state.duration + seconds,
            endDate: newEndDate
        )

        // Update current state
        currentState = adjustedState
        saveState()
    }
}

// MARK: - Notification Name

extension Notification.Name {
    static let skipRestTimer = Notification.Name("skipRestTimer")
}

// MARK: - Previews

#Preview("With Rest Timer") {
    let manager = RestTimerStateManager()
    manager.startRest(duration: 90)  // 1:30

    return TimerSection(
        restTimerManager: manager,
        workoutStartDate: Date().addingTimeInterval(-300)  // 5 minutes ago
    )
}

#Preview("No Rest Timer") {
    TimerSection(
        restTimerManager: nil,
        workoutStartDate: Date().addingTimeInterval(-180)  // 3 minutes ago
    )
}

#Preview("No Workout Started") {
    TimerSection(
        restTimerManager: nil,
        workoutStartDate: nil
    )
}

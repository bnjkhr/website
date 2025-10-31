//
//  ActiveWorkoutSheetView.swift
//  GymBo
//
//  Created on 2025-10-22.
//  V2 Clean Architecture - Active Workout Session UI (NEW SCROLLVIEW DESIGN)
//

import SwiftUI

/// Main view for active workout session - NEW DESIGN
///
/// **Features:**
/// - ScrollView showing ALL exercises (not TabView)
/// - Timer section at top (conditional - only when rest timer active)
/// - Eye icon to show/hide completed exercises
/// - Bottom action bar (fixed)
/// - Compact exercise cards
///
/// **Design Philosophy:**
/// - Workout overview (not one exercise at a time)
/// - Timer-centric (large, prominent when resting)
/// - Compact set rows for space efficiency
/// - Vertical scrolling through all exercises
struct ActiveWorkoutSheetView: View {

    // MARK: - Properties

    @Environment(SessionStore.self) private var sessionStore
    @Environment(\.dismiss) private var dismiss

    @StateObject private var restTimerManager = RestTimerStateManager()

    @State private var showAllExercises = false
    @State private var showEndConfirmation = false
    @State private var showSummary = false

    // MARK: - Body

    var body: some View {
        NavigationStack {
            ZStack {
                if let session = sessionStore.currentSession {
                    VStack(spacing: 0) {
                        // Timer Section (ALWAYS visible)
                        TimerSection(
                            restTimerManager: restTimerManager,
                            workoutStartDate: session.startDate
                        )

                        // Exercise List (ScrollView)
                        if !session.exercises.isEmpty {
                            exerciseListView()
                        } else {
                            emptyExercisesView
                        }

                        // Bottom Action Bar
                        BottomActionBar(
                            onRepeat: {
                                // TODO: Repeat last set
                            },
                            onAddExercise: {
                                // TODO: Add exercise
                            },
                            onReorder: {
                                // TODO: Reorder exercises
                            }
                        )
                    }
                    .navigationBarTitleDisplayMode(.inline)
                    .toolbar {
                        ToolbarItem(placement: .topBarLeading) {
                            eyeToggleButton
                        }

                        ToolbarItem(placement: .principal) {
                            exerciseCounterView(session: session)
                        }

                        ToolbarItem(placement: .topBarTrailing) {
                            endSessionButton
                        }
                    }
                } else {
                    noSessionView
                }
            }
            .confirmationDialog(
                "Workout beenden?",
                isPresented: $showEndConfirmation,
                titleVisibility: .visible
            ) {
                Button("Workout beenden", role: .destructive) {
                    Task {
                        await sessionStore.endSession()
                        showSummary = true
                    }
                }
                Button("Abbrechen", role: .cancel) {}
            } message: {
                Text("Möchtest du das Workout wirklich beenden?")
            }
            .sheet(isPresented: $showSummary) {
                if let session = sessionStore.currentSession {
                    WorkoutSummaryView(session: session) {
                        dismiss()
                    }
                }
            }
        }
    }

    // MARK: - Subviews

    /// ScrollView with all exercises
    private func exerciseListView() -> some View {
        ScrollView {
            LazyVStack(spacing: 8) {
                if let session = sessionStore.currentSession {
                    ForEach(Array(session.exercises.enumerated()), id: \.element.id) {
                        index, exercise in
                        let allSetsCompleted = exercise.sets.allSatisfy { $0.completed }
                        let shouldHide = allSetsCompleted && !showAllExercises

                        if !shouldHide {
                            CompactExerciseCard(
                                exercise: exercise,
                                exerciseIndex: index,
                                totalExercises: session.exercises.count,
                                exerciseName: "Übung \(index + 1)",  // TODO: Load from exercise repository
                                equipment: nil,  // TODO: Load from exercise repository
                                onToggleCompletion: { setId in
                                    Task {
                                        print(
                                            "🔵 Set completion tapped: exercise \(index), setId \(setId)"
                                        )

                                        await sessionStore.completeSet(
                                            exerciseId: exercise.id,
                                            setId: setId
                                        )

                                        print("✅ Set marked complete")

                                        // Start rest timer after EVERY set completion
                                        // Use restTimeToNext from current exercise
                                        if let restTime = exercise.restTimeToNext {
                                            print("🔵 Starting rest timer: \(restTime) seconds")
                                            restTimerManager.startRest(duration: restTime)
                                            print("✅ Rest timer started successfully")
                                        } else {
                                            print("⚠️ No rest time configured for this exercise")
                                        }
                                    }
                                },
                                onAddSet: {
                                    // TODO: Add set to exercise
                                    print("Add set to exercise \(index)")
                                },
                                onMarkAllComplete: {
                                    // TODO: Mark all sets as complete
                                    print("Mark all complete for exercise \(index)")
                                }
                            )
                            .transition(
                                .asymmetric(
                                    insertion: .opacity.combined(with: .move(edge: .bottom)),
                                    removal: .opacity.combined(with: .move(edge: .top))
                                ))
                        }
                    }
                }
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .animation(
                .timingCurve(0.2, 0.0, 0.0, 1.0, duration: 0.3), value: showAllExercises)
        }
        .background(Color.gray.opacity(0.1))
    }

    /// Eye toggle button for show/hide completed exercises
    private var eyeToggleButton: some View {
        Button {
            showAllExercises.toggle()
            UISelectionFeedbackGenerator().selectionChanged()
        } label: {
            Image(systemName: showAllExercises ? "eye.fill" : "eye.slash.fill")
                .font(.title3)
                .foregroundStyle(showAllExercises ? .orange : .primary)
        }
    }

    /// Exercise counter (e.g., "1 / 14")
    private func exerciseCounterView(session: DomainWorkoutSession) -> some View {
        Text("\(session.completedSets) / \(session.totalSets)")
            .font(.headline)
            .monospacedDigit()
    }

    private var emptyExercisesView: some View {
        VStack(spacing: 16) {
            Image(systemName: "figure.walk")
                .font(.system(size: 60))
                .foregroundColor(.secondary)

            Text("Keine Übungen")
                .font(.title2)
                .fontWeight(.semibold)

            Text("Dieses Workout enthält keine Übungen")
                .font(.body)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding()
        .frame(maxHeight: .infinity)
    }

    private var noSessionView: some View {
        VStack(spacing: 16) {
            Image(systemName: "exclamationmark.triangle")
                .font(.system(size: 60))
                .foregroundColor(.orange)

            Text("Keine aktive Session")
                .font(.title2)
                .fontWeight(.semibold)

            Button("Schließen") {
                dismiss()
            }
            .buttonStyle(.borderedProminent)
        }
        .padding()
    }

    private var endSessionButton: some View {
        Button(action: { showEndConfirmation = true }) {
            Text("Beenden")
                .font(.subheadline)
                .fontWeight(.semibold)
        }
    }
}

// MARK: - Workout Summary View

/// Summary view shown after workout completion
struct WorkoutSummaryView: View {

    let session: DomainWorkoutSession
    let onDismiss: () -> Void

    var body: some View {
        NavigationStack {
            VStack(spacing: 24) {
                Spacer()

                // Success icon
                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 80))
                    .foregroundColor(.green)

                // Title
                Text("Workout abgeschlossen!")
                    .font(.title)
                    .fontWeight(.bold)

                // Stats
                VStack(spacing: 16) {
                    summaryRow(
                        icon: "clock",
                        label: "Dauer",
                        value: session.formattedDuration
                    )

                    summaryRow(
                        icon: "checkmark.circle",
                        label: "Sets",
                        value: "\(session.completedSets)/\(session.totalSets)"
                    )

                    summaryRow(
                        icon: "flame",
                        label: "Übungen",
                        value: "\(session.exercises.count)"
                    )

                    if session.totalVolume > 0 {
                        summaryRow(
                            icon: "scalemass",
                            label: "Volumen",
                            value: String(format: "%.0f kg", session.totalVolume)
                        )
                    }
                }
                .padding()
                .background(Color.secondary.opacity(0.1))
                .cornerRadius(16)

                Spacer()

                // Done button
                Button(action: onDismiss) {
                    Text("Fertig")
                        .font(.headline)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.accentColor)
                        .foregroundColor(.white)
                        .cornerRadius(12)
                }
            }
            .padding()
            .navigationTitle("Zusammenfassung")
            .navigationBarTitleDisplayMode(.inline)
        }
    }

    private func summaryRow(icon: String, label: String, value: String) -> some View {
        HStack {
            Image(systemName: icon)
                .frame(width: 30)

            Text(label)
                .foregroundColor(.secondary)

            Spacer()

            Text(value)
                .fontWeight(.semibold)
        }
    }
}

// MARK: - Preview

#Preview("Active Workout - New Design") {
    ActiveWorkoutSheetView()
        .environment(SessionStore.previewWithSession)
}

#Preview("Summary") {
    WorkoutSummaryView(session: .preview) {
        print("Dismissed")
    }
}

//
//  ActiveWorkoutSheetView.swift
//  GymBo
//
//  Created on 2025-10-22.
//  V2 Clean Architecture - Active Workout Session UI
//

import SwiftUI

/// Main view for active workout session
///
/// **Features:**
/// - Display all exercises in session
/// - Navigate between exercises via TabView
/// - Show session stats (duration, completed sets)
/// - End session button
/// - Pause/Resume functionality
///
/// **Design:**
/// - Full-screen sheet
/// - TabView for exercise navigation (swipe between exercises)
/// - Toolbar with stats and end button
struct ActiveWorkoutSheetView: View {

    // MARK: - Properties

    @Environment(SessionStore.self) private var sessionStore
    @Environment(\.dismiss) private var dismiss

    @State private var selectedExerciseIndex: Int = 0
    @State private var showEndConfirmation = false
    @State private var showSummary = false

    // MARK: - Body

    var body: some View {
        NavigationStack {
            ZStack {
                if let session = sessionStore.currentSession {
                    // Main content
                    VStack(spacing: 0) {
                        // Exercise tabs
                        if !session.exercises.isEmpty {
                            TabView(selection: $selectedExerciseIndex) {
                                ForEach(Array(session.exercises.enumerated()), id: \.element.id) {
                                    index, exercise in
                                    ExerciseCard(
                                        exercise: exercise,
                                        exerciseIndex: index,
                                        totalExercises: session.exercises.count
                                    )
                                    .tag(index)
                                }
                            }
                            .tabViewStyle(.page(indexDisplayMode: .always))
                        } else {
                            emptyExercisesView
                        }
                    }
                    .navigationTitle(session.workoutName ?? "Workout")
                    .navigationBarTitleDisplayMode(.inline)
                    .toolbar {
                        ToolbarItem(placement: .topBarLeading) {
                            sessionStatsView(session: session)
                        }

                        ToolbarItem(placement: .topBarTrailing) {
                            endSessionButton
                        }
                    }
                } else {
                    // No session
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

    private func sessionStatsView(session: DomainWorkoutSession) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text("\(session.completedSets)/\(session.totalSets) Sets")
                .font(.caption)
                .fontWeight(.semibold)

            Text(session.formattedDuration)
                .font(.caption2)
                .foregroundColor(.secondary)
        }
    }

    private var endSessionButton: some View {
        Button(action: { showEndConfirmation = true }) {
            Text("Beenden")
                .font(.subheadline)
                .fontWeight(.semibold)
        }
    }
}

// MARK: - Exercise Card

/// Card view for a single exercise in the session
struct ExerciseCard: View {

    let exercise: DomainSessionExercise
    let exerciseIndex: Int
    let totalExercises: Int

    @Environment(SessionStore.self) private var sessionStore

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // Exercise header
                exerciseHeader

                // Sets list
                VStack(spacing: 12) {
                    ForEach(Array(exercise.sets.enumerated()), id: \.element.id) { index, set in
                        SetRow(
                            set: set,
                            setNumber: index + 1,
                            onComplete: {
                                Task {
                                    await sessionStore.completeSet(
                                        exerciseId: exercise.id,
                                        setId: set.id
                                    )
                                }
                            }
                        )
                    }
                }

                // Notes section
                if let notes = exercise.notes, !notes.isEmpty {
                    notesSection(notes: notes)
                }

                Spacer(minLength: 40)
            }
            .padding()
        }
    }

    private var exerciseHeader: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Exercise number indicator
            Text("Übung \(exerciseIndex + 1) von \(totalExercises)")
                .font(.caption)
                .foregroundColor(.secondary)

            // Exercise name (TODO: Load from exercise repository)
            Text("Exercise \(exercise.exerciseId.uuidString.prefix(8))...")
                .font(.title2)
                .fontWeight(.bold)

            // Progress bar
            ProgressView(value: exercise.progress)
                .tint(.accentColor)

            // Stats
            HStack(spacing: 16) {
                Label(
                    "\(exercise.completedSets)/\(exercise.totalSets)",
                    systemImage: "checkmark.circle"
                )
                .font(.caption)

                if exercise.totalVolume > 0 {
                    Label(String(format: "%.0f kg", exercise.totalVolume), systemImage: "scalemass")
                        .font(.caption)
                }
            }
            .foregroundColor(.secondary)
        }
    }

    private func notesSection(notes: String) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Label("Notizen", systemImage: "note.text")
                .font(.caption)
                .fontWeight(.semibold)
                .foregroundColor(.secondary)

            Text(notes)
                .font(.body)
                .padding()
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Color.secondary.opacity(0.1))
                .cornerRadius(8)
        }
    }
}

// MARK: - Set Row

/// Single set row with completion button
struct SetRow: View {

    let set: DomainSessionSet
    let setNumber: Int
    let onComplete: () -> Void

    var body: some View {
        HStack(spacing: 16) {
            // Set number
            Text("\(setNumber)")
                .font(.headline)
                .frame(width: 30)
                .foregroundColor(set.completed ? .green : .secondary)

            // Weight and reps
            VStack(alignment: .leading, spacing: 4) {
                Text("\(set.formattedWeight)")
                    .font(.headline)

                Text("\(set.formattedReps)")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            Spacer()

            // Volume
            Text(set.formattedVolume)
                .font(.caption)
                .foregroundColor(.secondary)

            // Complete button
            Button(action: {
                onComplete()
                // Haptic feedback
                let impact = UIImpactFeedbackGenerator(style: .medium)
                impact.impactOccurred()
            }) {
                Image(systemName: set.completed ? "checkmark.circle.fill" : "circle")
                    .font(.title2)
                    .foregroundColor(set.completed ? .green : .gray)
            }
            .disabled(set.completed)
        }
        .padding()
        .background(set.completed ? Color.green.opacity(0.1) : Color.secondary.opacity(0.05))
        .cornerRadius(12)
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

#Preview("Active Workout") {
    ActiveWorkoutSheetView()
        .environment(SessionStore.previewWithSession)
}

#Preview("Summary") {
    WorkoutSummaryView(session: .preview) {
        print("Dismissed")
    }
}

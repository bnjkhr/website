//
//  CompactExerciseCard.swift
//  GymBo
//
//  Created on 2025-10-22.
//  Active Workout Redesign - Compact Exercise Card
//

import SwiftUI

/// Compact exercise card for the new ScrollView-based design
///
/// **Features:**
/// - Exercise header (name, equipment, indicator)
/// - Compact set rows (weight | reps | checkbox)
/// - Quick-add field for new sets or notes
/// - Context menu for options
///
/// **Design:**
/// - White card with 39pt corner radius (matches iPhone)
/// - Minimal shadow (radius: 4pt, y: 1pt)
/// - Bold fonts (28pt for weight, 24pt for reps)
/// - 20pt horizontal padding
struct CompactExerciseCard: View {

    // MARK: - Properties

    let exercise: DomainSessionExercise
    let exerciseIndex: Int
    let totalExercises: Int
    let exerciseName: String  // TODO: Load from repository
    let equipment: String?  // TODO: Load from repository

    /// Callbacks
    let onToggleCompletion: ((UUID) -> Void)?  // Set ID (not index!)
    let onAddSet: (() -> Void)?
    let onMarkAllComplete: (() -> Void)?

    // MARK: - State

    @State private var quickAddText: String = ""
    @State private var showMenu = false

    // MARK: - Layout Constants

    private enum Layout {
        static let headerPadding: CGFloat = 20
        static let setPadding: CGFloat = 20
        static let cornerRadius: CGFloat = 39
        static let shadowRadius: CGFloat = 4
        static let shadowY: CGFloat = 1
        static let indicatorSize: CGFloat = 8
    }

    private enum Typography {
        static let nameFontSize: CGFloat = 20
        static let weightFontSize: CGFloat = 28
        static let repsFontSize: CGFloat = 24
        static let unitFontSize: CGFloat = 14
    }

    // MARK: - Body

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Header
            exerciseHeader
                .padding(.horizontal, Layout.headerPadding)
                .padding(.top, 16)

            // Sets
            VStack(spacing: 4) {
                ForEach(Array(exercise.sets.enumerated()), id: \.element.id) { index, set in
                    CompactSetRow(
                        set: set,
                        setNumber: index + 1,
                        onToggle: {
                            onToggleCompletion?(set.id)  // Pass setId, not index!
                        },
                        onUpdateWeight: { newWeight in
                            // TODO: Implement UpdateSetUseCase
                            print("Update weight for set \(set.id): \(newWeight)")
                        },
                        onUpdateReps: { newReps in
                            // TODO: Implement UpdateSetUseCase
                            print("Update reps for set \(set.id): \(newReps)")
                        }
                    )
                    .padding(.horizontal, Layout.setPadding)
                }
            }
            .padding(.top, 12)

            // Quick-add field
            quickAddField
                .padding(.horizontal, Layout.headerPadding)
                .padding(.vertical, 12)

            // Bottom buttons
            bottomButtons
                .padding(.horizontal, Layout.headerPadding)
                .padding(.bottom, 16)
        }
        .background(Color.white)
        .cornerRadius(Layout.cornerRadius)
        .shadow(color: .black.opacity(0.1), radius: Layout.shadowRadius, y: Layout.shadowY)
    }

    // MARK: - Subviews

    /// Exercise header with name and equipment
    private var exerciseHeader: some View {
        HStack(alignment: .top, spacing: 12) {
            // Indicator circle
            Circle()
                .fill(.orange)
                .frame(width: Layout.indicatorSize, height: Layout.indicatorSize)
                .padding(.top, 6)

            // Name and equipment
            VStack(alignment: .leading, spacing: 2) {
                Text(exerciseName)
                    .font(.system(size: Typography.nameFontSize, weight: .semibold))

                if let equipment = equipment {
                    Text(equipment)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }

            Spacer()

            // Menu button
            Button {
                showMenu = true
            } label: {
                Image(systemName: "ellipsis")
                    .foregroundStyle(.secondary)
            }
        }
    }

    /// Quick-add field for sets or notes
    private var quickAddField: some View {
        TextField("Neuer Satz oder Notiz", text: $quickAddText)
            .textFieldStyle(.plain)
            .font(.body)
            .foregroundStyle(.secondary)
            .padding(.vertical, 8)
            .padding(.horizontal, 12)
            .background(Color.gray.opacity(0.1))
            .cornerRadius(8)
            .onSubmit {
                handleQuickAdd()
            }
    }

    /// Bottom action buttons
    private var bottomButtons: some View {
        HStack(spacing: 16) {
            // Mark all complete
            Button {
                onMarkAllComplete?()
            } label: {
                Image(systemName: "checkmark.circle")
                    .font(.title3)
                    .foregroundStyle(.orange)
            }

            Spacer()

            // Add set
            Button {
                onAddSet?()
            } label: {
                Image(systemName: "plus.circle")
                    .font(.title3)
                    .foregroundStyle(.orange)
            }

            // Reorder (placeholder)
            Button {
                // TODO: Reorder functionality
            } label: {
                Image(systemName: "line.3.horizontal")
                    .font(.title3)
                    .foregroundStyle(.secondary)
            }
        }
    }

    // MARK: - Actions

    /// Handle quick-add input
    private func handleQuickAdd() {
        let trimmed = quickAddText.trimmingCharacters(in: .whitespaces)
        guard !trimmed.isEmpty else { return }

        // Try to parse as set (e.g., "100 x 8")
        if let (weight, reps) = parseSetInput(trimmed) {
            print("Quick-add set: \(weight)kg x \(reps) reps")
            // TODO: Add set via callback
        } else {
            // Save as note
            print("Quick-add note: \(trimmed)")
            // TODO: Save note via callback
        }

        quickAddText = ""
    }

    /// Parse set input (e.g., "100 x 8" or "100x8")
    private func parseSetInput(_ input: String) -> (weight: Double, reps: Int)? {
        let pattern = #"(\d+(?:\.\d+)?)\s*[xX×]\s*(\d+)"#

        guard let regex = try? NSRegularExpression(pattern: pattern),
            let match = regex.firstMatch(in: input, range: NSRange(input.startIndex..., in: input)),
            match.numberOfRanges == 3
        else {
            return nil
        }

        let weightRange = Range(match.range(at: 1), in: input)!
        let repsRange = Range(match.range(at: 2), in: input)!

        guard let weight = Double(input[weightRange]),
            let reps = Int(input[repsRange])
        else {
            return nil
        }

        return (weight, reps)
    }
}

// MARK: - Previews

#Preview("Single Exercise") {
    CompactExerciseCard(
        exercise: .preview,
        exerciseIndex: 0,
        totalExercises: 3,
        exerciseName: "Bankdrücken",
        equipment: "Barbell",
        onToggleCompletion: { _ in },
        onAddSet: {},
        onMarkAllComplete: {}
    )
    .padding()
}

#Preview("With Notes") {
    CompactExerciseCard(
        exercise: .previewWithNotes,
        exerciseIndex: 1,
        totalExercises: 3,
        exerciseName: "Lat Pulldown",
        equipment: "Cable",
        onToggleCompletion: { _ in },
        onAddSet: {},
        onMarkAllComplete: {}
    )
    .padding()
}

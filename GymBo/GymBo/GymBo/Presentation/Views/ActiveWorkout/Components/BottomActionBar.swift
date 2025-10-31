//
//  BottomActionBar.swift
//  GymBo
//
//  Created on 2025-10-22.
//  Active Workout Redesign - Bottom Action Bar
//

import SwiftUI

/// Fixed bottom action bar for active workout view
///
/// **Features:**
/// - Three action buttons
/// - Left: Repeat/History
/// - Center: Add Exercise (prominent)
/// - Right: Reorder
///
/// **Design:**
/// - Always visible at bottom
/// - White background with subtle shadow
/// - Prominent center button
struct BottomActionBar: View {

    // MARK: - Properties

    let onRepeat: (() -> Void)?
    let onAddExercise: (() -> Void)?
    let onReorder: (() -> Void)?

    // MARK: - Layout Constants

    private enum Layout {
        static let height: CGFloat = 80
        static let centerButtonSize: CGFloat = 44
        static let sideButtonSize: CGFloat = 24
    }

    // MARK: - Body

    var body: some View {
        HStack(spacing: 0) {
            // Left: Repeat/History
            Button {
                onRepeat?()
            } label: {
                Image(systemName: "clock.arrow.circlepath")
                    .font(.system(size: Layout.sideButtonSize))
                    .foregroundStyle(.primary)
            }
            .frame(maxWidth: .infinity)

            // Center: Add Exercise (prominent)
            Button {
                onAddExercise?()
            } label: {
                Image(systemName: "plus.circle.fill")
                    .font(.system(size: Layout.centerButtonSize))
                    .foregroundStyle(.orange)
            }
            .frame(maxWidth: .infinity)

            // Right: Reorder
            Button {
                onReorder?()
            } label: {
                Image(systemName: "arrow.up.arrow.down")
                    .font(.system(size: Layout.sideButtonSize))
                    .foregroundStyle(.primary)
            }
            .frame(maxWidth: .infinity)
        }
        .frame(height: Layout.height)
        .background(Color(.systemBackground))
        .shadow(color: .black.opacity(0.1), radius: 4, y: -2)
    }
}

// MARK: - Previews

#Preview {
    VStack {
        Spacer()
        BottomActionBar(
            onRepeat: { print("Repeat") },
            onAddExercise: { print("Add Exercise") },
            onReorder: { print("Reorder") }
        )
    }
}

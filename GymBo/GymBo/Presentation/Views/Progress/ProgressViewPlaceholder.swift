//
//  ProgressViewPlaceholder.swift
//  GymTracker
//
//  Created on 2025-10-22.
//  V2 Clean Architecture - Progress View Placeholder
//

import SwiftUI

/// Placeholder progress view for V2 MVP
///
/// **Features:**
/// - Shows statistics placeholder
/// - TODO: Replace with full StatisticsView in Phase 3
struct ProgressViewPlaceholder: View {

    var body: some View {
        NavigationStack {
            VStack(spacing: 24) {
                Image(systemName: "chart.line.uptrend.xyaxis")
                    .font(.system(size: 80))
                    .foregroundColor(.secondary)

                Text("Progress & Statistics")
                    .font(.title2.bold())

                Text("Track your fitness journey")
                    .font(.body)
                    .foregroundColor(.secondary)

                Text("Coming in Phase 3")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            .navigationTitle("Progress")
        }
    }
}

// MARK: - Preview

#Preview {
    ProgressViewPlaceholder()
}

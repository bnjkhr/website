//
//  HomeViewPlaceholder.swift
//  GymTracker
//
//  Created on 2025-10-22.
//  V2 Clean Architecture - Home View Placeholder
//

import SwiftUI

/// Placeholder home view for V2 MVP
///
/// **Features:**
/// - Quick start workout button
/// - Shows V2 branding
/// - TODO: Replace with full HomeView in Phase 2
struct HomeViewPlaceholder: View {

    @Environment(SessionStore.self) private var sessionStore
    @State private var showActiveWorkout = false

    var body: some View {
        NavigationStack {
            VStack(spacing: 32) {
                Spacer()

                // V2 Branding
                VStack(spacing: 8) {
                    Text("GymBo")
                        .font(.system(size: 48, weight: .bold))

                    Text("V2.0 Clean Architecture")
                        .font(.title3)
                        .foregroundColor(.secondary)
                }

                // Quick Start Button or Continue Session
                if sessionStore.hasActiveSession {
                    Button(action: { showActiveWorkout = true }) {
                        Label("Training fortsetzen", systemImage: "arrow.clockwise")
                            .font(.headline)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.green)
                            .foregroundColor(.white)
                            .cornerRadius(12)
                    }
                    .padding(.horizontal, 40)
                } else {
                    Button(action: startQuickWorkout) {
                        Label("Schnelles Training starten", systemImage: "play.fill")
                            .font(.headline)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.accentColor)
                            .foregroundColor(.white)
                            .cornerRadius(12)
                    }
                    .padding(.horizontal, 40)
                }

                // Status Info
                VStack(spacing: 4) {
                    if sessionStore.isLoading {
                        ProgressView()
                    }

                    if let error = sessionStore.error {
                        Text("Fehler: \(error.localizedDescription)")
                            .font(.caption)
                            .foregroundColor(.red)
                    }

                    if sessionStore.hasActiveSession {
                        Text("Aktives Training läuft")
                            .font(.caption)
                            .foregroundColor(.green)
                    }
                }

                Spacer()

                // Footer
                Text("V2: Clean Architecture")
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
            .navigationTitle("Start")
            .sheet(isPresented: $showActiveWorkout) {
                if sessionStore.hasActiveSession {
                    ActiveWorkoutSheetView()
                }
            }
            .task {
                await sessionStore.loadActiveSession()
            }
        }
    }

    // MARK: - Actions

    private func startQuickWorkout() {
        Task {
            // TODO: Get actual workout ID from workout list
            // For now, use a hardcoded UUID
            let dummyWorkoutId = UUID()

            await sessionStore.startSession(workoutId: dummyWorkoutId)

            if sessionStore.hasActiveSession {
                showActiveWorkout = true
            }
        }
    }
}

// MARK: - Preview

#Preview {
    HomeViewPlaceholder()
        .environment(SessionStore.preview)
}

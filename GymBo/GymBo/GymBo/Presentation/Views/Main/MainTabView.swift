//
//  MainTabView.swift
//  GymTracker
//
//  Created on 2025-10-22.
//  V2 Clean Architecture - Main Tab Navigation
//

import SwiftUI

/// Main tab bar navigation for GymTracker V2.0
///
/// **Tabs:**
/// 1. Home - Workout list, quick start, calendar
/// 2. Exercises - Browse exercise library
/// 3. Progress - Statistics and analytics
struct MainTabView: View {

    @Environment(SessionStore.self) private var sessionStore
    @State private var selectedTab = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            HomeViewPlaceholder()
                .tabItem {
                    Label("Start", systemImage: "house.fill")
                }
                .tag(0)

            ExercisesViewPlaceholder()
                .tabItem {
                    Label("Übungen", systemImage: "figure.run")
                }
                .tag(1)

            ProgressViewPlaceholder()
                .tabItem {
                    Label("Fortschritt", systemImage: "chart.line.uptrend.xyaxis")
                }
                .tag(2)
        }
    }
}

// MARK: - Preview

#Preview {
    MainTabView()
        .environment(SessionStore.preview)
}

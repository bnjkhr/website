//
//  CompactSetRow.swift
//  GymBo
//
//  Created on 2025-10-22.
//

import SwiftUI

struct CompactSetRow: View {
    
    let set: DomainSessionSet
    let setNumber: Int
    let onToggle: () -> Void
    let onUpdateWeight: ((Double) -> Void)?
    let onUpdateReps: ((Int) -> Void)?
    
    var body: some View {
        HStack(spacing: 16) {
            // Weight
            HStack(spacing: 4) {
                Text(formatNumber(set.weight))
                    .font(.system(size: 28, weight: .bold, design: .rounded))
                    .monospacedDigit()
                    .foregroundStyle(set.completed ? .gray : .primary)
                
                Text("kg")
                    .font(.system(size: 16))
                    .foregroundStyle(.gray)
            }
            
            // Reps
            HStack(spacing: 4) {
                Text("\(set.reps)")
                    .font(.system(size: 28, weight: .bold, design: .rounded))
                    .monospacedDigit()
                    .foregroundStyle(set.completed ? .gray : .primary)
                
                Text("reps")
                    .font(.system(size: 16))
                    .foregroundStyle(.gray)
            }
            
            Spacer()
            
            // Checkbox
            Button {
                onToggle()
                UIImpactFeedbackGenerator(style: .medium).impactOccurred()
            } label: {
                Image(systemName: set.completed ? "checkmark.circle.fill" : "circle")
                    .font(.system(size: 32))
                    .foregroundStyle(set.completed ? .green : .gray.opacity(0.3))
            }
            .disabled(set.completed)
        }
        .padding(.vertical, 8)
        .padding(.horizontal, 4)
    }
    
    private func formatNumber(_ value: Double) -> String {
        if value.truncatingRemainder(dividingBy: 1) == 0 {
            return "\(Int(value))"
        } else {
            return String(format: "%.1f", value)
        }
    }
}

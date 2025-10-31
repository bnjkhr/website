//
//  Item.swift
//  LearnSwiftUI
//
//  Created by Ben Kohler on 08.10.25.
//

import Foundation
import SwiftData

@Model
final class Item {
    var timestamp: Date
    
    init(timestamp: Date) {
        self.timestamp = timestamp
    }
}

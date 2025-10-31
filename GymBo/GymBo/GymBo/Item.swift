//
//  Item.swift
//  GymBo
//
//  Created by Ben Kohler on 22.10.25.
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

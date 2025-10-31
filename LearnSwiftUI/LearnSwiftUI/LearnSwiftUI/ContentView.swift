import SwiftUI

struct ContentView: View {
    @State private var todos = ["Einkaufen", "Sport machen", "SwiftUI lernen"]
    
    var body: some View {
        VStack {
            List {
                
                ForEach(todos, id: \.self) { todo in
                    Text(todo)
                }
                .onDelete { indexSet in
                    todos.remove(atOffsets: indexSet)
                }
                Button("Add todo") {
                    todos.append("New todo")
                }
                .padding()
            }
        }
    }
}

#Preview {
    ContentView()
}

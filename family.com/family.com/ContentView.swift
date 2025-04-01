import SwiftUI
import WebKit

// רכיב WebView שמציג כתובת אינטרנט
struct WebView: UIViewRepresentable {
    let url: URL

    func makeUIView(context: Context) -> WKWebView {
        return WKWebView()
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {
        let request = URLRequest(url: url)
        uiView.load(request)
    }
}

// מבנה ראשי שמציג את ה־WebView
struct ContentView: View {
    var body: some View {
        WebView(url: URL(string: "https://odd-fern-eclipse.glitch.me/")!) // שים פה את הקישור שלך
            .ignoresSafeArea()
    }
}

#Preview {
    ContentView()
}

// Service Worker Registration
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("/sw.js")
            .then((registration) => {
                console.log(
                    "ServiceWorker registration successful:",
                    registration.scope
                );
            })
            .catch((err) => {
                console.log("ServiceWorker registration failed:", err);
            });
    });
}

// Back to top button functionality
const backToTopButton = document.getElementById("back-to-top");

window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
        backToTopButton.classList.add("show");
    } else {
        backToTopButton.classList.remove("show");
    }
});

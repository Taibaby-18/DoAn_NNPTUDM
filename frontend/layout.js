// File: frontend/layout.js
document.addEventListener("DOMContentLoaded", function() {
    const headerPlaceholder = document.getElementById("header-placeholder");
    
    if (headerPlaceholder) {
        // Luôn luôn xuất phát từ /frontend/ để không bao giờ lạc đường
        fetch("/frontend/components/header.html")
            .then(response => {
                if (!response.ok) throw new Error("Không tải được Header");
                return response.text();
            })
            .then(data => {
                headerPlaceholder.innerHTML = data;
            })
            .catch(error => console.error("Lỗi nhúng Layout:", error));
    }
});
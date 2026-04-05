window.updateNavByRole = function(role) {
    const navItemsContainer = document.querySelector('nav');
    if (!navItemsContainer) return;
    
    let linksHTML = `
        <a href="/frontend/index.html" class="hover:text-white transition">Cửa hàng</a>
        <a href="/frontend/topup.html" class="hover:text-white transition">Nạp ví</a>
        <a href="/frontend/User/library.html" class="hover:text-white transition">Thư viện Game</a>
        <a href="/frontend/User/cart.html" class="hover:text-white transition">Giỏ hàng</a>
    `;

    if (role === 'Admin') {
        linksHTML = `
            <a href="/frontend/Admin/Dashboard.html" class="hover:text-white transition">Quản lý</a>
            <a href="/frontend/index.html" class="hover:text-white transition">Cửa hàng</a>
        `;
    } else if (role === 'Publisher') {
        linksHTML = `
            <a href="/frontend/Publisher/Games.html" class="hover:text-white transition">Quản lý Game</a>
            <a href="/frontend/index.html" class="hover:text-white transition">Cửa hàng</a>
        `;
    }
    
    navItemsContainer.innerHTML = linksHTML;
    
    const navLinks = navItemsContainer.querySelectorAll('a');
    const currentPath = window.location.pathname;
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (currentPath.includes(href) || (currentPath.endsWith('/') && href.includes('index.html'))) {
            link.classList.remove('text-gray-300');
            link.classList.add('text-white', 'border-b-2', 'border-[#007dfc]', 'pb-1');
        }
    });
};

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
                
                // --- Khởi tạo Header Logic ---
                const userMenu = document.getElementById('userMenu');
                const loginBtn = document.getElementById('loginBtn');
                
                if (localStorage.getItem('token')) {
                    if (userMenu) {
                        userMenu.classList.remove('hidden');
                        userMenu.classList.add('flex');
                    }
                } else {
                    if (loginBtn) {
                        loginBtn.classList.remove('hidden');
                    }
                }
                
                // Dropdown logic
                const userDropdownBtn = document.getElementById('userDropdownBtn');
                const userDropdown = document.getElementById('userDropdown');
                
                if (userDropdownBtn && userDropdown) {
                    userDropdownBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        userDropdown.classList.toggle('hidden');
                    });
                    
                    document.addEventListener('click', (e) => {
                        if (userMenu && !userMenu.contains(e.target)) {
                            userDropdown.classList.add('hidden');
                        }
                    });
                }
                // Active Link Logic based on role
                const role = localStorage.getItem('userRole') || 'Gamer';
                window.updateNavByRole(role);
            })
            .catch(error => console.error("Lỗi nhúng Layout:", error));
    }
});

window.logout = function() {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    window.location.href = '/frontend/login.html';
};
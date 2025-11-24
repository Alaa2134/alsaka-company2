
const getStorage = (key, defaultValue = []) => JSON.parse(localStorage.getItem(key)) || defaultValue;
const setStorage = (key, value) => localStorage.setItem(key, JSON.stringify(value));

let products = getStorage('products', [
    { id: 1, name: 'مجموعة أواني الطهي', price: 250, description: 'أواني عالية الجودة', category: 'مطبخ', stock: 10 },
    { id: 2, name: 'صناديق التخزين', price: 80, description: 'صناديق بلاستيكية شفافة', category: 'تخزين', stock: 15 },
    { id: 3, name: 'أدوات التنظيف', price: 150, description: 'مجموعة شاملة من أدوات التنظيف', category: 'تنظيف', stock: 20 }
]);

let cart = getStorage('cart', []);
let favorites = getStorage('favorites', []);
let users = getStorage('users', []);
let currentUser = getStorage('currentUser', null);
let adminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
let orders = getStorage('orders', []);

function updateCartCount() {
    document.getElementById('cartCount').textContent = cart.length;
}

document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    updateUserMenu();
    if (document.getElementById('homeProductsGrid')) displayHomeProducts();
    if (document.getElementById('productsGrid')) filterProducts();
    if (document.getElementById('categoriesGrid')) displayCategories();
    initMobileNav();
});

document.getElementById('themeToggle')?.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
        themeIcon.src = isLight ? 'icons/sun.svg' : 'icons/moon.svg';
    }
});

if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-mode');
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
        themeIcon.src = 'icons/sun.svg';
    }
} else {
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
        themeIcon.src = 'icons/moon.svg';
    }
}

function toggleUserMenu(event) {
    event?.stopPropagation();
    const menu = document.getElementById('userMenu');
    if (!menu) return;
    
    const isVisible = menu.classList.contains('show');
    
    if (isVisible) {
        menu.classList.remove('show');
    } else {
        menu.style.display = 'block';
        setTimeout(() => menu.classList.add('show'), 10);
    }
}

// Close menu when clicking outside
document.addEventListener('click', function(event) {
    const menu = document.getElementById('userMenu');
    const userButton = document.querySelector('.btn-user');
    
    if (menu && !menu.contains(event.target) && event.target !== userButton) {
        menu.classList.remove('show');
        setTimeout(() => {
            if (!menu.classList.contains('show')) {
                menu.style.display = 'none';
            }
        }, 300);
    }
});

// Close menu on ESC key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const menu = document.getElementById('userMenu');
        if (menu && menu.classList.contains('show')) {
            menu.classList.remove('show');
            setTimeout(() => menu.style.display = 'none', 300);
        }
    }
});

function updateUserMenu() {
    const profileLink = document.getElementById('profileLink');
    const logoutLink = document.getElementById('logoutLink');
    if (!profileLink || !logoutLink) return;
    if (currentUser) {
        profileLink.style.display = 'block';
        logoutLink.style.display = 'block';
    } else {
        profileLink.style.display = 'none';
        logoutLink.style.display = 'none';
    }
}

function loginUser(e) {
    e?.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    let user = users.find(u => u.email === email && u.password === password);
    if (user) {
        currentUser = user;
        setStorage('currentUser', user);
        updateUserMenu();
        window.location.href = 'home.html';
    } else {
        alert('بيانات دخول غير صحيحة');
    }
}

function signupUser(e) {
    e?.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirm = document.getElementById('signupConfirm').value;
    
    if (password !== confirm) {
        alert('كلمات المرور غير متطابقة');
        return;
    }
    
    if (users.find(u => u.email === email)) {
        alert('البريد الإلكتروني مسجل بالفعل');
        return;
    }
    
    const newUser = { id: Date.now(), name, email, password };
    users.push(newUser);
    setStorage('users', users);
    alert('تم إنشاء الحساب بنجاح');
    window.location.href = 'login.html';
}

function logoutUser() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateUserMenu();
    window.location.href = 'home.html';
}

function adminLogin(e) {
    if (e) e.preventDefault();
    const userField = document.getElementById('adminEmail');
    const passField = document.getElementById('adminPassword');
    const statusBox = document.getElementById('adminLoginStatus');
    if (!userField || !passField) return;
    const email = userField.value.trim().toLowerCase();
    const password = passField.value.trim();
    console.log('Attempting login with:', email, password);
    userField.style.borderColor = '';
    passField.style.borderColor = '';
    if (email === 'admin' && password === '123456') {
        // Success: set flag and redirect after short delay
        adminLoggedIn = true;
        localStorage.setItem('adminLoggedIn', 'true');
        if (statusBox) {
            statusBox.style.display = 'block';
            statusBox.style.borderColor = 'rgba(46,204,113,0.5)';
            statusBox.style.background = 'rgba(46,204,113,0.15)';
            statusBox.textContent = 'تم تسجيل الدخول بنجاح، جاري فتح لوحة التحكم...';
        }
        setTimeout(() => {
            window.location.href = 'admin-dashboard.html';
        }, 600);
    } else {
        if (statusBox) {
            statusBox.style.display = 'block';
            statusBox.style.borderColor = 'rgba(231,76,60,0.5)';
            statusBox.style.background = 'rgba(231,76,60,0.15)';
            statusBox.textContent = 'بيانات دخول غير صحيحة';
        }
        userField.style.borderColor = '#E74C3C';
        passField.style.borderColor = '#E74C3C';
    }
}

function logoutAdmin() {
    adminLoggedIn = false;
    localStorage.removeItem('adminLoggedIn');
    window.location.href = 'home.html';
}

function displayHomeProducts() {
    const grid = document.getElementById('homeProductsGrid');
    grid.innerHTML = products.slice(0, 3).map(createProductCard).join('');
}

function filterProducts() {
    const category = document.getElementById('categoryFilter')?.value || '';
    const search = document.getElementById('searchInput')?.value.toLowerCase() || '';
    
    let filtered = products.filter(p => 
        (!category || p.category === category) && 
        p.name.toLowerCase().includes(search)
    );
    
    const grid = document.getElementById('productsGrid');
    if (grid) grid.innerHTML = filtered.map(createProductCard).join('');
}

function createProductCard(product) {
    const imageHtml = product.image 
        ? `<img src="${product.image}" alt="${product.name}" loading="lazy" onload="this.style.opacity=1" style="opacity:0; transition: opacity 0.3s;">` 
        : '';
    return `
        <div class="product-card">
            <div class="product-image">
                ${imageHtml}
            </div>
            <h3 class="product-name">${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <div class="product-price">${product.price} جنيه</div>
            <button class="btn-add-to-cart" onclick="addToCart(${product.id})">أضف للعربة</button>
        </div>
    `;
}

function displayCategories() {
    const categories = [
        { name: 'أدوات المطبخ', value: 'مطبخ', image: 'cooking_0.jpg' },
        { name: 'أواني وتخزين', value: 'تخزين', image: 'imgo.webp' },
        { name: 'أدوات التنظيف', value: 'تنظيف', image: 'download.jpg' },
        { name: 'بلاستيك ومنوعات', value: 'منوعات', image: 'plastic.jpg' }
    ];
    
    const grid = document.getElementById('categoriesGrid');
    if (grid) {
        grid.innerHTML = categories.map(cat => `
            <div class="product-card" onclick="location.href='products.html'">
                <div class="product-image">
                    <img src="${cat.image}" alt="${cat.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">
                </div>
                <h3 class="product-name">${cat.name}</h3>
            </div>
        `).join('');
    }
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        const existing = cart.find(c => c.id === productId);
        if (existing) {
            existing.quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        setStorage('cart', cart);
        updateCartCount();
        alert('تمت الإضافة للعربة');
    }
}

function removeFromCart(productId) {
    cart = cart.filter(c => c.id !== productId);
    setStorage('cart', cart);
    updateCartCount();
    displayCart();
}

function displayCart() {
    const container = document.getElementById('cartContainer');
    if (!container) return;
    
    if (cart.length === 0) {
        container.innerHTML = '<p>العربة فارغة</p>';
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    container.innerHTML = `
        <div class="cart-layout">
            <div class="cart-items">
                ${cart.map(item => `
                    <div class="cart-item">
                        <div>
                            <h3>${item.name}</h3>
                            <p>${item.price} جنيه</p>
                        </div>
                        <div class="item-quantity">
                            <button onclick="updateQuantity(${item.id}, -1)">-</button>
                            <input type="number" value="${item.quantity}" readonly>
                            <button onclick="updateQuantity(${item.id}, 1)">+</button>
                        </div>
                        <div>${item.price * item.quantity} جنيه</div>
                        <button class="btn-outline" onclick="removeFromCart(${item.id})" style="width: 100%;">حذف</button>
                    </div>
                `).join('')}
            </div>
            <div class="cart-summary">
                <h3>ملخص الطلب</h3>
                <p><span>العدد:</span> <span>${cart.length}</span></p>
                <p class="total"><span>المجموع:</span> <span>${total} جنيه</span></p>
                <button class="btn btn-primary" style="width: 100%;" onclick="checkout()">إتمام الشراء</button>
            </div>
        </div>
    `;
}

function updateQuantity(productId, change) {
    const item = cart.find(c => c.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            setStorage('cart', cart);
            displayCart();
        }
    }
}

function checkout() {
    if (cart.length === 0) {
        alert('العربة فارغة');
        return;
    }
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const order = {
        id: Date.now(),
        date: new Date().toLocaleString('ar-EG'),
        items: cart.map(c => ({ id: c.id, name: c.name, qty: c.quantity, price: c.price })),
        total,
        count: cart.reduce((sum, item) => sum + item.quantity, 0)
    };
    orders.push(order);
    setStorage('orders', orders);
    alert('تم إنشاء الطلب رقم '+order.id+' بنجاح');
    cart = [];
    setStorage('cart', cart);
    updateCartCount();
    displayCart();
    refreshStats();
}

function addToFavorites(productId) {
    const product = products.find(p => p.id === productId);
    if (product && !favorites.find(f => f.id === productId)) {
        favorites.push(product);
        setStorage('favorites', favorites);
        alert('تمت الإضافة للمفضلة');
    }
}

function removeFavorite(productId) {
    favorites = favorites.filter(f => f.id !== productId);
    setStorage('favorites', favorites);
    displayFavorites();
    alert('تم حذف المنتج من المفضلة');
}

function deleteAllFavorites() {
    if (!confirm('هل أنت متأكد من حذف جميع المفضلات؟')) return;
    favorites = [];
    setStorage('favorites', favorites);
    displayFavorites();
    displayAdminFavorites();
    alert('تم حذف جميع المفضلات');
}

function adminDeleteFavorite(productId) {
    if (!adminLoggedIn) return;
    favorites = favorites.filter(f => f.id !== productId);
    setStorage('favorites', favorites);
    displayAdminFavorites();
    refreshStats();
    alert('تم حذف المنتج من المفضلة');
}

function displayAdminFavorites() {
    const grid = document.getElementById('adminFavoritesGrid');
    const countEl = document.getElementById('favoritesCount');
    
    if (countEl) countEl.textContent = favorites.length;
    
    if (!grid) return;
    
    if (favorites.length === 0) {
        grid.innerHTML = '<p style="grid-column:1/-1; text-align:center; opacity:0.7;">لا توجد عناصر في المفضلة</p>';
        return;
    }
    
    grid.innerHTML = favorites.map(fav => `
        <div class="product-card">
            ${fav.image ? `<div class="product-image" style="margin-bottom:0.5rem; height:150px;"><img src="${fav.image}" alt="${fav.name}" loading="lazy" onload="this.style.opacity=1" style="opacity:0; transition: opacity 0.3s;"></div>` : '<div class="product-image" style="height:150px; margin-bottom:0.5rem;"></div>'}
            <h3 class="product-name">${fav.name}</h3>
            <div class="product-price">${fav.price} جنيه</div>
            <button class="btn-outline" style="width: 100%; margin-top: 0.5rem;" onclick="adminDeleteFavorite(${fav.id})">حذف من المفضلة</button>
        </div>
    `).join('');
}

function displayFavorites() {
    const container = document.getElementById('favoritesContainer');
    if (!container) return;
    
    if (favorites.length === 0) {
        container.innerHTML = '<p>لا توجد عناصر في المفضلة</p>';
        return;
    }
    
    container.innerHTML = `
        <div style="margin-bottom:1.5rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
            <p style="font-size:1.1rem; opacity:0.9;">لديك <strong>${favorites.length}</strong> منتج في المفضلة</p>
            <button class="btn-outline" onclick="deleteAllFavorites()" style="background:#E74C3C; color:white; border-color:#E74C3C;">حذف الكل</button>
        </div>
        <div class="grid-3">${favorites.map(fav => `
        <div class="product-card">
            ${fav.image ? `<div class="product-image"><img src="${fav.image}" alt="${fav.name}" loading="lazy" onload="this.style.opacity=1" style="opacity:0; transition: opacity 0.3s;"></div>` : '<div class="product-image"></div>'}
            <h3 class="product-name">${fav.name}</h3>
            <div class="product-price">${fav.price} جنيه</div>
            <button class="btn-add-to-cart" onclick="addToCart(${fav.id})">أضف للعربة</button>
            <button class="btn-outline" style="width: 100%; margin-top: 0.5rem;" onclick="removeFavorite(${fav.id})">حذف</button>
        </div>
    `).join('')}</div>`;
}

function displayProfile() {
    const container = document.getElementById('profileContainer');
    if (!container) return;
    
    if (!currentUser) {
        container.innerHTML = '<p>يرجى <a href="login.html">تسجيل الدخول</a> أولاً</p>';
        return;
    }
    
    container.innerHTML = `
        <div class="profile-box">
            <div class="profile-info-item">
                <span class="profile-info-label">الاسم:</span>
                <span>${currentUser.name}</span>
            </div>
            <div class="profile-info-item">
                <span class="profile-info-label">البريد الإلكتروني:</span>
                <span>${currentUser.email}</span>
            </div>
        </div>
    `;
}

function addProduct(e) {
    e?.preventDefault();
    if (!adminLoggedIn) {
        alert('يرجى تسجيل الدخول كمسؤول');
        return;
    }
    const nameEl = document.getElementById('productName');
    const priceEl = document.getElementById('productPrice');
    const descEl = document.getElementById('productDesc');
    const catEl = document.getElementById('productCategory');
    const stockEl = document.getElementById('productStock');
    const imageEl = document.getElementById('productImage');
    const errorsBox = document.getElementById('productErrors');
    const errors = [];
    if (!nameEl.value.trim() || nameEl.value.trim().length < 2) errors.push('الاسم قصير جداً');
    if (!priceEl.value || parseFloat(priceEl.value) <= 0) errors.push('السعر يجب أن يكون رقم موجب');
    if (!descEl.value.trim() || descEl.value.trim().length < 5) errors.push('الوصف قصير جداً');
    if (!catEl.value) errors.push('اختر فئة صحيحة');
    if (!stockEl.value || parseInt(stockEl.value) < 0) errors.push('الكمية يجب أن تكون صفر أو أكثر');
    if (errors.length) {
        if (errorsBox) {
            errorsBox.style.display = 'block';
            errorsBox.innerHTML = errors.map(e => '<div>• '+e+'</div>').join('');
        }
        return;
    } else if (errorsBox) {
        errorsBox.style.display = 'none';
        errorsBox.innerHTML = '';
    }
    
    const newProduct = {
        id: Date.now(),
        name: nameEl.value.trim(),
        price: parseInt(priceEl.value),
        description: descEl.value.trim(),
        category: catEl.value,
        stock: parseInt(stockEl.value)
    };
    
    // Handle image upload
    if (imageEl && imageEl.files && imageEl.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            newProduct.image = e.target.result;
            products.push(newProduct);
            setStorage('products', products);
            alert('تمت إضافة المنتج مع الصورة');
            document.getElementById('addProductForm').reset();
            document.getElementById('imagePreview').style.display = 'none';
            displayAdminProducts();
            refreshStats();
        };
        reader.readAsDataURL(imageEl.files[0]);
    } else {
        products.push(newProduct);
        setStorage('products', products);
        alert('تمت إضافة المنتج');
        document.getElementById('addProductForm').reset();
        displayAdminProducts();
        refreshStats();
    }
}

function displayAdminProducts() {
    const grid = document.getElementById('productsAdminGrid');
    if (grid) {
        grid.innerHTML = products.map(p => `
            <div class="product-card">
                ${p.image ? `<div class="product-image" style="margin-bottom:0.5rem; height:150px;"><img src="${p.image}" alt="${p.name}" loading="lazy" onload="this.style.opacity=1" style="opacity:0; transition: opacity 0.3s;"></div>` : '<div class="product-image" style="margin-bottom:0.5rem; height:150px;"></div>'}
                <h3>${p.name}</h3>
                <p>السعر: ${p.price}</p>
                <p>الكمية: ${p.stock}</p>
                <button class="btn-outline" style="width: 100%;" onclick="deleteProduct(${p.id})">حذف</button>
            </div>
        `).join('');
    }
}

function deleteProduct(productId) {
    if (!adminLoggedIn) return;
    products = products.filter(p => p.id !== productId);
    setStorage('products', products);
    displayAdminProducts();
    refreshStats();
}

function displayUsers() {
    const container = document.getElementById('usersContainer');
    if (container) {
        container.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>الاسم</th>
                        <th>البريد الإلكتروني</th>
                        <th>الإجراءات</th>
                    </tr>
                </thead>
                <tbody>
                    ${users.map(u => `
                        <tr>
                            <td>${u.name}</td>
                            <td>${u.email}</td>
                            <td><button class="btn-outline" onclick="deleteUser(${u.id})" style="padding: 0.5rem 1rem;">حذف</button></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }
}

function deleteUser(userId) {
    if (!adminLoggedIn) return;
    users = users.filter(u => u.id !== userId);
    setStorage('users', users);
    displayUsers();
    refreshStats();
}

function showSection(sectionId) {
    document.querySelectorAll('section[id$="-section"]').forEach(s => s.style.display = 'none');
    document.getElementById(sectionId).style.display = 'block';
}

function initMobileNav() {
    const hamburger = document.querySelector('.hamburger');
    const nav = document.querySelector('.nav');
    if (!hamburger || !nav) return;
    hamburger.addEventListener('click', () => toggleMobileNav());
    // Close nav on link click (mobile only)
    nav.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
            if (window.innerWidth <= 600 && nav.classList.contains('open')) {
                toggleMobileNav();
            }
        });
    });
    window.addEventListener('resize', () => {
        if (window.innerWidth > 600) {
            nav.classList.remove('open');
            document.body.classList.remove('nav-lock');
            hamburger.classList.remove('active');
        }
    });
}

// New: Admin dashboard initializer (replaces inline script in admin-dashboard.html)
function initAdminDashboard() {
    const dashboardProductsGrid = document.getElementById('productsAdminGrid');
    const usersContainer = document.getElementById('usersContainer');
    const addForm = document.getElementById('addProductForm');
    // Only run on dashboard page
    if (!dashboardProductsGrid || !addForm) return;
    // Guard
    if (!localStorage.getItem('adminLoggedIn')) {
        console.log('Admin not logged in. Redirecting to admin-login.html');
        window.location.href = 'admin-login.html';
        return;
    }
    // Attach listener once
    if (!addForm.dataset.bound) {
        addForm.addEventListener('submit', addProduct);
        addForm.dataset.bound = 'true';
    }
    
    // Image preview functionality
    const imageInput = document.getElementById('productImage');
    if (imageInput) {
        imageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            const preview = document.getElementById('imagePreview');
            const previewImg = document.getElementById('previewImg');
            if (file && preview && previewImg) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    previewImg.src = event.target.result;
                    preview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Safe render products
    try {
        if (typeof displayAdminProducts === 'function') {
            displayAdminProducts();
        } else {
            console.warn('displayAdminProducts not defined');
        }
    } catch (err) {
        console.error('Error rendering admin products:', err);
        dashboardProductsGrid.innerHTML = '<p style="color:#E74C3C">خطأ في تحميل المنتجات</p>';
    }
    // Safe render users
    try {
        if (typeof displayUsers === 'function') {
            displayUsers();
        } else {
            console.warn('displayUsers not defined');
        }
    } catch (err) {
        console.error('Error rendering users:', err);
        if (usersContainer) usersContainer.innerHTML = '<p style="color:#E74C3C">خطأ في تحميل المستخدمين</p>';
    }
    displayOrders();
    displayAdminFavorites();
    refreshStats();
}

// Invoke after DOM ready
document.addEventListener('DOMContentLoaded', () => {
    initAdminDashboard();
});

function toggleMobileNav() {
    const nav = document.querySelector('.nav');
    const hamburger = document.querySelector('.hamburger');
    if (!nav || !hamburger) return;
    nav.classList.toggle('open');
    hamburger.classList.toggle('active');
    document.body.classList.toggle('nav-lock');
}

function displayOrders() {
    const container = document.getElementById('ordersContainer');
    if (!container) return;
    if (!orders.length) {
        container.innerHTML = '<p>لا توجد طلبات بعد</p>';
        return;
    }
    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>رقم</th>
                    <th>التاريخ</th>
                    <th>المجموع</th>
                    <th>عدد العناصر</th>
                </tr>
            </thead>
            <tbody>
                ${orders.map(o => `
                    <tr>
                        <td>${o.id}</td>
                        <td>${o.date}</td>
                        <td>${o.total}</td>
                        <td>${o.count}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function refreshStats() {
    const pEl = document.getElementById('productsCount');
    const uEl = document.getElementById('usersCount');
    const oEl = document.getElementById('ordersCount');
    if (pEl) pEl.textContent = products.length;
    if (uEl) uEl.textContent = users.length;
    if (oEl) oEl.textContent = orders.length;
}


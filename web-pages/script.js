// Данные автосервисов (Минск)
const servicesData = [
    { id: 1, name: "АвтоСпец Сервис", lat: 53.9025, lng: 27.5615, address: "ул. Притыцкого 15", rating: 4.9, reviewsCount: 128, services: ["Диагностика", "Замена масла", "Ремонт подвески"], priceRange: "средний", imgIcon: "🔧", phone: "+375 29 111-22-33" },
    { id: 2, name: "МоторМастер", lat: 53.9085, lng: 27.5320, address: "пр-т Победителей 77", rating: 4.7, reviewsCount: 94, services: ["Диагностика", "Шиномонтаж", "Замена масла"], priceRange: "средний", imgIcon: "⚙️", phone: "+375 29 444-55-66" },
    { id: 3, name: "Подвеска-Профи", lat: 53.8972, lng: 27.5798, address: "ул. Кальварийская 23", rating: 4.8, reviewsCount: 211, services: ["Ремонт подвески", "Диагностика"], priceRange: "выше среднего", imgIcon: "🛞", phone: "+375 33 777-88-99" },
    { id: 4, name: "Шиномонтаж 24/7", lat: 53.9150, lng: 27.5485, address: "ул. Немига 8", rating: 4.5, reviewsCount: 67, services: ["Шиномонтаж", "Замена масла"], priceRange: "низкий", imgIcon: "🛞", phone: "+375 44 123-45-67" },
    { id: 5, name: "Диагност+", lat: 53.8930, lng: 27.5150, address: "ул. Тимирязева 12", rating: 4.9, reviewsCount: 203, services: ["Диагностика", "Ремонт подвески"], priceRange: "средний", imgIcon: "📟", phone: "+375 25 987-65-43" }
];

// Хранилище бронирований и отзывов (localStorage)
let bookings = JSON.parse(localStorage.getItem("autobooking")) || [];
let reviews = JSON.parse(localStorage.getItem("autoreviews")) || [
    { author: "Дмитрий", rating: 5, text: "Отличный сервис, быстро нашли неисправность!", date: "2025-03-10" },
    { author: "Елена", rating: 4, text: "Удобная запись, сделали вовремя.", date: "2025-03-12" },
    { author: "Игорь", rating: 5, text: "Понравился калькулятор цены, почти сошлось.", date: "2025-03-15" }
];

function saveReviews() { localStorage.setItem("autoreviews", JSON.stringify(reviews)); }
function saveBookings() { localStorage.setItem("autobooking", JSON.stringify(bookings)); }

let map;
let markers = [];
let currentFilter = { serviceType: "all", minRating: 3.5, search: "" };

// Инициализация карты
function initMap() {
    map = L.map('map').setView([53.9045, 27.5615], 13);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap & CartoDB'
    }).addTo(map);
    addMarkers(servicesData);
}

function addMarkers(services) {
    markers.forEach(m => map.removeLayer(m));
    markers = [];
    services.forEach(s => {
        const popupContent = `<b>${s.name}</b><br>⭐ ${s.rating}<br>${s.address}<br><button class="btn-secondary" onclick="openBooking(${s.id})">Записаться</button>`;
        const marker = L.marker([s.lat, s.lng]).addTo(map);
        marker.bindPopup(popupContent);
        marker.on('click', () => openBooking(s.id));
        markers.push(marker);
    });
}

// Отображение карточек сервисов
function renderServiceCards(services) {
    const grid = document.getElementById('servicesGrid');
    if (!grid) return;
    grid.innerHTML = services.map(s => `
        <div class="service-card">
            <div class="card-img">${s.imgIcon || '🔧'} ${s.name.substring(0,2)}</div>
            <div class="card-content">
                <div class="card-title">${s.name}</div>
                <div class="rating">⭐ ${s.rating} (${s.reviewsCount} отзывов)</div>
                <div class="services-list">📋 Услуги: ${s.services.join(', ')}</div>
                <div class="price-tag">💰 Ценовой сегмент: ${s.priceRange}</div>
                <div class="card-actions">
                    <button class="btn-primary" onclick="openBooking(${s.id})">Записаться</button>
                    <button class="btn-secondary" onclick="viewDetails(${s.id})">Подробнее</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Фильтрация
function filterServices() {
    let filtered = [...servicesData];
    if (currentFilter.serviceType !== "all") {
        filtered = filtered.filter(s => s.services.includes(currentFilter.serviceType));
    }
    filtered = filtered.filter(s => s.rating >= currentFilter.minRating);
    if (currentFilter.search.trim() !== "") {
        const q = currentFilter.search.toLowerCase();
        filtered = filtered.filter(s => s.name.toLowerCase().includes(q) || s.address.toLowerCase().includes(q));
    }
    renderServiceCards(filtered);
    addMarkers(filtered);
    return filtered;
}

// Открыть модалку записи
window.openBooking = function(serviceId) {
    const service = servicesData.find(s => s.id === serviceId);
    if (!service) return;
    document.getElementById('modalServiceName').innerText = service.name;
    document.getElementById('modalServiceSelect').value = service.services[0];
    document.getElementById('bookingServiceId').value = service.id;
    document.getElementById('bookingForm').reset();
    document.getElementById('bookingDate').valueAsDate = new Date();
    document.getElementById('bookingModal').style.display = 'flex';
};

window.viewDetails = function(serviceId) {
    const s = servicesData.find(s => s.id === serviceId);
    alert(`📍 ${s.name}\n🏠 ${s.address}\n📞 ${s.phone}\n⭐ Рейтинг: ${s.rating}\n🔧 Услуги: ${s.services.join(', ')}`);
};

// Добавление брони
function addBooking(booking) {
    bookings.push(booking);
    saveBookings();
    updatePersonalAccount();
    alert(`✅ Запись в ${booking.serviceName} на ${booking.date} ${booking.time} подтверждена!`);
}

function updatePersonalAccount() {
    const upcomingDiv = document.getElementById('upcomingBookingsList');
    const historyDiv = document.getElementById('historyBookingsList');
    const now = new Date();
    const upcoming = bookings.filter(b => new Date(b.date + "T" + b.time) >= now);
    const past = bookings.filter(b => new Date(b.date + "T" + b.time) < now);
    upcomingDiv.innerHTML = upcoming.length ? upcoming.map(b => `<div class="booking-item"><b>${b.serviceName}</b> (${b.date} ${b.time})<br>Авто: ${b.car}</div>`).join('') : '<div class="booking-item">Нет предстоящих записей</div>';
    historyDiv.innerHTML = past.length ? past.map(b => `<div class="booking-item"><b>${b.serviceName}</b> ${b.date} ${b.time} — ${b.car}</div>`).join('') : '<div class="booking-item">История пуста</div>';
}

// Отображение отзывов
function renderReviews() {
    const container = document.getElementById('reviewsContainer');
    container.innerHTML = reviews.slice().reverse().map(r => `
        <div class="review-item">
            <div><strong>${r.author}</strong> <span class="review-stars">${"★".repeat(r.rating)}${"☆".repeat(5-r.rating)}</span></div>
            <div style="margin-top:4px;">${r.text}</div>
            <small>${r.date}</small>
        </div>
    `).join('');
}

// Калькулятор
function setupCalculator() {
    const calcBtn = document.getElementById('calcPriceBtn');
    calcBtn.addEventListener('click', () => {
        const serviceSelect = document.getElementById('calcService');
        const selectedText = serviceSelect.options[serviceSelect.selectedIndex].text;
        let price = 0;
        if (selectedText.includes('Диагностика')) price = 1500;
        else if (selectedText.includes('Замена масла')) price = 1200;
        else if (selectedText.includes('Ремонт подвески')) price = 2500;
        else if (selectedText.includes('Шиномонтаж')) price = 800;
        document.getElementById('calcResult').innerHTML = `${price} ₽`;
    });
}

// DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    filterServices();
    renderReviews();
    updatePersonalAccount();
    setupCalculator();

    // Фильтры UI
    const chips = document.querySelectorAll('#serviceFilterChips .chip');
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            chips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            currentFilter.serviceType = chip.getAttribute('data-service');
            filterServices();
        });
    });
    const ratingSlider = document.getElementById('ratingFilter');
    const ratingSpan = document.getElementById('ratingVal');
    ratingSlider.addEventListener('input', () => {
        const val = parseFloat(ratingSlider.value);
        ratingSpan.innerText = val.toFixed(1);
        currentFilter.minRating = val;
        filterServices();
    });
    const searchInput = document.getElementById('searchName');
    searchInput.addEventListener('input', () => {
        currentFilter.search = searchInput.value;
        filterServices();
    });
    document.getElementById('resetFilters').addEventListener('click', () => {
        document.querySelector('#serviceFilterChips .chip').click();
        ratingSlider.value = "3.5";
        ratingSpan.innerText = "3.5";
        currentFilter.minRating = 3.5;
        searchInput.value = "";
        currentFilter.search = "";
        filterServices();
    });

    // Модалка записи
    const modal = document.getElementById('bookingModal');
    const closeModal = document.querySelector('.close-modal');
    closeModal.onclick = () => modal.style.display = 'none';
    window.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
    document.getElementById('bookingForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const serviceId = parseInt(document.getElementById('bookingServiceId').value);
        const service = servicesData.find(s => s.id === serviceId);
        const name = document.getElementById('clientName').value;
        const phone = document.getElementById('clientPhone').value;
        const serviceName = document.getElementById('modalServiceSelect').value;
        const date = document.getElementById('bookingDate').value;
        const time = document.getElementById('bookingTime').value;
        const car = document.getElementById('bookingCar').value;
        if (!date || !time) { alert("Выберите дату и время"); return; }
        addBooking({ id: Date.now(), serviceId, serviceName: service.name, serviceItem: serviceName, name, phone, date, time, car });
        modal.style.display = 'none';
    });

    // Добавление отзыва
    document.getElementById('addReviewBtn').addEventListener('click', () => {
        const text = document.getElementById('newReviewText').value.trim();
        const rating = parseInt(document.getElementById('newRating').value);
        if (!text) { alert("Напишите отзыв"); return; }
        const newRev = { author: "Демо-пользователь", rating, text, date: new Date().toISOString().slice(0,10) };
        reviews.push(newRev);
        saveReviews();
        renderReviews();
        document.getElementById('newReviewText').value = "";
    });

    // Демо-вход
    document.getElementById('demoLoginBtn').addEventListener('click', () => {
        document.getElementById('account').scrollIntoView({ behavior: 'smooth' });
        alert("Вы вошли как демо-пользователь. Личный кабинет отображает ваши записи.");
    });
});
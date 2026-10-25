(function () {
    "use strict";

    const data = window.TABIBAK_DATA;
    const list = document.getElementById("doctors-list");

    if (!data || !list) return;

    const citySelect = document.getElementById("doctor-city");
    const areaSelect = document.getElementById("doctor-area");
    const specialtySelect = document.getElementById("doctor-specialty");
    const ratingSelect = document.getElementById("doctor-rating");
    const count = document.getElementById("results-count");

    data.cities.forEach(function (city) {
        citySelect.add(new Option(city.name, city.id));
    });

    data.specialties.forEach(function (specialty) {
        specialtySelect.add(new Option(specialty, specialty));
    });

    function fillAreas(preferredArea) {
        const previousArea = preferredArea !== undefined
            ? preferredArea
            : areaSelect.value;

        areaSelect.innerHTML = "";
        areaSelect.add(new Option("كل المناطق", ""));

        data.cities
            .filter(function (city) {
                return !citySelect.value || city.id === citySelect.value;
            })
            .forEach(function (city) {
                city.areas.forEach(function (area) {
                    areaSelect.add(new Option(area, area));
                });
            });

        if (Array.from(areaSelect.options).some(function (option) {
            return option.value === previousArea;
        })) {
            areaSelect.value = previousArea;
        } else {
            areaSelect.value = "";
        }
    }

    function doctorCard(doctor) {
        return `
            <article class="doctor-card bg-white rounded-2xl shadow-sm overflow-hidden p-5">
                <div class="bg-blue-50 rounded-xl p-5 text-center text-6xl">${doctor.avatar}</div>
                <h3 class="text-xl font-bold mt-4">${doctor.name}</h3>
                <p class="text-blue-600 my-2">${doctor.specialty}</p>
                <p class="text-gray-600">📍 ${doctor.city}، ${doctor.area}</p>
                <p class="my-2">⭐ ${doctor.rating} <span class="text-gray-400">(${doctor.reviews} تقييم تجريبي)</span></p>
                <p class="font-bold mb-3">سعر الكشف: ${doctor.price} جنيه</p>
                <p class="text-sm ${doctor.availableToday ? "text-green-700" : "text-gray-500"} mb-4">
                    ${doctor.availableToday ? "متاح اليوم (تجريبي)" : "غير متاح اليوم (تجريبي)"}
                </p>
                <a href="doctor.html?id=${doctor.id}" class="block text-center bg-blue-600 text-white rounded-xl p-3">
                    عرض الملف الشخصي
                </a>
            </article>
        `;
    }

    function renderDoctors() {
        const minimumRating = ratingSelect.value ? Number(ratingSelect.value) : null;

        const filteredDoctors = data.doctors.filter(function (doctor) {
            return (!citySelect.value || doctor.cityId === citySelect.value)
                && (!areaSelect.value || doctor.area === areaSelect.value)
                && (!specialtySelect.value || doctor.specialty === specialtySelect.value)
                && (minimumRating === null || doctor.rating >= minimumRating);
        });

        count.textContent = `عدد النتائج: ${filteredDoctors.length}`;

        if (filteredDoctors.length) {
            list.innerHTML = filteredDoctors.map(doctorCard).join("");
            return;
        }

        list.innerHTML = `
            <div class="bg-white rounded-2xl p-8 text-center col-span-full">
                <h3 class="font-bold text-xl mb-3">لا توجد نتائج مطابقة</h3>
                <p>جرّب تغيير المدينة أو المنطقة أو التخصص أو التقييم.</p>
            </div>
        `;
    }

    citySelect.addEventListener("change", function () {
        fillAreas("");
        renderDoctors();
    });
    areaSelect.addEventListener("change", renderDoctors);
    specialtySelect.addEventListener("change", renderDoctors);
    ratingSelect.addEventListener("change", renderDoctors);

    const params = new URLSearchParams(window.location.search);
    if (params.has("city")) {
        const requestedCity = params.get("city");
        if (Array.from(citySelect.options).some(function (option) {
            return option.value === requestedCity;
        })) {
            citySelect.value = requestedCity;
        }
    }

    fillAreas(params.get("area") || "");

    const requestedSpecialty = params.get("specialty") || "";
    if (Array.from(specialtySelect.options).some(function (option) {
        return option.value === requestedSpecialty;
    })) {
        specialtySelect.value = requestedSpecialty;
    }

    const requestedRating = params.get("rating") || "";
    if (Array.from(ratingSelect.options).some(function (option) {
        return option.value === requestedRating;
    })) {
        ratingSelect.value = requestedRating;
    }

    renderDoctors();
})();

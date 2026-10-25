(function () {
    "use strict";

    const data = window.TABIBAK_DATA;
    if (!data) return;

    const featured = document.getElementById("featured-doctors");
    if (featured) {
        featured.innerHTML = data.doctors.slice(0, 6).map(function (doctor) {
            return `
                <article class="bg-white rounded-2xl shadow-sm p-5">
                    <div class="bg-blue-50 rounded-xl text-center text-6xl p-5">${doctor.avatar}</div>
                    <h3 class="font-bold text-xl mt-4">${doctor.name}</h3>
                    <p class="text-blue-600 my-2">${doctor.specialty}</p>
                    <p class="text-gray-600">📍 ${doctor.city}، ${doctor.area}</p>
                    <p class="my-2">⭐ ${doctor.rating} <span class="text-gray-400 text-sm">تقييم تجريبي</span></p>
                    <p class="font-bold mb-4">${doctor.price} جنيه</p>
                    <a class="inline-block rounded-xl bg-blue-600 text-white px-5 py-3" href="pages/doctor.html?id=${doctor.id}">عرض الملف</a>
                </article>
            `;
        }).join("");
    }

    const specialtiesGrid = document.getElementById("specialties-grid");
    if (specialtiesGrid) {
        const specialtyDetails = {
            "طب وجراحة الأسنان": ["🦷", "أطباء الأسنان وجراحة الفم"],
            "الأمراض الجلدية": ["🧴", "تشخيص وعلاج مشكلات الجلد والشعر"],
            "أمراض القلب": ["❤️", "تشخيص ومتابعة أمراض القلب"],
            "طب الأطفال": ["👶", "رعاية الأطفال وحديثي الولادة"],
            "الأمراض الباطنية": ["🩺", "تشخيص ومتابعة الأمراض الباطنية"],
            "طب العيون": ["👁️", "فحص وعلاج أمراض العيون"],
            "جراحة العظام": ["🦴", "علاج مشكلات العظام والمفاصل"],
            "المخ والأعصاب": ["🧠", "تشخيص ومتابعة أمراض المخ والأعصاب"],
            "النساء والتوليد": ["🤰", "متابعة صحة المرأة والحمل والولادة"],
            "الأنف والأذن والحنجرة": ["👂", "علاج مشكلات الأنف والأذن والحنجرة"],
            "المسالك البولية": ["💧", "تشخيص وعلاج أمراض المسالك البولية"],
            "العلاج الطبيعي": ["🏃", "التأهيل وتحسين الحركة"],
            "الطب النفسي": ["💭", "الدعم والتقييم والعلاج النفسي"],
            "الجراحة العامة": ["⚕️", "تقييم الحالات التي قد تحتاج إلى تدخل جراحي"],
            "أمراض الصدر": ["🫁", "تشخيص وعلاج أمراض الجهاز التنفسي"],
            "طب الأسرة": ["👨‍👩‍👧", "الرعاية الصحية الأولية لجميع أفراد الأسرة"]
        };

        specialtiesGrid.innerHTML = data.specialties.map(function (specialty) {
            const details = specialtyDetails[specialty] || ["🩺", "ابحث عن طبيب في هذا التخصص"];
            return `
                <a href="pages/doctors.html?specialty=${encodeURIComponent(specialty)}"
                   class="bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition">
                    <div class="text-5xl mb-5" aria-hidden="true">${details[0]}</div>
                    <h3 class="text-xl font-bold mb-2">${specialty}</h3>
                    <p class="text-gray-500">${details[1]}</p>
                </a>
            `;
        }).join("");
    }

    const area = document.getElementById("home-location-input");
    if (area) {
        area.innerHTML = '<option value="">كل المناطق</option>' + data.cities.map(function (city) {
            return `<optgroup label="${city.name}">${city.areas.map(function (item) {
                return `<option value="${item}">${item}</option>`;
            }).join("")}</optgroup>`;
        }).join("");
    }

    const form = document.getElementById("home-search-form");
    if (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            const query = (document.getElementById("home-search-input")?.value || "").trim();
            const selectedArea = area?.value || "";
            const params = new URLSearchParams();

            if (query) {
                const matchingSpecialty = data.specialties.find(function (specialty) {
                    return specialty.includes(query) || query.includes(specialty);
                });

                if (!matchingSpecialty) {
                    window.alert("من فضلك اكتب اسم تخصص طبي من التخصصات المتاحة.");
                    return;
                }

                params.set("specialty", matchingSpecialty);
            }
            if (selectedArea) params.set("area", selectedArea);

            window.location.href = "pages/doctors.html" + (params.toString() ? "?" + params.toString() : "");
        });
    }
})();

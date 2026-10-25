(function () {
    "use strict";

    const data = window.TABIBAK_DATA;
    const box = document.getElementById("doctor-profile");

    if (!data || !box) return;

    const id = new URLSearchParams(location.search).get("id");
    const d = data.getDoctorById(id);

    if (!d) {
        box.innerHTML = `
            <div class="bg-white rounded-2xl p-10 text-center">
                <div class="text-5xl mb-4">🔎</div>
                <h1 class="text-2xl font-bold mb-3">الطبيب غير موجود</h1>
                <p class="mb-5">تأكد من الرابط أو اختر طبيبًا من القائمة.</p>
                <a class="text-blue-600" href="doctors.html">
                    العودة إلى قائمة الأطباء
                </a>
            </div>
        `;
        return;
    }

    box.innerHTML = `
        <article class="bg-white rounded-2xl shadow-sm overflow-hidden">
            <header class="bg-blue-50 p-8 flex flex-col md:flex-row items-center gap-6">
                <div class="text-8xl">${d.avatar}</div>

                <div class="text-center md:text-right">
                    <h1 class="text-3xl font-bold mb-3">${d.name}</h1>
                    <p class="text-blue-600 text-lg mb-3">${d.specialty}</p>
                    <p>⭐ ${d.rating} (${d.reviews} تقييم )</p>
                    <p class="text-sm text-gray-500 mt-2">
                        بيانات  للعرض فقط
                    </p>
                </div>
            </header>

            <section class="p-6 md:p-8">
                <div class="grid md:grid-cols-2 gap-4">
                    <div class="bg-gray-50 p-5 rounded-xl">
                        <b>📍 العنوان</b>
                        <p class="mt-2">${d.address}</p>
                        <p>${d.city}، ${d.area}</p>
                    </div>

                    <div class="bg-gray-50 p-5 rounded-xl">
                        <b>💰 سعر الكشف</b>
                        <p class="mt-2">${d.price} جنيه مصري ()</p>
                    </div>

                    <div class="bg-gray-50 p-5 rounded-xl">
                        <b>🕒 مواعيد العمل</b>
                        <p class="mt-2">${d.workingHours}</p>
                    </div>

                    <div class="bg-gray-50 p-5 rounded-xl">
                        <b>حالة التوافر</b>
                        <p class="mt-2">
                            ${d.availableToday
                                ? "متاح اليوم (تجريبي)"
                                : "غير متاح اليوم (تجريبي)"}
                        </p>
                    </div>
                </div>

                <h2 class="text-xl font-bold mt-8 mb-3">
                    نبذة تعريفية
                </h2>

                <p class="text-gray-600 leading-8">${d.description}</p>

                <a
                    href="booking.html?doctorId=${encodeURIComponent(d.id)}"
                    id="book-doctor-btn"
                    class="inline-block mt-7 bg-blue-600 text-white rounded-xl px-7 py-3"
                >
                    تجربة حجز موعد
                </a>
            </section>
        </article>
    `;

    const bookingButton = document.getElementById("book-doctor-btn");

    bookingButton.addEventListener("click", function (event) {
        const isLoggedIn =
            sessionStorage.getItem("tabibakLoggedIn") === "true";

        if (!isLoggedIn) {
            event.preventDefault();

            window.location.href = "login.html?required=1";
        }
    });
})();
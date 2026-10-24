(function(){
"use strict";

const data = window.TABIBAK_DATA;
const box = document.getElementById("booking-doctor");
const form = document.getElementById("booking-form");
const success = document.getElementById("booking-success");

if (!data || !box || !form) return;

if (sessionStorage.getItem("tabibakLoggedIn") !== "true") {
const currentUrl = window.location.href;
window.location.href = "login.html?required=1&returnTo=" + encodeURIComponent(currentUrl);
return;
}

const doctorId = new URLSearchParams(location.search).get("doctorId");
const d = data.getDoctorById(doctorId);
const submit = form.querySelector('[type="submit"]');

if (!d) {
box.innerHTML = '<div class="text-center"><h2 class="text-xl font-bold mb-3">لم يتم اختيار طبيب صالح</h2><p>اختر طبيبًا من القائمة أولًا.</p><a href="doctors.html" class="text-blue-600 block mt-4">اختيار طبيب</a></div>';
if (submit) submit.disabled = true;
form.querySelectorAll("input,select,button").forEach(e => {
if (e !== submit) e.disabled = true;
});
return;
}

box.innerHTML = `

<div class="text-center">
    <div class="text-7xl mb-4">${d.avatar}</div>
    <h2 class="text-2xl font-bold mb-2">${d.name}</h2>
    <p class="text-blue-600 mb-3">${d.specialty}</p>
    <p>📍 ${d.city}، ${d.area}</p>
    <p class="font-bold mt-2">${d.price} جنيه (سعر)</p>
</div>`;

const dateInput = document.getElementById("appointment-date");

if (dateInput) {
const now = new Date();
const localDate = new Date(now - now.getTimezoneOffset() * 60000)
.toISOString()
.slice(0, 10);
dateInput.min = localDate;
}

form.addEventListener("submit", e => {
e.preventDefault();

success.classList.add("hidden");

const name = document.getElementById("patient-name").value.trim();
const phone = document.getElementById("patient-phone").value.trim();
const date = dateInput ? dateInput.value : "";
const time = document.getElementById("appointment-time").value;

if (!name || !phone || !date || !time) {
    success.className = "mt-4 p-4 rounded-xl bg-red-50 text-red-700";
    success.textContent = "من فضلك أكمل جميع الحقول المطلوبة.";
    return;
}

const today = new Date();
today.setHours(0, 0, 0, 0);

const chosen = new Date(date + "T00:00:00");

if (Number.isNaN(chosen.getTime()) || chosen < today) {
    success.className = "mt-4 p-4 rounded-xl bg-red-50 text-red-700";
    success.textContent = "يرجى اختيار تاريخ اليوم أو تاريخ لاحق.";
    return;
}

success.className = "mt-4 p-4 rounded-xl bg-green-50 text-green-800";
success.innerHTML = `
    <strong class="block mb-2">تمت  إدخال طلب الموعد بنجاح</strong>
    <p>الطبيب: ${d.name}</p>
    <p>التاريخ: ${date} — الوقت: ${time}</p>`;

});
})();

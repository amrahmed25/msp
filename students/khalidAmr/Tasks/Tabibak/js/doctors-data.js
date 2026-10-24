

(function () {
    "use strict";   
    const cities = [
        {
            id: "cairo",
            name: "القاهرة",
            areas: [
                "مدينة نصر",
                "مصر الجديدة",
                "المعادي",
                "التجمع الخامس"
            ]
        },
        {
            id: "giza",
            name: "الجيزة",
            areas: [
                "الدقي",
                "المهندسين",
                "الهرم",
                "فيصل"
            ]
        },
        {
            id: "alexandria",
            name: "الإسكندرية",
            areas: [
                "سموحة",
                "سيدي جابر",
                "ميامي",
                "لوران"
            ]
        },
        {
            id: "qalyubia",
            name: "القليوبية",
            areas: [
                "بنها",
                "شبرا الخيمة",
                "قليوب",
                "العبور"
            ]
        },
        {
            id: "gharbia",
            name: "الغربية",
            areas: [
                "طنطا",
                "المحلة الكبرى",
                "زفتى",
                "كفر الزيات"
            ]
        },
        {
            id: "menoufia",
            name: "المنوفية",
            areas: [
                "شبين الكوم",
                "منوف",
                "أشمون",
                "السادات"
            ]
        },
        {
            id: "fayoum",
            name: "الفيوم",
            areas: [
                "مدينة الفيوم",
                "سنورس",
                "إطسا",
                "طامية"
            ]
        },
        {
            id: "north-coast",
            name: "الساحل الشمالي",
            areas: [
                "العلمين",
                "مارينا",
                "سيدي عبد الرحمن",
                "رأس الحكمة"
            ]
        }
    ];


    

    const specialties = [
        "طب وجراحة الأسنان",
        "الأمراض الجلدية",
        "أمراض القلب",
        "طب الأطفال",
        "الأمراض الباطنية",
        "طب العيون",
        "جراحة العظام",
        "المخ والأعصاب",
        "النساء والتوليد",
        "الأنف والأذن والحنجرة",
        "المسالك البولية",
        "العلاج الطبيعي",
        "الطب النفسي",
        "الجراحة العامة",
        "أمراض الصدر",
        "طب الأسرة"
    ];


   

    const firstNames = [
        "أحمد",
        "محمد",
        "محمود",
        "عمر",
        "يوسف",
        "مصطفى",
        "خالد",
        "عمرو",
        "إبراهيم",
        "حسن",
        "سارة",
        "منى",
        "نور",
        "مريم",
        "آية",
        "دينا"
    ];

    const lastNames = [
        "محمد",
        "محمود",
        "أحمد",
        "حسن",
        "علي",
        "إبراهيم",
        "عبدالله",
        "مصطفى",
        "حسين",
        "سعيد",
        "عبدالرحمن",
        "كمال",
        "فؤاد",
        "سمير",
        "عادل",
        "منصور"
    ];   

    const prices = [
        200,
        250,
        300,
        350,
        400,
        450,
        500,
        550
    ];
   
    const doctors = [];

    let doctorId = 1;

    cities.forEach(function (city, cityIndex) {

        city.areas.forEach(function (area, areaIndex) {

            for (let i = 0; i < 4; i++) {

                const firstIndex =
                    (doctorId - 1) % firstNames.length;

                const lastIndex =
                    (doctorId * 3 + cityIndex + areaIndex) %
                    lastNames.length;

                const specialtyIndex =
                    (doctorId - 1) % specialties.length;

                const priceIndex =
                    (doctorId + cityIndex + areaIndex) %
                    prices.length;

                const isFemale = firstIndex >= 10;

                const doctor = {

                    id: doctorId,

                    name:
                        "د. " +
                        firstNames[firstIndex] +
                        " " +
                        lastNames[lastIndex],

                    specialty: specialties[specialtyIndex],

                    specialtyKey: specialties[specialtyIndex],

                    cityId: city.id,

                    city: city.name,

                    area: area,

                    price: prices[priceIndex],

                    rating: Number(
                        (4.2 + ((doctorId * 7) % 9) / 10)
                        .toFixed(1)
                    ),

                    reviews: 10 + ((doctorId * 13) % 190),

                    gender: isFemale ? "female" : "male",

                    avatar: isFemale ? "👩🏻‍⚕️" : "👨🏻‍⚕️",

                    availableToday: doctorId % 3 !== 0,

                    clinicName:
                        "عيادة " +
                        firstNames[firstIndex] +
                        " " +
                        lastNames[lastIndex],

                    address:
                        area + "، " + city.name,

                    workingHours:
                        "من ١٠ صباحًا حتى ٨ مساءً",

                    description:
                        "ملف طبي  لعرض إمكانيات منصة طبيبك. " +
                        "البيانات المعروضة ليست بيانات طبية حقيقية."

                };

                doctors.push(doctor);

                doctorId++;

            }

        });

    });
   
    window.TABIBAK_DATA = {

        cities: cities,

        specialties: specialties,

        doctors: doctors,

        getDoctorById: function (id) {

            return doctors.find(function (doctor) {
                return doctor.id === Number(id);
            }) || null;

        },

        getAreasByCity: function (cityId) {

            const city = cities.find(function (item) {
                return item.id === cityId;
            });

            return city ? city.areas : [];

        },

        getDoctorsByCity: function (cityId) {

            return doctors.filter(function (doctor) {
                return doctor.cityId === cityId;
            });

        },

        getDoctorsByArea: function (cityId, area) {

            return doctors.filter(function (doctor) {

                return doctor.cityId === cityId &&
                    doctor.area === area;

            });

        },


        getDoctorsBySpecialty: function (specialty) {

            return doctors.filter(function (doctor) {
                return doctor.specialty === specialty;
            });

        }

    };

    console.log("طبيبك: تم تجهيز البيانات التجريبية.");

    console.log("عدد المدن:", cities.length);

    console.log(
        "عدد المناطق:",
        cities.reduce(function (total, city) {
            return total + city.areas.length;
        }, 0)
    );

    console.log("عدد الأطباء:", doctors.length);

})();
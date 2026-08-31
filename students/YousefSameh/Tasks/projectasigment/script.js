function showDetails(gameName) {
    const gamesData = {
        "pubg": {
            title: "PUBG Mobile",
            details: "لعبة باتل رويال حماسية تجسد حرب الشوارع والبقاء للأقوى، تنافس مع 100 لاعب في خرائط متعددة للوصول للمركز الأول."
        },
        "fortnite": {
            title: "Fortnite",
            details: "لعبة شوتر وبناء استراتيجية عالمية، ابني حصونك واجمع الموارد وقاتل من أجل البقاء في عالم ملون وممتع."
        },
        "clash": {
            title: "Clash Royale",
            details: "لعبة استراتيجية ملحمية تعتمد على جمع البطاقات وبناء التشكيلات لتدمير أبراج الخصم في مواجهات مباشرة وسريعة."
        },
        "fifa27": {
            title: "EA Sports FC 27",
            details: "تجربة كرة القدم الأكثر واقعية مع أحدث انتقالات اللاعبين وتطويرات المحرك الجرافيكي للتحكم الكامل في الملعب."
        },
        "cod": {
            title: "Call of Duty",
            details: "لعبة أشكال القتال والقتال السريع من المنظور الأول، تقدم مواجهات تاكتيكية وأطوار أونلاين متعددة عالية الإثارة."
        },
        "gta5": {
            title: "GTA V",
            details: "عالم مفتوح ضخم يتيح لك خوض مغامرات عالم الجريمة المنظمة، تنفيذ السرقات الكبرى، والاستمتاع طور طور الأونلاين."
        }
    };

    const selectedGame = gamesData[gameName];

    if (selectedGame) {
        alert(`${selectedGame.title}\n\n${selectedGame.details}`);
    }
}
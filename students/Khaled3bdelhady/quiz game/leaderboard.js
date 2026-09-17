
const savedName =
    localStorage.getItem("playerName") || "SHADOW";

const savedAvatar =
    localStorage.getItem("selectedAvatar") ||
    "avatar-1.png.jpg";



const playerName =
    document.getElementById("playerName");

if (playerName) {

    playerName.textContent =
        savedName.toUpperCase();

}



const topAvatar =
    document.getElementById("topAvatar");

if (topAvatar) {

    topAvatar.src =
        savedAvatar;

}



const currentAvatar =
    document.getElementById("currentAvatar");

if (currentAvatar) {

    currentAvatar.src =
        savedAvatar;

}



const filterButtons =
    document.querySelectorAll(".filter-btn");


filterButtons.forEach(function (button) {

    button.addEventListener(
        "click",
        function () {

            filterButtons.forEach(
                function (item) {

                    item.classList.remove("active");

                }
            );


            button.classList.add("active");


            const filter =
                button.getAttribute("data-filter");


            console.log(
                "Leaderboard filter:",
                filter
            );

        }
    );

});



window.addEventListener(
    "load",
    function () {

        const podium =
            document.querySelectorAll(
                ".podium-player"
            );


        podium.forEach(
            function (player, index) {

                player.style.opacity = "0";

                player.style.transform +=
                    " translateY(15px)";


                setTimeout(
                    function () {

                        player.style.transition =
                            "opacity .5s ease, transform .5s ease";

                        player.style.opacity = "1";

                        player.style.transform =
                            player.classList.contains("first")
                                ? "translateY(-20px)"
                                : "translateY(0)";

                    },
                    index * 150
                );

            }
        );

    }
);
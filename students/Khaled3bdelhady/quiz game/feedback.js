
const savedName =
    localStorage.getItem("playerName") || "SHADOW";

const savedAvatar =
    localStorage.getItem("selectedAvatar")
    || "avatar-1.png.jpg";



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



const ratingButtons =
    document.querySelectorAll(".rating-btn");

let selectedRating = null;


ratingButtons.forEach(function (button) {

    button.addEventListener(
        "click",
        function () {

            ratingButtons.forEach(
                function (item) {

                    item.classList.remove("selected");

                }
            );


            button.classList.add("selected");


            selectedRating =
                button.getAttribute("data-rating");

        }
    );

});




const feedbackMessage =
    document.getElementById("feedbackMessage");

const characterCount =
    document.getElementById("characterCount");


feedbackMessage.addEventListener(
    "input",
    function () {

        characterCount.textContent =
            feedbackMessage.value.length;

    }
);



const submitFeedback =
    document.getElementById("submitFeedback");

const successMessage =
    document.getElementById("successMessage");

const feedbackCategory =
    document.getElementById("feedbackCategory");


submitFeedback.addEventListener(
    "click",
    function () {

        const message =
            feedbackMessage.value.trim();



        if (!selectedRating) {

            alert(
                "Please rate your experience first."
            );

            return;
        }



        if (!feedbackCategory.value) {

            alert(
                "Please select a feedback category."
            );

            return;
        }



        if (!message) {

            feedbackMessage.focus();

            return;
        }



        const feedbackData = {

            player:
                savedName,

            rating:
                selectedRating,

            category:
                feedbackCategory.value,

            message:
                message,

            date:
                new Date().toISOString()

        };


        localStorage.setItem(
            "nexusFeedback",
            JSON.stringify(feedbackData)
        );



        successMessage.classList.add("show");


        submitFeedback.disabled = true;


        submitFeedback.innerHTML =
            'SENT <i class="bi bi-check2"></i>';



        feedbackMessage.value = "";

        characterCount.textContent = "0";


    }
);
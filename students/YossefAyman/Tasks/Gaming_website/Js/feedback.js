const subj              = document.getElementById("subject");
const feedText          = document.getElementById("feedback");
const options           = document.getElementById("game");
const otherFeedElement  = document.getElementById("other-feedback");
const feeds             = document.querySelectorAll(".feedType");


const removeError = (e) => e.target.classList.remove("inp-error");
[subj, feedText, otherFeedElement, options].forEach(element => {
    element.addEventListener("input", removeError);
});


feeds.forEach(element => {
    element.addEventListener("change", e => {
        selectedFeed = e.target.value;

        otherFeedElement.style.display = (selectedFeed === 'other' ? "block" : "none");

        feeds.forEach(ele => ele.classList.remove("inp-error"));
        console.log(selectedFeed);
    })
});

function handleSubmit() {
    const selectedFeedInput     = document.querySelector('input[type="radio"]:checked');
    const selectedFeed          = selectedFeedInput ? selectedFeedInput.value : null;
    const selectedOption        = options.value;

    const isSubjValid           = subj.value.trim() !== '';
    const isFeedTextValid       = feedText.value.trim() !== '';
    const isOptionValid         = Boolean(selectedOption);
    const isFeedTypeValid       = Boolean(selectedFeed);
    const isOtherValid          = selectedFeed === 'other' ? otherFeedElement.value.trim() !== '' : true;
    
    if (isSubjValid && isFeedTextValid && isOptionValid && isFeedTypeValid && isOtherValid) {
        alert("Thank you for feedback");
        window.location.href = './feedback.html';
        return;
    }    

    subj.classList.toggle("inp-error", !isSubjValid);
    feedText.classList.toggle("inp-error", !isFeedTextValid);
    options.classList.toggle("inp-error", !isOptionValid);
    otherFeedElement.classList.toggle("inp-error", !isOtherValid);
    
    feeds.forEach(label => 
        label.classList.toggle("inp-error", !isFeedTypeValid)
    )
}
let level = new URLSearchParams(window.location.search).get("level");
    let easy = document.getElementById("easy");
    let medium = document.getElementById("medium");
    let hard = document.getElementById("hard");

    let questions = [];
    let currentQuestion = 0;    
    
    let questionNumber = document.getElementById("currentNumber");
    let progressText = document.getElementById("progressText");
    
    let timer = document.getElementById("timer");
    let time = 20;
    let timerInterval;


    let answered = [];

    let questionTime = [];

    let score = 0;
    let scoreText = document.getElementById("score");   



if(level === "easy"){

    medium.style.display = "none";
    hard.style.display = "none";

    let easyquestions = easy.children;


    for(let i=0; i< easyquestions.length ;i++){
        easyquestions[i].style.display = "none";
    }
    let easyused = [];

    for(let i = 0; i < 10; i++){
        let random = Math.floor(Math.random() * easyquestions.length);

        while(easyused.includes(random)){
            random = Math.floor(Math.random() * easyquestions.length);
        }

        easyused.push(random);
        questions.push(easyquestions[random]);
    }
    questions.sort(() => Math.random() - 0.5);
    questions[0].style.display = "block";
    answerQuestion();
}





if(level === "medium"){

    easy.style.display = "none";
    hard.style.display = "none";

    let mediumquestions = medium.children;


    for(let i=0; i< mediumquestions.length ;i++){
        mediumquestions[i].style.display = "none";
    }
    let mediumused = [];

    for(let i = 0; i < 10; i++){
        let random = Math.floor(Math.random() * mediumquestions.length);

        while(mediumused.includes(random)){
            random = Math.floor(Math.random() * mediumquestions.length);
        }

        mediumused.push(random);
        questions.push(mediumquestions[random]);
    }
    questions.sort(() => Math.random() - 0.5);

    questions[0].style.display = "block";

    answerQuestion();
}



if(level === "hard"){

    medium.style.display = "none";
    easy.style.display = "none";

    let hardquestions = hard.children;


    for(let i=0; i< hardquestions.length ;i++){
        hardquestions[i].style.display = "none";
    }
    let hardused = [];

    for(let i = 0; i < 10; i++){
        let random = Math.floor(Math.random() * hardquestions.length);

        while(hardused.includes(random)){
            random = Math.floor(Math.random() * hardquestions.length);
        }

        hardused.push(random);
        questions.push(hardquestions[random]);
    }
    questions.sort(() => Math.random() - 0.5);
    questions[0].style.display = "block";
    answerQuestion();
}


if(level ==="random"){

    let easyquestions = easy.children;
    let mediumquestions = medium.children;
    let hardquestions = hard.children;

    for(let i = 0; i < easyquestions.length; i++){
        easyquestions[i].style.display = "none";
    }

    for(let i = 0; i < mediumquestions.length; i++){
        mediumquestions[i].style.display = "none";
    }

    for(let i = 0; i < hardquestions.length; i++){
        hardquestions[i].style.display = "none";
    }

    let easyused = [];
    
    for(let i =0 ; i<3 ;i++){
        let random = Math.floor(Math.random()* easyquestions.length);
        while(easyused.includes(random)){
        random = Math.floor(Math.random() * easyquestions.length);
        }
        easyused.push(random);
        questions.push(easyquestions[random]);

    }
 
    
    let mediumused = [];    
    for(let i =0 ; i<4 ;i++){
        let random = Math.floor(Math.random()* mediumquestions.length);
        while(mediumused.includes(random)){
        random = Math.floor(Math.random() * mediumquestions.length);
        }
        mediumused.push(random);
        questions.push(mediumquestions[random]);

    }
    
    
    let hardused = []; 
    for(let i =0 ; i<3 ;i++){
        let random = Math.floor(Math.random()* hardquestions.length);
        while(hardused.includes(random)){
        random = Math.floor(Math.random() * hardquestions.length);
        }
        hardused.push(random);
        questions.push(hardquestions[random]);
    }

    questions.sort(() => Math.random() - 0.5);
    questions[0].style.display = "block";
    answerQuestion();




}

document.getElementById("next").onclick = function(){
    if(answered[currentQuestion] !== true) {
    return;
    }
    if(currentQuestion<questions.length -1){
    questions[currentQuestion].style.display = "none";

    currentQuestion++;
    questionNumber.textContent = (currentQuestion + 1) ;
    progressText.textContent = (currentQuestion + 1) + " / 10";
    questions[currentQuestion].style.display = "block";
    answerQuestion();
    }
    }   

document.getElementById("previous").onclick = function(){
    if(answered[currentQuestion] !== true) {
    return;
    }
    if(currentQuestion>0){

    questions[currentQuestion].style.display = "none";
   

    currentQuestion--;

    questionNumber.textContent = (currentQuestion + 1) ;
    progressText.textContent = (currentQuestion + 1) + " / 10";
    questions[currentQuestion].style.display = "block";
    answerQuestion();
    }
    }

function shuffleAnswers() {
    let buttons = questions[currentQuestion].querySelectorAll("button");

    let parent = buttons[0].parentElement;

    let shuffled = Array.from(buttons).sort(() => Math.random() - 0.5);

    shuffled.forEach(function(button) {
        parent.appendChild(button);
    });
}


function answerQuestion() {
    clearInterval(timerInterval);
    shuffleAnswers();
    let buttons = questions[currentQuestion].querySelectorAll("button");

    let questionIndex = questions[currentQuestion].querySelector(".question-index");
    questionIndex.textContent = String(currentQuestion + 1).padStart(2, "0");
    if(answered[currentQuestion] === true) {
        time = questionTime[currentQuestion] ;
        timer.textContent = time;

        buttons.forEach(function(button) {
            button.disabled = true;
        });    
        return;
    }
        
    time =20;    
    timer.textContent = time;
    timerInterval = setInterval(function(){

        time--;
        timer.textContent = time;
        
    if(time === 0) {
        clearInterval(timerInterval);
        answered[currentQuestion] = true;
        questionTime[currentQuestion] = 0;   

        buttons.forEach(function(button) {
            if(button.dataset.correct === "true") {
                button.style.backgroundColor = "green";
            }
            button.disabled = true;

        });
        }
    }, 1000);




    buttons.forEach(function(button) {
        button.onclick = function() {
            clearInterval(timerInterval);

            answered[currentQuestion] = true;
            questionTime[currentQuestion] = time;
            
            buttons.forEach(function(button) {
                button.disabled = true;
            });

    if(button.dataset.correct === "true") {
        button.style.backgroundColor = "green";
        score++;
        scoreText.textContent = score;
    } else {
        button.style.backgroundColor = "red";

        buttons.forEach(function(button) {
            if(button.dataset.correct === "true") {
                button.style.backgroundColor = "green";
          
            }
        });
    }
    };
});
}    


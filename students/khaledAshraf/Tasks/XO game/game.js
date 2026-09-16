let boxes = document.getElementsByClassName('box');
let resetButton = document.getElementById('restartBtn');
let turn = 'X';
let turnIcon = document.getElementById('turnIcon');
let turnText = document.getElementById('turnText');
let scoreO = document.getElementById('scoreO');
let scoreX = document.getElementById('scoreX');
let scoreTies = document.getElementById('scoreTies');
function makeReset(){
    turn = 'X';
    turnIcon.textContent = 'X';
    solvesOfX = [];
    flagBranchesOfX = [false , false , false , false , false , false , false , false];
    counterOfX = 0;
    solvesOfO = [];
    flagBranchesOfO = [false , false , false , false , false , false , false , false];
    counterOfO = 0;
    for(let i = 0 ; i < boxes.length ; i++){
        boxes[i].style.backgroundColor = "#1f3640";
        boxes[i].textContent = '';
        boxes[i].style.pointerEvents = "auto";
    }
}
function disableBoxes(){
    for(let i = 0 ; i < boxes.length ; i++){
        boxes[i].style.pointerEvents = "none";
    }
}
function enableBoxes(){
    for(let i = 0 ; i < boxes.length ; i++){
        boxes[i].style.pointerEvents = "auto";
    }
}
function clickBox(index){
    if(turn === 'X'){
        boxes[index].style.backgroundColor = "#22D3EE";
        boxes[index].textContent = 'X';
        boxes[index].style.pointerEvents = "none";
        searchWinning();
        turn = 'O';
        turnIcon.textContent = 'O';
        turnText.textContent = "TURN";
    }
    else{
        boxes[index].style.backgroundColor = "#FACC15";
        boxes[index].textContent = 'O';
        boxes[index].style.pointerEvents = "none";
        searchWinning();
        turn = 'X';
        turnIcon.textContent = 'X';
        turnText.textContent = "TURN";
    }
}
function searchWinning(){
    let matchOfX = 0;
    let matchOfO = 0;
    for(let rows = 0; rows <= 2 ; rows++){
        if(boxes[rows].textContent === 'X'){
            matchOfX++;
        }
        else if(boxes[rows].textContent === 'O'){
            matchOfO++;
        }
    }
    if(matchOfX === 3){
        turnText.textContent = 'Wins';
        alert("Row : " + "X Wins");
        disableBoxes();
        setTimeout( ()=> {
            makeReset();
        } , 1000);
        let counter = parseInt(localStorage.getItem("counterOfX"));
        localStorage.setItem("counterOfX" , counter + 1);
        scoreX.textContent = parseInt(localStorage.getItem("counterOfX"));
        return;
    }
    else if(matchOfO === 3){
        turnText.textContent = 'Wins';
        alert("Row : " + "O Wins");
        disableBoxes();
        setTimeout( ()=> {
            makeReset();
        } , 1000);
        let counter = parseInt(localStorage.getItem("counterOfO"));
        localStorage.setItem("counterOfO" , counter + 1);
        scoreO.textContent = parseInt(localStorage.getItem("counterOfO"));
        return;
    }

    matchOfX = 0;
    matchOfO = 0;
    for(let rows = 3; rows <= 5 ; rows++){
        if(boxes[rows].textContent === 'X'){
            matchOfX++;
        }
        else if(boxes[rows].textContent === 'O'){
            matchOfO++;
        }
    }
    if(matchOfX === 3){
        turnText.textContent = 'Wins';
        alert("Row : " + "X Wins");
        disableBoxes();
        setTimeout( ()=> {
            makeReset();
        } , 1000);
        let counter = parseInt(localStorage.getItem("counterOfX"));
        localStorage.setItem("counterOfX" , counter + 1);
        scoreX.textContent = parseInt(localStorage.getItem("counterOfX"));
        return;
    }
    else if(matchOfO === 3){
        turnText.textContent = 'Wins';
        alert("Row : " + "O Wins");
        disableBoxes();
        setTimeout( ()=> {
            makeReset();
        } , 1000);
        let counter = parseInt(localStorage.getItem("counterOfO"));
        localStorage.setItem("counterOfO" , counter + 1);
        scoreO.textContent = parseInt(localStorage.getItem("counterOfO"));
        return;
    }

    matchOfX = 0;
    matchOfO = 0;
    for(let rows = 6; rows <= 8 ; rows++){
        if(boxes[rows].textContent === 'X'){
            matchOfX++;
        }
        else if(boxes[rows].textContent === 'O'){
            matchOfO++;
        }
    }
    if(matchOfX === 3){
        turnText.textContent = 'Wins';
        alert("Row : " + "X Wins");
        disableBoxes();
        setTimeout( ()=> {
            makeReset();
        } , 1000);
        let counter = parseInt(localStorage.getItem("counterOfX"));
        localStorage.setItem("counterOfX" , counter + 1);
        scoreX.textContent = parseInt(localStorage.getItem("counterOfX"));
        return;
    }
    else if(matchOfO === 3){
        turnText.textContent = 'Wins';
        alert("Row : " + "O Wins");
        disableBoxes();
        setTimeout( ()=> {
            makeReset();
        } , 1000);
        let counter = parseInt(localStorage.getItem("counterOfO"));
        localStorage.setItem("counterOfO" , counter + 1);
        scoreO.textContent = parseInt(localStorage.getItem("counterOfO"));
        return;
    }

    matchOfX = 0;
    matchOfO = 0;
    for(let column = 0; column <= 6 ; column+= 3){
         if(boxes[column].textContent === 'X'){
            matchOfX++;
        }
        else if(boxes[column].textContent === 'O'){
            matchOfO++;
        }
    }
    if(matchOfX === 3){
        turnText.textContent = 'Wins';
        alert("Column : " + "X Wins");
        disableBoxes();
        setTimeout( ()=> {
            makeReset();
        } , 1000);
        let counter = parseInt(localStorage.getItem("counterOfX"));
        localStorage.setItem("counterOfX" , counter + 1);
        scoreX.textContent = parseInt(localStorage.getItem("counterOfX"));
        return;
    }
    else if(matchOfO === 3){
        turnText.textContent = 'Wins';
        alert("Column : " + "O Wins");
        disableBoxes();
        setTimeout( ()=> {
            makeReset();
        } , 1000);
        let counter = parseInt(localStorage.getItem("counterOfO"));
        localStorage.setItem("counterOfO" , counter + 1);
        scoreO.textContent = parseInt(localStorage.getItem("counterOfO"));
        return;
    }

    matchOfX = 0;
    matchOfO = 0;
    for(let column = 1; column <= 7 ; column+= 3){
         if(boxes[column].textContent === 'X'){
            matchOfX++;
        }
        else if(boxes[column].textContent === 'O'){
            matchOfO++;
        }
    }
      if(matchOfX === 3){
        turnText.textContent = 'Wins';
        alert("Column : " + "X Wins");
        disableBoxes();
        setTimeout( ()=> {
            makeReset();
        } , 1000);
        let counter = parseInt(localStorage.getItem("counterOfX"));
        localStorage.setItem("counterOfX" , counter + 1);
        scoreX.textContent = parseInt(localStorage.getItem("counterOfX"));
        return;
    }
    else if(matchOfO === 3){
        turnText.textContent = 'Wins';
        alert("Column : " +  "O Wins");
        disableBoxes();
        setTimeout( ()=> {
            makeReset();
        } , 1000);
        let counter = parseInt(localStorage.getItem("counterOfO"));
        localStorage.setItem("counterOfO" , counter + 1);
        scoreO.textContent = parseInt(localStorage.getItem("counterOfO"));
        return;
    }

    matchOfX = 0;
    matchOfO = 0;
    for(let column = 2; column <= 8 ; column+= 3){
         if(boxes[column].textContent === 'X'){
            matchOfX++;
        }
        else if(boxes[column].textContent === 'O'){
            matchOfO++;
        }
    }
      if(matchOfX === 3){
        turnText.textContent = 'Wins';
        alert("Column : " + "X Wins");
        disableBoxes();
        setTimeout( ()=> {
            makeReset();
        } , 1000);
        let counter = parseInt(localStorage.getItem("counterOfX"));
        localStorage.setItem("counterOfX" , counter + 1);
        scoreX.textContent = parseInt(localStorage.getItem("counterOfX"));
        return;
    }
    else if(matchOfO === 3){
        turnText.textContent = 'Wins';
        alert("Column : " + "O Wins");
        disableBoxes();
        setTimeout( ()=> {
            makeReset();
        } , 1000);
        let counter = parseInt(localStorage.getItem("counterOfO"));
        localStorage.setItem("counterOfO" , counter + 1);
        scoreO.textContent = parseInt(localStorage.getItem("counterOfO"));
        return;
    }

    matchOfX = 0;
    matchOfO = 0;
    for(let mainDiagonal  = 0; mainDiagonal <= 8 ; mainDiagonal+= 4){
         if(boxes[mainDiagonal].textContent === 'X'){
            matchOfX++;
        }
        else if(boxes[mainDiagonal].textContent === 'O'){
            matchOfO++;
        }
    }
      if(matchOfX === 3){
        turnText.textContent = 'Wins';
        alert("MainDiagonal : " + "X Wins");
        disableBoxes();
        setTimeout( ()=> {
            makeReset();
        } , 1000);
        let counter = parseInt(localStorage.getItem("counterOfX"));
        localStorage.setItem("counterOfX" ,  counter + 1);
        scoreX.textContent = parseInt(localStorage.getItem("counterOfX"));
        return;
    }
    else if(matchOfO === 3){
        turnText.textContent = 'Wins';
        alert("MainDiagonal : " + "O Wins");
        disableBoxes();
        setTimeout( ()=> {
            makeReset();
        } , 1000);
        let counter = parseInt(localStorage.getItem("counterOfO"));
        localStorage.setItem("counterOfO" , counter + 1);
        scoreO.textContent = parseInt(localStorage.getItem("counterOfO"));
        return;
    }

    matchOfX = 0;
    matchOfO = 0;
    for(let secondaryDiagonal  = 2; secondaryDiagonal <= 6 ; secondaryDiagonal+= 2){
         if(boxes[secondaryDiagonal].textContent === 'X'){
            matchOfX++;
        }
        else if(boxes[secondaryDiagonal].textContent === 'O'){
            matchOfO++;
        }
    }
      if(matchOfX === 3){
        turnText.textContent = 'Wins';
        alert("SecondaryDiagonal : " +  "X Wins");
        disableBoxes();
        setTimeout( ()=> {
            makeReset();
        } , 1000);
        let counter = parseInt(localStorage.getItem("counterOfX"));
        localStorage.setItem("counterOfX" , counter + 1);
        scoreX.textContent = parseInt(localStorage.getItem("counterOfX"));
        return;
    }
    else if(matchOfO === 3){
        turnText.textContent = 'Wins';
        alert("SecondaryDiagonal : " +  "O Wins");
        disableBoxes();
        setTimeout( ()=> {
            makeReset();
        } , 1000);
        let counter = parseInt(localStorage.getItem("counterOfO"));
        localStorage.setItem("counterOfO" , counter + 1);
        scoreO.textContent = parseInt(localStorage.getItem("counterOfO"));
        return;
    }
    let counterIf = 0;
    for(let i = 0 ; i < boxes.length ; i++){
        if(boxes[i].textContent === 'X' || boxes[i].textContent === 'O'){
            counterIf++;
        }
    }
    if(counterIf === 9){
        let counter = parseInt(localStorage.getItem("counterOfTies"));
        localStorage.setItem("counterOfTies" , counter + 1);
        scoreTies.textContent = parseInt(localStorage.getItem("counterOfTies"));
        setTimeout( ()=> {
            makeReset();
        } , 2000);   
    }
}

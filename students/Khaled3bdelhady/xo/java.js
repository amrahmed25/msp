let player="X";        
let playerturn = document.getElementById('playerturn');

let box1 = document.getElementById('box1');

let box2 = document.getElementById('box2');

let box3 = document.getElementById('box3');

let box4 = document.getElementById('box4');

let box5 = document.getElementById('box5');

let box6 = document.getElementById('box6');

let box7 = document.getElementById('box7');

let box8 = document.getElementById('box8');

let box9 = document.getElementById('box9');

let xscore = document.getElementById('xscore');
let xpoints = 0;

let oscore = document.getElementById('oscore');
let opoints = 0;

let tiescore = document.getElementById('tiescore');
let tiepoints =0;

let gameOver =false;

let gamesound =document.getElementById('gamesound')

let finishsound = document.getElementById('finish')


function turn(button){
    if (gameOver) return;

    if(button.textContent ===""){
        button.textContent = player;
        gamesound.play();
        if (player==="X"){
            button.style.color ='#E1A51B';
        }
        else if(player==="O"){
            button.style.color ='#02C3AE'; 
        }


        if(box1.textContent === box2.textContent && box2.textContent === box3.textContent && box1.textContent !="" && box2.textContent !="" && box3.textContent !=""){
            if(player === "X"){
                xpoints++;
                xscore.textContent = xpoints;
                playerturn.textContent = "Player X Wins";
                gameOver = true;
                gamesound.pause();
                finishsound.play();
                return;
            }
            else if (player ==="O"){
                opoints++;
                oscore.textContent = opoints;
                playerturn.textContent = "Player O Wins";
                gameOver = true;
                gamesound.pause();
                finishsound.play();
                return;
                 
            
            }

        }
        if(box4.textContent === box5.textContent && box5.textContent === box6.textContent && box4.textContent !="" && box5.textContent !="" && box6.textContent !=""){
            if(player === "X"){
                xpoints++;
                xscore.textContent = xpoints;
                playerturn.textContent = "Player X Wins";
                gameOver = true;
                gamesound.pause();
                finishsound.play();
                return;

            }
            else if (player ==="O"){
                opoints++;
                oscore.textContent = opoints;
                playerturn.textContent = "Player O Wins";
                gameOver = true;
                gamesound.pause();
                finishsound.play();
                return;
            
            }            
        }
        if(box7.textContent === box8.textContent && box8.textContent === box9.textContent && box7.textContent !="" && box8.textContent !="" && box9.textContent !=""){
            if(player === "X"){
                xpoints++;
                xscore.textContent = xpoints;
                playerturn.textContent = "Player X Wins";
                gameOver = true;
                gamesound.pause();
                finishsound.play();
                return;
            }
            else if (player ==="O"){
                opoints++;
                oscore.textContent = opoints;
                playerturn.textContent = "Player O Wins";
                gameOver = true;
                gamesound.pause();
                finishsound.play();
                return;
                 
            
            }
        }
        if(box1.textContent === box4.textContent && box4.textContent === box7.textContent && box1.textContent !="" && box4.textContent !="" && box7.textContent !=""){
            if(player === "X"){
                xpoints++;
                xscore.textContent = xpoints;
                playerturn.textContent = "Player X Wins";
                gameOver = true;
                gamesound.pause();
                finishsound.play();
                return;
            }
            else if (player ==="O"){
                opoints++;
                oscore.textContent = opoints;
                playerturn.textContent = "Player O Wins";
                gameOver = true;
                gamesound.pause();
                finishsound.play();
                return; 
            
            }
        }
        if(box2.textContent === box5.textContent && box5.textContent === box8.textContent && box2.textContent !="" && box5.textContent !="" && box8.textContent !=""){
            if(player === "X"){
                xpoints++;
                xscore.textContent = xpoints;
                playerturn.textContent = "Player X Wins";
                gameOver = true;
                gamesound.pause();
                finishsound.play();
                return;
            }
            else if (player ==="O"){
                opoints++;
                oscore.textContent = opoints;
                playerturn.textContent = "Player O Wins";
                gameOver = true;
                gamesound.pause();
                finishsound.play();
                return;
                 
            
            }
        }
        if(box3.textContent === box6.textContent && box6.textContent === box9.textContent && box3.textContent !="" && box6.textContent !="" && box9.textContent !=""){
            if(player === "X"){
                xpoints++;
                xscore.textContent = xpoints;
                playerturn.textContent = "Player X Wins";
                gameOver = true;
                gamesound.pause();
                finishsound.play();
                return;
            }
            else if (player ==="O"){
                opoints++;
                oscore.textContent = opoints;
                playerturn.textContent = "Player O Wins";
                gameOver = true;
                gamesound.pause();
                finishsound.play();
                return; 
            
            }
        }
        if(box1.textContent === box5.textContent && box5.textContent === box9.textContent && box1.textContent !="" && box5.textContent !="" && box9.textContent !=""){
            if(player === "X"){
                xpoints++;
                xscore.textContent = xpoints;
                playerturn.textContent = "Player X Wins";
                gameOver = true;
                gamesound.pause();
                finishsound.play();
                return;
            }
            else if (player ==="O"){
                opoints++;
                oscore.textContent = opoints;
                playerturn.textContent = "Player O Wins";
                gameOver = true;
                gamesound.pause();
                finishsound.play();
                return; 
            
            }
        }
        if(box3.textContent === box5.textContent && box5.textContent === box7.textContent && box3.textContent !="" && box5.textContent !="" && box7.textContent !=""){
            if(player === "X"){
                xpoints++;
                xscore.textContent = xpoints;
                playerturn.textContent = "Player X Wins";
                gameOver = true;
                gamesound.pause();
                finishsound.play();
                return;
            }
            else if (player ==="O"){
                opoints++;
                oscore.textContent = opoints;
                playerturn.textContent = "Player O Wins";
                gameOver = true;
                gamesound.pause();
                finishsound.play();
                return; 
            
            }
        }

        if(box1.textContent !=="" && box2.textContent !=="" &&  box3.textContent  !=="" &&  box4.textContent !=="" && box5.textContent !=="" &&  box6.textContent  !=="" &&  box7.textContent !=="" && box8.textContent  !=="" &&  box9.textContent !==""){
            tiepoints++;
            tiescore.textContent = tiepoints;
            playerturn.textContent = "Tie";
            playerturn.style.color = '#f1f5f9';
            gameOver = true;
            gamesound.pause();
                finishsound.play();
            return; 

        }

        player = player ==="X"?"O":"X";
        if(player==="X"){
            playerturn.textContent ="Player X's Turn";
            
            playerturn.style.color="#E1A51B";
            }
        else if(player==="O"){
            playerturn.textContent ="Player O's Turn";
            playerturn.style.color="#02C3AE";

        }


    }

}

function ResetBoard(){
    box1.textContent= "";
    box2.textContent= "";
    box3.textContent= "";
    box4.textContent= "";
    box5.textContent= "";
    box6.textContent= "";
    box7.textContent= "";
    box8.textContent= "";
    box9.textContent= "";

    finishsound.pause();
    finishsound.currentTime = 0;

    gamesound.pause();
    gamesound.currentTime = 0;

    gameOver=false;
    player="X";

    playerturn.textContent ="Player X's Turn";
    playerturn.style.color="#E1A51B";
}

function ResetScores(){
    ResetBoard();    
    xpoints = 0;
    opoints = 0;
    tiepoints = 0;
    xscore.textContent = 0;
    oscore.textContent = 0;
    tiescore.textContent = 0;

}


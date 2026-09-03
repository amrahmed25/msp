function searchGame(){
    let gameQuery = document.getElementById('gameQuery').value.toUpperCase().trim();
    let gamesName = document.getElementsByClassName('card-front-p');
    let gamesCard = document.getElementsByClassName('game-card');
    for(let i = 0 ; i < gamesName.length ; i++){
        if(gamesName[i].innerHTML.toUpperCase().trim().indexOf(gameQuery) >= 0){
            gamesCard[i].style.display = "";
        }
        else{
            gamesCard[i].style.display = "none";
        }
    }
}
function filterCategories(){
    let gamesCard = document.getElementsByClassName('game-card');
    let selectCategories = document.getElementById('categories');
    if(selectCategories.value == "shooter"){ // 0,1 -> pubg , crossfire
        gamesCard[0].style.display = "";
        gamesCard[1].style.display = "";
        gamesCard[2].style.display = "none";
        gamesCard[3].style.display = "none";
        gamesCard[4].style.display = "none";
    }
    else if(selectCategories.value == "adventure"){ //2,3 -> super mario , GTA
        gamesCard[0].style.display = "none";
        gamesCard[1].style.display = "none";
        gamesCard[2].style.display = "";
        gamesCard[3].style.display = "";
        gamesCard[4].style.display = "none";
    }
    else if(selectCategories.value == "casual"){//4 -> happy farm
        gamesCard[0].style.display = "none";
        gamesCard[1].style.display = "none";
        gamesCard[2].style.display = "none";
        gamesCard[3].style.display = "none";
        gamesCard[4].style.display = "";
    }
    else{
        for(let i = 0 ; i < gamesCard.length ; i++){
            gamesCard[i].style.display = "";
        }
    }
}
document.getElementById('categories').addEventListener('change' , filterCategories);
document.getElementById('gameQuery').addEventListener('change' , searchGame);
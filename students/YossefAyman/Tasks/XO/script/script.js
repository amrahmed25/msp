import Game from "./Game.js";
import { clear } from "./data.js";

Game.resetGame();

document.querySelector('#score-reset button').addEventListener('click', _ => {
    Game.resetGame();
})

document.querySelector('#backSetup').addEventListener('click', _ => {
    Game.resetGame();
    clear(); // clear local storage
    window.location.href = './index.html'
})

document.querySelectorAll('.cell').forEach(cell => {
    cell.addEventListener('click', () => {
        const index = Number(cell.dataset.index);        

        if (!Game.isCellEmpty(index) || Game.isGameOver() || Game.isAiTurn())
            return;
        else
            Game.play(cell, index);
    })
});
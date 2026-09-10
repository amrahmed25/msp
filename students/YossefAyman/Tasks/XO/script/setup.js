const options = document.querySelector('#options');
const levels = document.querySelectorAll('#levels label input');
const inps = document.querySelector('#inputs');
const btn = document.querySelector('#btn');
const player1 = {
    row: document.querySelector('#player1-inp'),
    para: document.querySelector('#player1-inp p'),
    input: document.querySelector('#player1-inp input'),
    data: { ai: false, name: 'Player 1', symbol: 'X' },
}
const player2 = {
    row: document.querySelector('#player2-inp'),
    para: document.querySelector('#player2-inp p'),
    input: document.querySelector('#player2-inp input'),
    data: { ai: false, name: 'Player 2', symbol: 'O' },
}
let valueOptions = Number(options.value);
let valueLevels = 'medium';

options.addEventListener('change', () => {
    valueOptions = Number(options.value);

    inps.classList.remove('hidden');
    player1.row.classList.remove('hidden');

    if (valueOptions === 2) {
        player2.row.classList.add('hidden');
        player2.data.ai = true;
        
        document.querySelector('#levels').classList.remove('hidden', valueOptions === 2);
    } else {
        player2.row.classList.remove('hidden');
        player2.data.ai = false;

        document.querySelector('#levels').classList.add('hidden');
    }
})

player1.input.addEventListener('input', () => {
    player1.data.name = player1.input.value;
})

levels.forEach(input => {
    input.addEventListener('change', (e) => {
        if (e.target.checked) {
            valueLevels = e.target.value;
            console.log('listener', valueLevels);
        }
    });
});

btn.addEventListener('click', () => {
    player2.data.name = player2.data.ai ? 'AI' : (player2.input.value || "Player 2");

    window.localStorage.setItem('Player1', JSON.stringify(player1.data));
    window.localStorage.setItem('Player2', JSON.stringify(player2.data));
    if (valueOptions === 2)
        window.localStorage.setItem('AiLevel', valueLevels);

    window.location.href = './game.html';
})
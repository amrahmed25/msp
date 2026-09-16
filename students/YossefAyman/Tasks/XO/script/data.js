export const player1 = JSON.parse(window.localStorage.getItem('Player1'));
export const player2 = JSON.parse(window.localStorage.getItem('Player2'));
export const level = window.localStorage.getItem('AiLevel') || null;

export function clear() {
    localStorage.clear();
}
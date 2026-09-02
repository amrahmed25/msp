const options   = document.getElementById("selectCategore");
const rates     = document.getElementById("selectRate");
const games     = document.getElementsByClassName("game-card");

function filter() {
    const selectedCategory  = options.value;
    const selectedRate      = parseFloat(rates.value) || 0;
    
    [...games].forEach(game => {
        const gameCategory  = game.dataset.category;
        const gameRate      = parseFloat(game.dataset.rate);
        
        const checkRate     = gameRate >= selectedRate;
        const checkCategory =
            selectedCategory === gameCategory ||
            selectedCategory === 'all';
        
        game.style.display = (checkCategory && checkRate ? 
            "block" : "none"
        )
    })

}

options.addEventListener('change', filter);
rates.addEventListener('change', filter);
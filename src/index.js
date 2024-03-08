let dictionary = [];

let specialWords = ['caleb', 'maddy', 'becca', 'danny', 'spenn', 'aburg'];

let alreadyGuessed = [];

let isWinner = false;

let isGameOver = false;

let isanimating = false;

// 1. Call LoadJson passing a callback function, which will be called receiving the result from the async operation   
LoadJson(function(result) {
    // 5. Received the result from the async function, now do whatever you want with it:     
    dictionary = result;
    state.secretWord =  dictionary[Math.floor(Math.random() * dictionary.length)];
    //state.secretWord = 'zooey';
    startUp();
});

// 2. The "callback" parameter is a reference to the function which was passed as an argument from the helloCatAsync call    
function LoadJson(callback) {
    // 3. Start async operation:
    let data =  fetch('./src/words.json').then(response => response.json()).then(json => data = json);

    setTimeout(function() {
        // 4. Finished async operation, call the callback, passing the result as an argument

        callback(data);

    }, 1000);
}

const state = {
    secretWord: '',
    grid: Array(6).fill().map(() => Array(5).fill('')),
    currentRow: 0,
    currentCol: 0,
}

function updateGrid() {
    for(let i = 0; i < state.grid.length; i++){
        for(let j = 0; j < state.grid[i].length; j++){
            const box = document.getElementById(`box${i}${j}`);
            box.textContent = state.grid[i][j];
        }
    }
}

function drawBox(container, row, col, letter = ''){
    const box = document.createElement('div');
    box.className = 'box';
    box.id = `box${row}${col}`;
    box.textContent = letter;

    container.appendChild(box);
    return box;
}

function drawGrid(container){
    const grid = document.createElement('div');
    grid.className = 'grid';

    for(let i = 0; i < 6; i++){
        for(let j = 0; j < 5; j++){
            drawBox(grid, i, j);
        }
    }

    container.appendChild(grid);
}

function registerKeyboardEvents(){
    document.body.onkeydown = (e) => {
        const key = e.key;

        if(key === 'Enter'){
            if(state.currentCol === 5){
                const word = getCurrentWord().toLowerCase();

                if(alreadyGuessed.includes(word)){
                    alert('You already guessed that');
                    return;
                }

                if(isWordValid(word)){
                    alreadyGuessed.push(word);
                    revealWord(word);
                    state.currentRow++;
                    state.currentCol = 0;
                }
                else{
                    alert('Not a valid word');
                }
            }
        }
        if(key === 'Backspace'){
            removeLetter();
        }
        if(isLetter(key)){
            addLetter(key);
        }

        updateGrid();
    }
}

function getCurrentWord(){
    return state.grid[state.currentRow].reduce((prev, curr) => prev + curr);
}

function revealWord(guess){
    const row = state.currentRow;
    const animation_duration = 500; // miliseconds

    let specialColor = '';

    if(specialWords.includes(guess))
        specialColor = specialWords[specialWords.indexOf(guess)];
        

    let tempWord = state.secretWord;
    let letterMatch = ['empty','empty','empty','empty','empty'];

    for(let i = 0; i < 5; i++){
        const box = document.getElementById(`box${row}${i}`);
        const letter = box.textContent;

        if(letter === tempWord[i]){
            letterMatch[i] = 'right';
            tempWord = setCharAt(tempWord,i,'_');
        }
    }

    //console.log(tempWord);
    //console.log(letterMatch);

    for(let i = 0; i < 5; i++){
        const box = document.getElementById(`box${row}${i}`);
        const letter = box.textContent;

        if(tempWord[i] === '_')
            continue;

        if(tempWord.includes(letter)){
            letterMatch[i] = 'wrong';

            tempWord = setCharAt(tempWord,tempWord.indexOf(letter),'-');
        }
    }
    
    //console.log(tempWord);
    //console.log(letterMatch);

    isanimating = true;

    for(let i = 0; i < 5; i++){
        const box = document.getElementById(`box${row}${i}`);
    
        setTimeout(() => {

            if(specialColor != ''){
                box.classList.add(specialColor);
            }
            else{
                box.classList.add(letterMatch[i]);
            }

        }, ((i + 1) * animation_duration) / 2);

        box.classList.remove('place');
        box.classList.remove('filled');

        box.classList.add('reveal');
        box.style.animationDelay = `${(i * animation_duration) / 2}ms`;
    }
    

    isWinner = state.secretWord === guess;
    isGameOver = state.currentRow === 5;

    if(isWinner){
        setTimeout(() => {
            for(let i = 0; i < 5; i++){
                const box = document.getElementById(`box${row}${i}`);

                box.classList.remove('reveal');
                box.classList.add('raise')
                box.style.animationDelay = `${(i * animation_duration) / 3}ms`;
            }
        }, 3 * animation_duration);
        setTimeout(() => {
            alert('Congratulations');
        }, 5 * animation_duration);
    } 
    else if (isGameOver){

        const isEqual = (a, b) => JSON.stringify(a.sort()) === JSON.stringify(b.sort());  

        if(isEqual(alreadyGuessed, specialWords)){
            setTimeout(() => {
                for(let i = 0; i < 5; i++){
                    const box = document.getElementById(`box${row}${i}`);
    
                    box.classList.remove('reveal');
                    box.classList.add('raise')
                    box.style.animationDelay = `${(i * animation_duration) / 3}ms`;
                }
            }, 3 * animation_duration);
            setTimeout(() => {
                alert('Laid Off');
            }, 5 * animation_duration);
        }
        else{
            setTimeout(() => {
                alert(`Better luck next time! The word was "${state.secretWord}".`);
            }, 3 * animation_duration);
        }
    } 
    else {
        setTimeout(() => {
            isanimating = false;
        }, 3 * animation_duration);
    }

}


function equals(a, b){
    if(a.length != b.length) return false;

    var seen = {};
    a.forEach(function(v) {
        var key = (typeof v) + v;
        if(!seen[key]){
            seen[key] = 0
        }
        seen[key] += 1;
    });

    return b.every(function(v) {
        var key = (typeof v) + v;
        if(seen[key]){
            seen -=1;
            return true
        }
    });
}

function setCharAt(str, index, chr){
    if(index > str.length-1) return str;

    return str.substring(0,index) + chr + str.substring(index+1);
}

function isWordValid(word){
    return dictionary.includes(word) || specialWords.includes(word);
}

function isLetter(key){
    return key.length === 1 && key.match(/[a-z]/i);
}

function addLetter(letter){
    const box = document.getElementById(`box${state.currentRow}${state.currentCol}`);

    if(isWinner || isGameOver || isanimating) return;
    
    if(state.currentCol === 5) return;
    
    box.classList.add('filled');

    box.classList.add('place');

    state.grid[state.currentRow][state.currentCol] = letter;
    state.currentCol++;
}

function removeLetter(){
    const box = document.getElementById(`box${state.currentRow}${state.currentCol - 1}`);

    if(state.currentCol === 0) return;

    box.classList.remove('filled');

    box.classList.remove('place');

    state.grid[state.currentRow][state.currentCol - 1] = '';
    state.currentCol--;

}

function startUp(){
    const game = document.getElementById('game');
    drawGrid(game);

    registerKeyboardEvents()

    console.log(state.secretWord);

    //console.log(dictionary);
}

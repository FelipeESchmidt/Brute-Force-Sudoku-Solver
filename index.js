const defaultBoard = [[0, 0, 1, 3, 0, 0, 6, 0, 0], [2, 0, 0, 0, 0, 0, 0, 0, 9], [0, 0, 0, 0, 8, 0, 1, 3, 0], [0, 0, 0, 4, 6, 5, 8, 0, 7], [0, 5, 8, 7, 0, 0, 2, 0, 3], [6, 0, 9, 8, 0, 0, 4, 0, 0], [3, 0, 2, 0, 0, 8, 0, 0, 0], [7, 0, 0, 9, 0, 0, 5, 1, 0], [0, 0, 5, 6, 0, 7, 0, 4, 0]];

let board = defaultBoard;

const maxValueInSudoku = board[0].length;
const blockSizeInSudoku = Math.sqrt(maxValueInSudoku);
const possibleNumbersInGame = [];
for (let k = 1; k <= maxValueInSudoku; k++) { possibleNumbersInGame.push(k) }

let zeroX = -1, zeroY = 0;
let isOver = true;
let isStopped = false;
let delayBetweenTrades = 0;

const table = document.querySelector('#table');

let info = [];

drawInPage();
function drawInPage() {
    table.innerHTML = `${board.map(row => `
        <tr>
            ${row.map(num => `<td>${num === 0 ? '' : num}</td>`).join('')}
        </tr>
    `).join('')}`;
}

function verifyY(value, x) {
    let isGood = true;
    for (let i = 0; i < maxValueInSudoku; i++) {
        if (board[i][x] == value) {
            isGood &= false;
        }
    }
    return isGood;
}

function verifyX(value, y) {
    let isGood = true;
    for (let i = 0; i < maxValueInSudoku; i++) {
        if (board[y][i] == value) {
            isGood &= false;
        }
    }
    return isGood;
}


function findBlockFromPosition(x, y) {
    const blockX = parseInt(x / blockSizeInSudoku);
    const blockY = parseInt(y / blockSizeInSudoku);
    return { blockX, blockY }
}

function verifyBlock(value, x, y) {
    const { blockX, blockY } = findBlockFromPosition(x, y);
    let isGood = true;
    const startPositionX = blockX * blockSizeInSudoku;
    const startPositionY = blockY * blockSizeInSudoku;
    for (let i = startPositionY; i < startPositionY + blockSizeInSudoku; i++) {
        for (let j = startPositionX; j < startPositionX + blockSizeInSudoku; j++) {
            if (board[i][j] == value) {
                isGood &= false;
            }
        }
    }
    return isGood;
}

function canItBeHere(value, positionX, positionY) {
    if (verifyY(value, positionX)) {
        if (verifyX(value, positionY)) {
            if (verifyBlock(value, positionX, positionY)) {
                return true;
            }
        }
    }
    return false;
}

function findNextValue() {
    zeroX++;
    if (zeroX >= maxValueInSudoku) {
        zeroX = 0;
        zeroY++;
        if (zeroY >= maxValueInSudoku) {
            isOver = true;
        }
    }
}

function findNextZero() {
    while (!isOver && board[zeroY][zeroX] !== 0) {
        findNextValue();
    }
}

function makeId(a, b) {
    return a + "" + b;
}

function handleInfo(positionX, positionY, numberTried) {
    if (info.find(obj => obj.id === makeId(positionX, positionY))) {
        updateInfo(makeId(positionX, positionY), numberTried);
    } else {
        info.push(createInfo(positionX, positionY));
        updateInfo(makeId(positionX, positionY), numberTried);
    }
}

function updateInfo(id, numberTried) {
    const position = info.findIndex(obj => obj.id === id);
    info[position].numbersTried.push(possibleNumbersInGame[numberTried]);
}

function createInfo(positionX, positionY) {
    return {
        id: makeId(positionX, positionY),
        position: {
            x: positionX,
            y: positionY
        },
        numbersTried: []
    }
}

function setNumberInBoard(x, y, number) {
    board[y][x] = possibleNumbersInGame[number];
    setTimeout(() => {
        drawInPage();
        findNextZero();
        sudoku(zeroX, zeroY, 0);
    }, delayBetweenTrades);
}

function goBack() {
    const wrong = info.pop();

    board[wrong.position.y][wrong.position.x] = 0;

    const lastOne = info[info.length - 1];

    zeroX = lastOne.position.x;
    zeroY = lastOne.position.y;
    
    const nextValue = lastOne.numbersTried[lastOne.numbersTried.length - 1];
    
    sudoku(zeroX, zeroY, nextValue);
}

function sudoku(x, y, numberToTry) {
    if (isOver) { return true };
    if (numberToTry >= maxValueInSudoku) {
        goBack(x, y);
    } else {
        handleInfo(x, y, numberToTry);
        if (canItBeHere(possibleNumbersInGame[numberToTry], x, y)) {
            setNumberInBoard(x, y, numberToTry);
        } else {
            sudoku(x, y, numberToTry + 1);
        }
    }
}

function reset(){
    info = [];
    isOver = false;
    zeroX = -1;
    zeroY = 0;
}

function solve() {
    reset();
    findNextZero();
    sudoku(zeroX, zeroY, 0);
}

function getBoard(type) {
    if(isOver){
        fetch(`https://sugoku.herokuapp.com/board?difficulty=${type}`, { method: 'get' })
        .then(response => response.json())
        .then(game => {
            board = game.board
                drawInPage();
            });
    }
}

function stop() {
    isOver = true;
    isStopped = true;
}

function resume() {
    if(isStopped){
        isStopped = false;
        isOver = false;
        sudoku(zeroX, zeroY, 0);
    }
}

function beFaster(){
    if(delayBetweenTrades <= 0){
        delayBetweenTrades = 0;
    }else{
        delayBetweenTrades /= 2;
    }
}

function beSlower(){
    if(delayBetweenTrades <= 0){
        delayBetweenTrades = 100;
    }else{
        delayBetweenTrades *= 2;
    }
}

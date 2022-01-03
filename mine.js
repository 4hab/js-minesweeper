import { Tile, Coordinates } from './tile.js';
let levels = {
    'easy': {
        'columns': 10,
        'rows': 8,
        'bombs': 10
    },
    'medium': {
        'columns': 18,
        'rows': 14,
        'bombs': 40
    },
    'hard': {
        'columns': 24,
        'rows': 20,
        'bombs': 99
    }
};
let colors = ['black', 'crimson', 'darkslateblue', 'green', 'orangered', 'darkmagenta', 'brown', 'green', 'tomato'];

class Game {
    board;
    columns;
    rows;
    bombs;
    level;
    coveredTiles;
    status;

    constructor(difficulty) {
        this.level = levels[difficulty];
        this.columns = this.level['columns'];
        this.rows = this.level['rows'];
        this.bombs = this.level['bombs'];
        this.status = 'playing';
        this.newGame();
    }

    newTileElement(i, j) {
        let tileElement = document.createElement('div');
        tileElement.className = 'tile';
        tileElement.style.backgroundColor = (i + j) & 1 ? 'rgb(56, 112, 255)' : 'rgb(56, 96, 255)';
        tileElement.id = this.idFromCoordinates(i, j);
        tileElement.addEventListener('mousedown', tileClick);
        return tileElement;
    }
    idFromCoordinates(r, c) {
        return r * this.columns + c;
    }
    newGame() {
        let rows = this.rows, columns = this.columns;
        this.coveredTiles = rows * columns - this.bombs;
        let boardDiv = document.getElementById('board');
        boardDiv.innerHTML = '';
        boardDiv.style.gridTemplateColumns = 'repeat(' + columns + ', 1fr)';
        boardDiv.style.width = columns * 33 + 'px';
        this.board = new Array(rows);
        for (let i = 0; i < rows; i++) {
            this.board[i] = new Array(columns);
            for (let j = 0; j < columns; j++) {
                let tileElement = this.newTileElement(i, j);
                boardDiv.appendChild(tileElement);
                this.board[i][j] = new Tile(tileElement, new Coordinates(i, j));
            }
        }
        this.addBombs();
    }
    validCoordinates(r, c) {
        if (r == 0 && c == 0)
            return false;
        if (r >= 0 && r < this.rows && c >= 0 && c < this.columns)
            return true;
        return false;
    }
    addBombs() {
        let bombs = this.bombs;
        let rows = this.rows;
        let columns = this.columns;
        //randomly generate coordinates
        for (let i = 0; i < bombs; i++) {
            let rowNumber = Math.floor(Math.random() * 1000) % rows;
            let columnNumber = Math.floor(Math.random() * 1000) % columns;
            //if this place has a bomb already try another one till you find
            //an empty one
            if (this.board[rowNumber][columnNumber].containsBomb()) {
                i--;
                continue;
            }
            this.board[rowNumber][columnNumber].setBomb();
            for (let a = -1; a < 2; a++) {
                for (let b = -1; b < 2; b++) {
                    let nr = rowNumber + a, nc = columnNumber + b;
                    if (this.validCoordinates(nr, nc) == true)
                        this.board[nr][nc].increaseValue();
                }
            }
        }
    }
    open(r, c) {
        let tile = this.board[r][c];
        if (tile.flag)
            return;
        if (tile.containsBomb()) {
            this.#openBomb(tile.htmlElement());
        }
        else {
            this.#openEmpty(tile);
            let audio = new Audio('sounds/pop2.mp3');
            if(tile.getValue()){
                audio = new Audio('sounds/pop.mp3');
            }
            audio.play();
        }
    }
    #openBomb(tileElement) {
        let img = document.createElement('img');
        img.src = 'images/bug-icon.svg';
        img.style.width = '100%';
        img.style.padding = '8px';
        tileElement.appendChild(img);
        tileElement.style.padding = '0px';
        console.log('Loser');
        this.status = 'game over';
    }
    #openEmpty(tile) {
        if (tile.open || tile.flag)
            return;
        tile.open = true;
        this.coveredTiles--;
        console.log(this.coveredTiles);
        if(this.coveredTiles==0){
            this.status = 'winner';
        }
        let tileElement = tile.htmlElement();
        let coordinates = tile.getCoordinates();
        let r = coordinates.x();
        let c = coordinates.y();
        tileElement.style.backgroundColor = (r + c) & 1 ? '#f7bd28' : '#dea514';
        if (tile.getValue() > 0) {
            let value = tile.getValue();
            tileElement.innerHTML = value;
            tileElement.style.color = colors[value];
            tileElement.style.padding = '0px';
        }
        else {
            for (let a = -1; a < 2; a++) {
                for (let b = -1; b < 2; b++) {
                    let nr = r + a, nc = c + b;
                    if (this.validCoordinates(nr, nc)) {
                        this.#openEmpty(this.board[nr][nc]);
                    }
                }
            }
        }
    }
    putFlag(r, c) {
        let tile = this.board[r][c];
        if (tile.open)
            return;
        let audio = new Audio('sounds/flag.mp3');
        audio.play();
        let tileElement = tile.htmlElement();
        if (tile.flag) {
            tile.flag = false;
            tileElement.innerHTML = '';
            this.bombs++;
        }
        else {
            tile.flag = true;
            let img = document.createElement('img');
            img.src = 'images/flag-icon.svg';
            img.style.width = '100%';
            img.style.padding = '5px';
            tileElement.appendChild(img);
            tileElement.style.padding = '0px';
            this.bombs--;
        }
        bombsLabel.innerHTML = this.bombs;
    }
}


var game = new Game('hard');
let gameResult = document.getElementById('gameResult');
let mainMenue = document.getElementById('mainMenue');
let levelMenue = document.getElementById('levelMenue');
let newGameBtn = document.getElementById('newGameBtn');
let playPauseBtn = document.getElementById('playPauseBtn');
let endGameBtn = document.getElementById('endGameBtn');
let timeLabel = document.getElementById('timeLabel');
let bombsLabel = document.getElementById('bombsLabel');
let continueBtn = document.getElementById('continueBtn');
let timer;
let time = {
    'seconds': 0,
    'minutes': 0,
};

function checkGame(){
    let status = game.status;
    if(status == 'playing'){
        return;
    }
    gameResult.innerHTML = status;
    mainMenue.style.display = 'flex';
    mainMenue.className = 'main-menue result-menue';
    stopTimer();
    let audio = new Audio('sounds/defeat.mp3');
    if(status == 'winner'){
        audio = new Audio('sounds/victory.mp3');
    }
    audio.play();
}
function tileClick(e) {
    let tile = e.srcElement;
    if (e.srcElement.tagName != 'DIV') {
        tile = e.srcElement.parentElement;
    }
    let id = parseInt(tile.id);
    let r = Math.floor(id / game.columns), c = id % game.columns;
    if (e.button == 0) {
        game.open(r, c);
        checkGame();
    }
    else if (e.button == 2) {
        game.putFlag(r, c);
    }
}


function startTimer() {
    timer = setInterval(function (params) {
        timeLabel.innerHTML = getTime();
    }, 1000);
    playPauseBtn.children[0].src = 'images/pause-icon.svg';
}
function stopTimer() {
    clearInterval(timer);
    playPauseBtn.children[0].src = 'images/play-icon.svg';
    mainMenue.style.display = 'flex';
    if(game.status!='game over'){
        mainMenue.classList.add('pause-menue');
    }
}
function getTime() {
    let seconds = time['seconds'], minutes = time['minutes'];
    time['seconds']++;
    if (time['seconds'] == 60) {
        time['minutes']++;
        time['seconds'] = 0;
    }
    return (minutes < 10 ? '0' + minutes : minutes) + ':' + (seconds < 10 ? '0' + seconds : seconds);
}
levelMenue.onchange = function (e) {
    let level = e.srcElement.value;
    bombsLabel.innerHTML = levels[level]['bombs'];
    game=new Game(level);
}
newGameBtn.onclick = function () {
    game = new Game(levelMenue.value);
    mainMenue.className = 'main-menue';
    gameResult.innerHTML = 'minesweeper';
    mainMenue.style.display = 'none';
    clearInterval(timer);
    startTimer();
    pause = false;
    time['seconds'] = 0;
    time['minutes'] = 0;
}

continueBtn.onclick = function () {
    mainMenue.style.display = 'none';
    pause = false;
    startTimer();
}
let pause = true;
playPauseBtn.onclick = function () {
    if (pause)
        startTimer();
    else
        stopTimer();
    pause = !pause;
}











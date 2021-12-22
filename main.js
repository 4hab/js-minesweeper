import { Tile, Coordinates } from './tile.js';

class Game {
    board;
    columns
    rows
    bombs
    levels = {
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
    level
    colors = ['black', 'crimson', 'darkslateblue', 'green', 'orangered', 'darkmagenta', 'brown', 'green', 'tomato'];

    constructor(difficulty) {
        this.level = this.levels[difficulty];
        this.columns = this.level['columns'];
        this.rows = this.level['rows'];
        this.bombs = this.level['bombs'];
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
        let boardDiv = document.getElementById('board');
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
        // for (let row = 0; row < rows; row++) {
        //     for (let col = 0; col < columns; col++) {
        //         if (this.board[row][col].containsBomb()) {
        //             console.log(this.board[row][col].getCoordinates())
        //         }
        //     }
        // }
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
        }
    }
    #openBomb(tileElement) {
        let img = document.createElement('img');
        img.src = 'images/bug-icon.svg';
        img.style.width = '100%';
        img.style.padding = '8px';
        tileElement.appendChild(img);
        tileElement.style.padding = '0px';
    }
    #openEmpty(tile) {
        if (tile.open || tile.flag)
            return;
        tile.open = true;
        let tileElement = tile.htmlElement();
        let coordinates = tile.getCoordinates();
        let r = coordinates.x();
        let c = coordinates.y();
        tileElement.style.backgroundColor = (r + c) & 1 ? '#f7bd28' : '#dea514';
        if (tile.getValue() > 0) {
            let value = tile.getValue();
            tileElement.innerHTML = value;
            tileElement.style.color = this.colors[value];
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
        let tileElement = tile.htmlElement();
        if (tile.flag) {
            tile.flag = false;
            tileElement.innerHTML = '';
        }
        else {
            tile.flag = true;
            let img = document.createElement('img');
            img.src = 'images/flag-icon.svg';
            img.style.width = '100%';
            img.style.padding = '5px';
            tileElement.appendChild(img);
            tileElement.style.padding = '0px';
        }

    }


}

//e.button => 0 left click
//e.button => 2 right click
function tileClick(e) {
    let tile = e.srcElement;
    if (e.srcElement.tagName != 'DIV') {
        tile = e.srcElement.parentElement;
    }
    let id = parseInt(tile.id);
    let r = Math.floor(id / game.columns), c = id % game.columns;
    if (e.button == 0) {
        game.open(r, c);
    }
    else if (e.button == 2) {
        game.putFlag(r, c);
    }
}

let game = new Game('medium');




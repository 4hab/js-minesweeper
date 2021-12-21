let coveredTile = document.getElementById('covered-tile');
let board = document.getElementById('board');

//hard = 24*20 medium = 18*14 easy = 10*8
let rows = 20,columns = 24;
board.style.gridTemplateColumns = 'repeat('+ columns +', 1fr)';
board.style.width = columns*33 + 'px';

for(let i =0;i<rows;i++)
{
    for(let j = 0; j<columns;j++)
    {
        let tile = document.createElement('div');
        tile.className = 'tile';
        tile.style.backgroundColor = (i+j)&1? 'rgb(56, 112, 255)': 'rgb(56, 96, 255)';
        board.appendChild(tile);
    }
}
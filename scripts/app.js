
const Player = (name, marker) => {
    const getName = () => name;
    const setName = newName => name = newName;
    const getMarker = () => marker;
    return { getName, setName, getMarker };
}

const player1 = Player("Player 1", "X");
const player2 = Player("Player 2", "O");

const GameBoard = (() => {
    const EMPTY = "";
    let _cells = new Array(9).fill(EMPTY);
    const _isCellMarked = (index, marker) => _cells[index] === marker;
    const reset = () => _cells = _cells.map(cell => cell = EMPTY);
    const getMark = index => _cells[index];
    const markCell = (index, marker) => {
        if (_isCellMarked(index, EMPTY))
            _cells[index] = marker;
    }
    const areAllCellsMarked = () => _cells.filter(cell => cell !== EMPTY).length === _cells.length;
    const satisfyWinCondition = marker => (_isCellMarked(0, marker) && (_cells[0] === _cells[1] && _cells[0] === _cells[2])) ||
        (_isCellMarked(3, marker) && (_cells[3] === _cells[4] && _cells[3] === _cells[5])) ||
        (_isCellMarked(6, marker) && (_cells[6] === _cells[7] && _cells[6] === _cells[8])) ||
        (_isCellMarked(0, marker) && (_cells[0] === _cells[3] && _cells[0] === _cells[6])) || // vertical win conditions
        (_isCellMarked(1, marker) && (_cells[1] === _cells[4] && _cells[1] === _cells[7])) ||
        (_isCellMarked(2, marker) && (_cells[2] === _cells[5] && _cells[2] === _cells[8])) ||
        (_isCellMarked(0, marker) && (_cells[0] === _cells[4] && _cells[0] === _cells[8])) || // diagonal win conditions
        (_isCellMarked(2, marker) && (_cells[2] === _cells[4] && _cells[2] === _cells[6]));
    return {
        reset,
        getMark,
        markCell,
        areAllCellsMarked,
        satisfyWinCondition
    };
})();

const GameControl = ((player1, player2) => {
    let _current = player1;
    const getCurrentPlayerName = () => _current.getName();
    const setMark = index => GameBoard.markCell(index, _current.getMarker());
    const changePlayer = () => _current === player1 ? _current = player2 : _current = player1;
    const reset = () => {
        _current = player1;
    }
    const hasPlayerWon = () => GameBoard.satisfyWinCondition(_current.getMarker());
    const isDraw = () => GameBoard.areAllCellsMarked() && !hasPlayerWon(player1) && !hasPlayerWon(player2);
    return {
        getCurrentPlayerName,
        setMark,
        changePlayer,
        hasPlayerWon,
        isDraw,
        reset
    }
})(player1, player2);

const displayControl = (() => {
    const renderGameboard = () => document.querySelectorAll(".gameboard-cell").forEach(cellElement => cellElement.children[0].textContent = GameBoard.getMark([parseInt(cellElement.dataset.index)]));
    const renderOutcome = (outcomeMsg) => {
        document.querySelector(".pop-up-layer").style.display = "block";
        document.querySelector(".outcome-message").textContent = outcomeMsg;
    }
    const renderTurn = message => document.querySelector(".current-turn").textContent = message;
    return {renderGameboard, renderOutcome, renderTurn};
})();

function play() {
    const selectedIdx = parseInt(this.dataset.index);
    GameControl.setMark(selectedIdx);
    displayControl.renderGameboard();
    if (GameControl.hasPlayerWon()) {
        displayControl.renderOutcome(`${GameControl.getCurrentPlayerName()} wins!`);
    }
    else if (GameControl.isDraw()) {
        displayControl.renderOutcome(`Draw!`);
    }
    else {
        GameControl.changePlayer();
        displayControl.renderTurn(`${GameControl.getCurrentPlayerName()}'s turn`);
    }
}

function restartGame() {
    GameBoard.reset();
    GameControl.reset();
    displayControl.renderTurn(`${GameControl.getCurrentPlayerName()}'s turn`);
    displayControl.renderGameboard();
}

function restartClicked(event) {
    if (this !== event.target) return;
    restartGame();
    document.querySelector(".pop-up-layer").style.display = "none";
}

const init = (() => {
    displayControl.renderTurn(`${GameControl.getCurrentPlayerName()}'s turn.`);
    document.querySelectorAll(".gameboard-cell").forEach(cell => cell.addEventListener("click", play));
    document.querySelector(".outcome-restart-btn").addEventListener("click", restartClicked);
    document.querySelector(".pop-up-layer").addEventListener("click", restartClicked);
})();
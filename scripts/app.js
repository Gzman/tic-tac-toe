
const Player = (name, marker, cpu = false) => {
    const getName = () => name;
    const setName = newName => name = newName;
    const getMarker = () => marker;
    const isCpu = () => cpu;
    const setAsCpu = flag => cpu = flag;
    return { getName, setName, getMarker, isCpu, setAsCpu };
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
        if (_isCellMarked(index, EMPTY)) {
            _cells[index] = marker;
        }
    }
    const areAllCellsMarked = () => _cells.filter(cell => cell !== EMPTY).length === _cells.length;
    const getAllMarkedIndicies = (mark) => _cells.reduce((markedIndicies, cell, cellIndex) => {
        if (cell === mark) markedIndicies.push(cellIndex);
        return markedIndicies;
    }, []);
    const getAllUnmarkedIndicies = () => _cells.reduce((unmarkedIndicies, cell, cellIndex) => {
        if (cell === EMPTY) unmarkedIndicies.push(cellIndex);
        return unmarkedIndicies;
    }, []);
    const satisfyWinCondition = marker => (_isCellMarked(0, marker) && (_cells[0] === _cells[1] && _cells[0] === _cells[2])) ||
        (_isCellMarked(3, marker) && (_cells[3] === _cells[4] && _cells[3] === _cells[5])) ||
        (_isCellMarked(6, marker) && (_cells[6] === _cells[7] && _cells[6] === _cells[8])) ||
        (_isCellMarked(0, marker) && (_cells[0] === _cells[3] && _cells[0] === _cells[6])) ||
        (_isCellMarked(1, marker) && (_cells[1] === _cells[4] && _cells[1] === _cells[7])) ||
        (_isCellMarked(2, marker) && (_cells[2] === _cells[5] && _cells[2] === _cells[8])) ||
        (_isCellMarked(0, marker) && (_cells[0] === _cells[4] && _cells[0] === _cells[8])) ||
        (_isCellMarked(2, marker) && (_cells[2] === _cells[4] && _cells[2] === _cells[6]));
    return {
        reset,
        getMark,
        markCell,
        areAllCellsMarked,
        satisfyWinCondition,
        getAllMarkedIndicies,
        getAllUnmarkedIndicies
    };
})();

const DisplayCtrl = (() => {
    const _init = (() => {
        document.querySelectorAll(".gameboard-cell").forEach(cell => cell.addEventListener("click", play));
        document.querySelector(".restart-btn").addEventListener("click", restart);
        document.querySelector(".outcome-content").addEventListener("click", restart);
        document.querySelector(".outcome-layer").addEventListener("click", restart);
        document.querySelector(".player-vs-player").addEventListener("click", selectOpponent);
        document.querySelector(".player-vs-computer").addEventListener("click", selectOpponent);
    })();
    const renderGameboard = () => document.querySelectorAll(".gameboard-cell").forEach(cell => cell.children[0].textContent = GameBoard.getMark([parseInt(cell.dataset.index)]));
    const renderOutcome = (outcomeMsg) => {
        document.querySelector(".outcome-layer").style.display = "block";
        document.querySelector(".outcome-message").textContent = outcomeMsg;
    }
    const renderTurn = message => document.querySelector(".current-turn").textContent = message;
    const renderOpponentSelection = () => document.querySelector(".select-opponent-layer").style.display = "block";
    return { renderGameboard, renderOutcome, renderTurn, renderOpponentSelection };
})();

const GameCtrl = ((player1, player2) => {
    let currentPlayer = player1;
    const play = (index) => {
        GameBoard.markCell(index, currentPlayer.getMarker());
        DisplayCtrl.renderGameboard();
        if (hasPlayerWon()) {
            DisplayCtrl.renderOutcome(`${currentPlayer.getMarker()} wins!`);
        }
        else if (isDraw()) {
            DisplayCtrl.renderOutcome(`Draw!`);
        }
        else {
            changePlayer();
            DisplayCtrl.renderTurn(`${currentPlayer.getMarker()}'s turn`);
        }
    }
    const computerPlay = () => {
        const unmarkedIndicies = GameBoard.getAllUnmarkedIndicies();
        if (unmarkedIndicies.length === 0) return;
        const randomIndex = unmarkedIndicies[Math.floor(Math.random() * unmarkedIndicies.length)];
        play(randomIndex);
    }
    const changePlayer = () => {
        if (currentPlayer === player1) {
            currentPlayer = player2;
            if (player2.isCpu() === true) {
                computerPlay();
            }
        } else {
            currentPlayer = player1;
        }
    }
    const reset = () => {
        GameBoard.reset();
        currentPlayer = player1;
        DisplayCtrl.renderTurn(`${currentPlayer.getMarker()}'s turn`);
        DisplayCtrl.renderGameboard();
    }
    const hasPlayerWon = () => GameBoard.satisfyWinCondition(currentPlayer.getMarker());
    const isDraw = () => GameBoard.areAllCellsMarked() && !hasPlayerWon(player1) && !hasPlayerWon(player2);
    return { play, reset }
})(player1, player2);

function play() {
    const selectedIdx = parseInt(this.dataset.index);
    GameCtrl.play(selectedIdx);
}

function restart(event) {
    if (this !== event.target) return;
    GameCtrl.reset();
    document.querySelector(".outcome-layer").style.display = "none";
    DisplayCtrl.renderOpponentSelection();
}

function selectOpponent() {
    player2.setAsCpu(JSON.parse(this.dataset.isCpu));
    document.querySelector(".select-opponent-layer").style.display = "none";
}

DisplayCtrl.renderOpponentSelection();
DisplayCtrl.renderTurn(`${player1.getMarker()}'s turn.`);

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
    let cells = new Array(9).fill(EMPTY);
    const isMarkerSet = (index, marker) => cells[index] === marker;
    const isCellMarked = (index) => !isMarkerSet(index, EMPTY);
    const reset = () => cells = cells.map(cell => cell = EMPTY);
    const getMark = index => cells[index];
    const markCell = (index, marker) => {
        if (isMarkerSet(index, EMPTY)) {
            cells[index] = marker;
        }
    }
    const areAllCellsMarked = () => cells.filter(cell => cell !== EMPTY).length === cells.length;
    const getAllMarkedIndicies = (mark) => cells.reduce((markedIndicies, cell, cellIndex) => {
        if (cell === mark) markedIndicies.push(cellIndex);
        return markedIndicies;
    }, []);
    const getAllUnmarkedIndicies = () => getAllMarkedIndicies(EMPTY);
    const winCombinations = [
        [0,1,2], [3,4,5], [6,7,8], [0,3,6], [1,4,7], [2,5,8], [0,4,8], [2,4,6]
    ];
    const satisfyWinCondition = marker => {
        const markedIndicies = getAllMarkedIndicies(marker);
        return winCombinations.some((combination) => combination.every(index => markedIndicies.includes(index)));
    }
    return {
        reset,
        getMark,
        markCell,
        isCellMarked,
        areAllCellsMarked,
        satisfyWinCondition,
        getAllMarkedIndicies,
        getAllUnmarkedIndicies
    };
})();

const DisplayCtrl = (() => {
    const gameboardCells = document.querySelectorAll(".gameboard-cell");
    const selectOpponentModal = document.querySelector(".select-opponent-layer");
    const outcomeModal = document.querySelector(".outcome-layer");
    const play = (event) => {
        const selectedIdx = parseInt(event.currentTarget.dataset.index);
        GameCtrl.play(selectedIdx);
    }
    const restart = () => {
        GameCtrl.reset();
        outcomeModal.style.display = "none";
        renderOpponentSelection();
    }
    const selectOpponent = (event) => {
        player2.setAsCpu(JSON.parse(event.currentTarget.dataset.isCpu));
        player2.setName(player2.isCpu() ? "Computer" : "Player 2");
        selectOpponentModal.style.display = "none";
    }
    const init = (() => {
        gameboardCells.forEach(cell => cell.addEventListener("click", play));
        document.querySelector(".restart-btn").addEventListener("click", restart);
        outcomeModal.addEventListener("click", restart);
        outcomeModal.querySelector(".outcome-content").addEventListener("click", restart);
        document.querySelector(".player-vs-player").addEventListener("click", selectOpponent);
        document.querySelector(".player-vs-computer").addEventListener("click", selectOpponent);
    })();
    const renderGameboard = () => gameboardCells.forEach(cell => cell.children[0].textContent = GameBoard.getMark([parseInt(cell.dataset.index)]));
    const renderOpponentSelection = () => selectOpponentModal.style.display = "block";
    const renderOutcome = (outcomeMsg) => {
        outcomeModal.style.display = "block";
        outcomeModal.querySelector(".outcome-message").textContent = outcomeMsg;
    }
    const renderTurn = message => document.querySelector(".current-turn").textContent = message;
    return {
        renderGameboard,
        renderOutcome,
        renderTurn,
        renderOpponentSelection
    };
})();

const GameCtrl = ((player1, player2) => {
    let currentPlayer = player1;
    const play = (index) => {
        if (GameBoard.isCellMarked(index)) return;
        GameBoard.markCell(index, currentPlayer.getMarker());
        DisplayCtrl.renderGameboard();
        if (hasCurrentPlayerWon()) {
            DisplayCtrl.renderOutcome(`${currentPlayer.getName()} wins!`);
            return;
        }
        if (isDraw()) {
            DisplayCtrl.renderOutcome(`Draw!`);
            return;
        }
        nextTurn();
        displayCurrentTurn();
    }
    const computerPlay = () => {
        const unmarkedIndicies = GameBoard.getAllUnmarkedIndicies();
        if (unmarkedIndicies.length === 0) return;
        const randomIndex = unmarkedIndicies[Math.floor(Math.random() * unmarkedIndicies.length)];
        play(randomIndex);
    }
    const nextTurn = () => {
        if (currentPlayer === player1) {
            currentPlayer = player2;
            if (player2.isCpu() === true) {
                setTimeout(computerPlay, 380);
            }
        } else {
            currentPlayer = player1;
        }
    }
    const start = () => {
        DisplayCtrl.renderOpponentSelection();
        displayCurrentTurn();
    }
    const reset = () => {
        GameBoard.reset();
        currentPlayer = player1;
        displayCurrentTurn();
        DisplayCtrl.renderGameboard();
    }
    const displayCurrentTurn = () => DisplayCtrl.renderTurn(`${currentPlayer.getName()}'s turn`);
    const hasCurrentPlayerWon = () => GameBoard.satisfyWinCondition(currentPlayer.getMarker());
    const isDraw = () => GameBoard.areAllCellsMarked() && !hasCurrentPlayerWon(player1) && !hasCurrentPlayerWon(player2);
    return { start, play, reset }
})(player1, player2);

GameCtrl.start();
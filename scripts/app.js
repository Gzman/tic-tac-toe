
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
    const isCellMarked = (index, marker) => cells[index] === marker;
    const reset = () => cells = cells.map(cell => cell = EMPTY);
    const getMark = index => cells[index];
    const markCell = (index, marker) => {
        if (isCellMarked(index, EMPTY)) {
            cells[index] = marker;
        }
    }
    const areAllCellsMarked = () => cells.filter(cell => cell !== EMPTY).length === cells.length;
    const getAllMarkedIndicies = (mark) => cells.reduce((markedIndicies, cell, cellIndex) => {
        if (cell === mark) markedIndicies.push(cellIndex);
        return markedIndicies;
    }, []);
    const getAllUnmarkedIndicies = () => getAllMarkedIndicies(EMPTY);
    const satisfyWinCondition = marker => (isCellMarked(0, marker) && (cells[0] === cells[1] && cells[0] === cells[2])) ||
        (isCellMarked(3, marker) && (cells[3] === cells[4] && cells[3] === cells[5])) ||
        (isCellMarked(6, marker) && (cells[6] === cells[7] && cells[6] === cells[8])) ||
        (isCellMarked(0, marker) && (cells[0] === cells[3] && cells[0] === cells[6])) ||
        (isCellMarked(1, marker) && (cells[1] === cells[4] && cells[1] === cells[7])) ||
        (isCellMarked(2, marker) && (cells[2] === cells[5] && cells[2] === cells[8])) ||
        (isCellMarked(0, marker) && (cells[0] === cells[4] && cells[0] === cells[8])) ||
        (isCellMarked(2, marker) && (cells[2] === cells[4] && cells[2] === cells[6]));
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
    const gameboardCells = document.querySelectorAll(".gameboard-cell");
    const selectOpponentModal = document.querySelector(".select-opponent-layer");
    const outcomeModal = document.querySelector(".outcome-layer");
    const play = (event) => {
        const cellElement = event.currentTarget;
        if(cellElement.children[0].textContent !== "") return;
        const selectedIdx = parseInt(cellElement.dataset.index);
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
    return { renderGameboard, renderOutcome, renderTurn, renderOpponentSelection };
})();

const GameCtrl = ((player1, player2) => {
    let currentPlayer = player1;
    const play = (index) => {
        GameBoard.markCell(index, currentPlayer.getMarker());
        DisplayCtrl.renderGameboard();
        if (hasPlayerWon()) {
            DisplayCtrl.renderOutcome(`${currentPlayer.getName()} wins!`);
        }
        else if (isDraw()) {
            DisplayCtrl.renderOutcome(`Draw!`);
        }
        else {
            changePlayer();
            displayCurrentTurn();
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
    const hasPlayerWon = () => GameBoard.satisfyWinCondition(currentPlayer.getMarker());
    const isDraw = () => GameBoard.areAllCellsMarked() && !hasPlayerWon(player1) && !hasPlayerWon(player2);
    return { start, play, reset }
})(player1, player2);

GameCtrl.start();
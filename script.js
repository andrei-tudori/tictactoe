let isVsComputer = false;
let difficulty = 'easy';
let currentPlayer = 'X';
let board = Array(9).fill(null);
let player1Score = 0;
let player2Score = 0;
let player1Name = '';
let player2Name = '';
const vsPlayerScores = JSON.parse(localStorage.getItem('vsPlayerScores')) || [];
const vsComputerScoresEasy = JSON.parse(localStorage.getItem('vsComputerScoresEasy')) || [];
const vsComputerScoresMedium = JSON.parse(localStorage.getItem('vsComputerScoresMedium')) || [];
const vsComputerScoresHard = JSON.parse(localStorage.getItem('vsComputerScoresHard')) || [];
let turnInProgress = true; // Set to true at the beginning of the game

// Event listeners for main menu buttons
document.getElementById('vsPlayer').addEventListener('click', () => {
    isVsComputer = false;
    showNameInput();
});

document.getElementById('vsComputer').addEventListener('click', () => {
    isVsComputer = true;
    showNameInput();
});

document.getElementById('reset').addEventListener('click', resetGame);
document.getElementById('reset').addEventListener('click', resetScore);

document.getElementById('mainMenu').addEventListener('click', showMenu);
document.getElementById('highScore').addEventListener('click', showHighScores);
document.getElementById('backToMenu').addEventListener('click', showMenu);
document.getElementById('clearHighScores').addEventListener('click', clearHighScores);

function showNameInput() {
    document.getElementById('menu').classList.add('hidden');
    document.getElementById('nameInput').classList.remove('hidden');
    if (isVsComputer) {
        document.getElementById('player2NameLabel').classList.add('hidden');
        document.getElementById('player2Name').classList.add('hidden');
    } else {
        document.getElementById('player2NameLabel').classList.remove('hidden');
        document.getElementById('player2Name').classList.remove('hidden');
    }
}

document.getElementById('startGame').addEventListener('click', () => {
    player1Name = document.getElementById('player1Name').value.trim();
    player2Name = isVsComputer ? 'AI' : document.getElementById('player2Name').value.trim();
    document.getElementById('player1DisplayName').textContent = player1Name;
    document.getElementById('player2DisplayName').textContent = player2Name;
    difficulty = document.getElementById('difficultySelect').value;
    showGame();
});

function showGame() {
    document.getElementById('menu').classList.add('hidden');
    document.getElementById('nameInput').classList.add('hidden');
    document.getElementById('game').classList.remove('hidden');
    resetGame();
}

function showMenu() {
    document.getElementById('menu').classList.remove('hidden');
    document.getElementById('nameInput').classList.add('hidden');
    document.getElementById('game').classList.add('hidden');
    document.getElementById('highScoreBoard').classList.add('hidden');
}

function showHighScores() {
    document.getElementById('menu').classList.add('hidden');
    document.getElementById('highScoreBoard').classList.remove('hidden');
    updateHighScoresDisplay();
}

function clearHighScores() {
    vsPlayerScores.length = 0;
    vsComputerScoresEasy.length = 0;
    vsComputerScoresMedium.length = 0;
    vsComputerScoresHard.length = 0;
    localStorage.removeItem('vsPlayerScores');
    localStorage.removeItem('vsComputerScoresEasy');
    localStorage.removeItem('vsComputerScoresMedium');
    localStorage.removeItem('vsComputerScoresHard');
    updateHighScoresDisplay();
}

document.querySelectorAll('.cell').forEach(cell => {
    cell.addEventListener('click', handleMove);
});

function handleMove(event) {
    if (!turnInProgress) return; // Ignore moves if it's not the player's turn

    const index = parseInt(event.target.getAttribute('data-index'));

    if (board[index] || checkWin()) return;

    board[index] = currentPlayer;
    event.target.textContent = currentPlayer;
    setTurnInProgress(false); // End turn immediately after move

    if (checkWin()) {
        setTimeout(handleWin, 500); // Delay before handling win
    } else if (board.every(cell => cell !== null)) {
        setTimeout(handleDraw, 500); // Delay before handling draw
    } else {
        setTimeout(() => {
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            if (isVsComputer && currentPlayer === 'O') {
                makeComputerMove();
            } else {
                setTurnInProgress(true); // Enable player to make a move
            }
        }, 500); // Delay before switching turns
    }
}

function setTurnInProgress(value) {
    turnInProgress = value;
}

function makeComputerMove() {
    setTurnInProgress(false); // Ensure turnInProgress is false while computer makes its move

    setTimeout(() => {
        let move;
        const emptyCells = board.map((val, index) => val === null ? index : null).filter(val => val !== null);

        if (difficulty === 'hard') {
            move = findBestMove();
        } else if (difficulty === 'medium') {
            move = minimax(board, 'O').index;
        } else {
            move = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        }

        board[move] = 'O';
        const cell = document.querySelector(`.cell[data-index="${move}"]`);
        cell.textContent = 'O';

        if (checkWin()) {
            setTimeout(handleWin, 500); // Delay before handling win
        } else if (board.every(cell => cell !== null)) {
            setTimeout(handleDraw, 500); // Delay before handling draw
        } else {
            currentPlayer = 'X';
            setTurnInProgress(true); // Enable player to make a move after computer's move
        }
    }, 500); // Delay before computer makes a move
}

function findBestMove() {
    let bestMove = null;
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
            board[i] = 'O';
            let score = minimax(board, 'X').score;
            board[i] = null;
            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }
    return bestMove;
}

function minimax(newBoard, player, alpha = -Infinity, beta = Infinity) {
    const availSpots = newBoard.map((val, index) => val === null ? index : null).filter(val => val !== null);

    if (checkWin('X')) {
        return { score: -10 };
    } else if (checkWin('O')) {
        return { score: 10 };
    } else if (availSpots.length === 0) {
        return { score: 0 };
    }

    const moves = [];
    for (let i = 0; i < availSpots.length; i++) {
        const move = {};
        move.index = availSpots[i];
        newBoard[availSpots[i]] = player;

        if (player === 'O') {
            const result = minimax(newBoard, 'X', alpha, beta);
            move.score = result.score;
            alpha = Math.max(alpha, move.score);
        } else {
            const result = minimax(newBoard, 'O', alpha, beta);
            move.score = result.score;
            beta = Math.min(beta, move.score);
        }

        newBoard[availSpots[i]] = null;
        moves.push(move);

        if (alpha >= beta) break;  // Alpha-beta pruning
    }

    let bestMove;
    if (player === 'O') {
        let bestScore = -Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }

    return moves[bestMove];
}

// Utility function to check for win (updated to accept a parameter)
function checkWin(player = currentPlayer) {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]  // Diagonals
    ];
    return winPatterns.some(pattern => 
        pattern.every(index => board[index] === player)
    );
}

function handleWin() {
    if (currentPlayer === 'X') {
        player1Score++;
        alert(`${player1Name} wins!`);
    } else {
        player2Score++;
        alert(`${player2Name} wins!`);
    }
    updateScores();
    saveScore();
    resetGame();
}

function handleDraw() {
    alert('It\'s a draw!');
    resetGame();
}

function updateScores() {
    document.getElementById('player1Score').textContent = player1Score;
    document.getElementById('player2Score').textContent = player2Score;
}

function saveScore() {
    const scoreData = {
        name: player1Name, player2Name,
        player1Score: player1Score,
        player2Score: player2Score
    };

    // Check if the game mode is vs Player or vs Computer
    if (!isVsComputer) {
        // Add scores to vsPlayerScores
        vsPlayerScores.push(scoreData);
        localStorage.setItem('vsPlayerScores', JSON.stringify(vsPlayerScores));
    } else {
        // Add scores to the appropriate vsComputer scores list based on difficulty
        if (difficulty === 'easy') {
            vsComputerScoresEasy.push(scoreData);
            localStorage.setItem('vsComputerScoresEasy', JSON.stringify(vsComputerScoresEasy));
        } else if (difficulty === 'medium') {
            vsComputerScoresMedium.push(scoreData);
            localStorage.setItem('vsComputerScoresMedium', JSON.stringify(vsComputerScoresMedium));
        } else {
            vsComputerScoresHard.push(scoreData);
            localStorage.setItem('vsComputerScoresHard', JSON.stringify(vsComputerScoresHard));
        }
    }
}

function updateHighScoresDisplay() {
    function createListItems(scores) {
        return scores
            .sort((a, b) => b.score - a.score)
            .map(score => `<li>${player1Name} vs ${player2Name} (P1: ${score.player1Score}, P2: ${score.player2Score})</li>`)
            .join('');
    }

    document.getElementById('vsPlayerScoreList').innerHTML = createListItems(vsPlayerScores);
    document.getElementById('vsComputerScoreListEasy').innerHTML = createListItems(vsComputerScoresEasy);
    document.getElementById('vsComputerScoreListMedium').innerHTML = createListItems(vsComputerScoresMedium);
    document.getElementById('vsComputerScoreListHard').innerHTML = createListItems(vsComputerScoresHard);
}

function resetGame() {
    board.fill(null);
    document.querySelectorAll('.cell').forEach(cell => cell.textContent = '');
    currentPlayer = 'X';
    setTurnInProgress(true); // Ensure player's turn is enabled at the start
}

function resetScore() {
    player1Score = 0;
    player2Score = 0;
    updateScores();
}

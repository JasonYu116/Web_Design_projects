const { createApp } = Vue;

createApp({
    data() {
        return {
            board: [
                ["", "", ""],
                ["", "", ""],
                ["", "", ""]
            ],
            currentPlayer: "X",
            gameOver: false,
            message: "It's your turn!"  
        };
    },
    methods: {
        makeMove(i, j) {
            if (this.board[i][j] !== "" || this.gameOver) {
                return;
            }
            this.board[i][j] = this.currentPlayer;
            if (this.checkWinner(this.currentPlayer)) {
                this.gameOver = true;
                this.message = "Congratulations, you win! 🎉"; 
                return;
            }
            if (this.isFull()) {
                this.gameOver = true;
                this.message = "It's a tie! 🤝"; 
                return;
            }
            this.currentPlayer = "O";
            this.message = ""; // <-- Hide message during computer move
            setTimeout(this.computerMove, 300); // small delay
        },
        computerMove() {
            if (this.gameOver) return;
        
            const emptyCells = [];
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    if (this.board[i][j] === "") {
                        emptyCells.push([i, j]);
                    }
                }
            }
        
            // 1. Try to win
            for (const [i, j] of emptyCells) {
                this.board[i][j] = "O";
                if (this.checkWinner("O")) {
                    this.finishComputerMove();
                    return;
                }
                this.board[i][j] = "";
            }
        
            // 2. Block player
            for (const [i, j] of emptyCells) {
                this.board[i][j] = "X";
                if (this.checkWinner("X")) {
                    this.board[i][j] = "O";
                    this.finishComputerMove();
                    return;
                }
                this.board[i][j] = "";
            }
        
            // 3. Take center
            if (this.board[1][1] === "") {
                this.board[1][1] = "O";
                this.finishComputerMove();
                return;
            }
        
            // 4. Take a corner
            const corners = [[0, 0], [0, 2], [2, 0], [2, 2]];
            for (const [i, j] of corners) {
                if (this.board[i][j] === "") {
                    this.board[i][j] = "O";
                    this.finishComputerMove();
                    return;
                }
            }
        
            // 5. Take a side
            const sides = [[0, 1], [1, 0], [1, 2], [2, 1]];
            for (const [i, j] of sides) {
                if (this.board[i][j] === "") {
                    this.board[i][j] = "O";
                    this.finishComputerMove();
                    return;
                }
            }
        },
        
        finishComputerMove() {
            if (this.checkWinner("O")) {
                this.gameOver = true;
                this.message = "You lose! 😢";
            } else if (this.isFull()) {
                this.gameOver = true;
                this.message = "It's a tie! 🤝";
            } else {
                this.currentPlayer = "X";
                this.message = "It's your turn!";
            }
        },
        
        checkWinner(player) {
            // Rows
            for (let i = 0; i < 3; i++) {
                if (this.board[i][0] === player &&
                    this.board[i][1] === player &&
                    this.board[i][2] === player) {
                    return true;
                }
            }
            // Columns
            for (let j = 0; j < 3; j++) {
                if (this.board[0][j] === player &&
                    this.board[1][j] === player &&
                    this.board[2][j] === player) {
                    return true;
                }
            }
            // Diagonals
            if (this.board[0][0] === player &&
                this.board[1][1] === player &&
                this.board[2][2] === player) {
                return true;
            }
            if (this.board[0][2] === player &&
                this.board[1][1] === player &&
                this.board[2][0] === player) {
                return true;
            }
            return false;
        },
        isFull() {
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    if (this.board[i][j] === "") {
                        return false;
                    }
                }
            }
            return true;
        },
        resetGame() {
            this.board = [
                ["", "", ""],
                ["", "", ""],
                ["", "", ""]
            ];
            this.currentPlayer = "X";
            this.gameOver = false;
            this.message = "It's your turn!"; // <-- Reset message
        }
    }
}).mount("#app");

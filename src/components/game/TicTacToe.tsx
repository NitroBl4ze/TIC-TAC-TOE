import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type Player = 'X' | 'O';
type BoardCell = Player | null;
type GameState = 'selecting' | 'playing' | 'finished';

const TicTacToe = () => {
  const [gameState, setGameState] = useState<GameState>('selecting');
  const [humanPlayer, setHumanPlayer] = useState<Player>('X');
  const [aiPlayer, setAiPlayer] = useState<Player>('O');
  const [board, setBoard] = useState<BoardCell[]>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [winner, setWinner] = useState<Player | 'tie' | null>(null);
  const [showResult, setShowResult] = useState(false);

  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6] // diagonals
  ];

  const checkWinner = (board: BoardCell[]): Player | 'tie' | null => {
    for (const combination of winningCombinations) {
      const [a, b, c] = combination;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a] as Player;
      }
    }
    
    if (board.every(cell => cell !== null)) {
      return 'tie';
    }
    
    return null;
  };

  const selectPlayer = (player: Player) => {
    setHumanPlayer(player);
    setAiPlayer(player === 'X' ? 'O' : 'X');
    setCurrentPlayer('X'); // X always starts
    setGameState('playing');
    
    // If human chose O, AI (X) goes first
    if (player === 'O') {
      setTimeout(() => makeAIMove(Array(9).fill(null)), 500);
    }
  };

  const makeAIMove = (currentBoard: BoardCell[]) => {
    const availableMoves = currentBoard
      .map((cell, index) => cell === null ? index : null)
      .filter(val => val !== null) as number[];

    if (availableMoves.length === 0) return;

    // Simple AI: try to win, then block, then random
    let bestMove = -1;

    // Try to win
    for (const move of availableMoves) {
      const testBoard = [...currentBoard];
      testBoard[move] = aiPlayer;
      if (checkWinner(testBoard) === aiPlayer) {
        bestMove = move;
        break;
      }
    }

    // Try to block human from winning
    if (bestMove === -1) {
      for (const move of availableMoves) {
        const testBoard = [...currentBoard];
        testBoard[move] = humanPlayer;
        if (checkWinner(testBoard) === humanPlayer) {
          bestMove = move;
          break;
        }
      }
    }

    // Take center if available
    if (bestMove === -1 && currentBoard[4] === null) {
      bestMove = 4;
    }

    // Take random corner
    if (bestMove === -1) {
      const corners = [0, 2, 6, 8].filter(i => currentBoard[i] === null);
      if (corners.length > 0) {
        bestMove = corners[Math.floor(Math.random() * corners.length)];
      }
    }

    // Random move
    if (bestMove === -1) {
      bestMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }

    const newBoard = [...currentBoard];
    newBoard[bestMove] = aiPlayer;
    setBoard(newBoard);
    setCurrentPlayer(humanPlayer);

    const gameWinner = checkWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      setGameState('finished');
      setShowResult(true);
    }
  };

  const handleCellClick = (index: number) => {
    if (board[index] || currentPlayer !== humanPlayer || gameState !== 'playing') return;

    const newBoard = [...board];
    newBoard[index] = humanPlayer;
    setBoard(newBoard);
    setCurrentPlayer(aiPlayer);

    const gameWinner = checkWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      setGameState('finished');
      setShowResult(true);
      return;
    }

    // AI makes move after a short delay
    setTimeout(() => makeAIMove(newBoard), 500);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
    setGameState('selecting');
    setShowResult(false);
  };

  const getResultMessage = () => {
    if (winner === 'tie') return 'IT\'S A TIE!';
    if (winner === humanPlayer) return 'YOU WON!';
    return 'YOU LOST!';
  };

  const getResultVariant = () => {
    if (winner === 'tie') return 'default';
    if (winner === humanPlayer) return 'success';
    return 'destructive';
  };

  if (gameState === 'selecting') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Choose Your Player</CardTitle>
            <CardDescription>Select X or O to start playing</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4 justify-center">
            <Button 
              size="lg" 
              className="button-green-hover text-2xl w-20 h-20"
              onClick={() => selectPlayer('X')}
            >
              X
            </Button>
            <Button 
              size="lg" 
              className="button-green-hover text-2xl w-20 h-20"
              onClick={() => selectPlayer('O')}
            >
              O
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Tic Tac Toe</CardTitle>
          <CardDescription>
            You are {humanPlayer} • Current turn: {currentPlayer}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="hash-grid mb-6">
            <div className="grid grid-cols-3 gap-0 w-full h-full absolute inset-0 z-10">
              {board.map((cell, index) => (
                <button
                  key={index}
                  className="game-cell"
                  onClick={() => handleCellClick(index)}
                  disabled={cell !== null || currentPlayer !== humanPlayer || gameState !== 'playing'}
                >
                  {cell}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={resetGame} className="button-green-hover flex-1">
              New Game
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showResult} onOpenChange={setShowResult}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">
              {getResultMessage()}
            </DialogTitle>
            <DialogDescription className="text-center">
              {winner === 'tie' ? 'Nobody wins this time!' : 
               winner === humanPlayer ? 'Congratulations on your victory!' : 
               'Better luck next time!'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 mt-4">
            <Button onClick={resetGame} className="button-green-hover flex-1">
              Play Again
            </Button>
            <Button onClick={() => setShowResult(false)} className="button-green-hover">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TicTacToe;
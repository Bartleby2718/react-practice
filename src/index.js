import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

function Square(props) {
  return (
    <button
      className="square"
      onClick={props.onClick}
      style={{ backgroundColor: props.backgroundColor }}
    >
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i, backgroundColor) {
    return (
      <Square
        key={i}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        backgroundColor={backgroundColor}
      />
    );
  }

  render() {
    let rows = [];
    for (let i = 0; i < 3; i++) {
      let cells = [];
      for (let j = 0; j < 3; j++) {
        let index = 3 * i + j;
        let color = this.props.highlighted.includes(index) ? "yellow" : "";
        let cell = this.renderSquare(3 * i + j, color);
        cells.push(cell);
      }
      let row = (
        <div className="board-row" key={i}>
          {cells}
        </div>
      );
      rows.push(row);
    }
    return <div>{rows}</div>;
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(9).fill(null),
          row: null,
          column: null,
        },
      ],
      stepNumber: 0,
      xIsNext: true,
      isAscending: true,
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    let first = getThreeSquares(squares)[0];
    if (Number.isInteger(first) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? "X" : "O";
    this.setState({
      // concat() method doesn’t mutate the original array
      history: history.concat([
        {
          squares: squares,
          row: Math.floor(i / 3), // zero-based
          column: i % 3, // zero-based
        },
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: step % 2 === 0,
    });
  }

  toggleSortingOrder(e) {
    this.setState({
      isAscending: !this.state.isAscending,
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const [first, second, third] = getThreeSquares(current.squares);
    const winner = current.squares[first];

    const moves = history.map((step, move) => {
      const coordinates =
        move === 0
          ? ""
          : `(${history[move].row + 1}, ${history[move].column + 1})`;
      const desc = move ? "Go to move #" + move : "Go to game start";
      const additionalStyle = {
        fontWeight: move === this.state.stepNumber ? "bold" : "",
      };
      return (
        // Keys only need to be unique between components and their siblings
        <li key={move} style={additionalStyle}>
          {coordinates}
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });

    let status;
    if (winner) {
      status = "Winner: " + winner;
    } else if (history.length === 10) {
      status = "The game ended in a draw.";
    } else {
      status = "Next player: " + (this.state.xIsNext ? "X" : "O");
    }

    let isAscending = this.state.isAscending;
    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
            highlighted={[first, second, third]}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <button
            onClick={(e) => {
              this.toggleSortingOrder();
            }}
          >
            Sort in {isAscending ? "de" : "a"}scending order
          </button>
          <ol>{isAscending ? moves : moves.reverse()}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));

function getThreeSquares(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return [a, b, c];
    }
  }
  return [null, null, null];
}

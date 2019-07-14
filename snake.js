window.onload = function() {
  const SCREEN_COLOR = '#EEEEEE';
  const CANVAS_COLOR = '#FFFFFF';
  const CANVAS_BORDER_WIDTH = 10;
  const CANVAS_BORDER_COLOR = '#444444';
  const GRID_WIDTH = 20;
  const GRID_HEIGHT = 30;
  const TEXT_COLOR = 'blue';
  const TEXT_SIZE = 18;
  const CELL_SIZE = 20;
  const SNAKE_INITIAL_LENGTH = 3;
  const DELAY = 3;
  const TILE_INFO = { fill: '#2288FF', stroke: '#333333', width: 5 }
  const food = { x: 0, y: 0, fill: '#22FF22', stroke: '#444444', flashingFactor: 0.1 };
  const reservedLocations = [];
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  
  let countToUpdate = 0;
  let gameOver = false;
  let score = 0; 

  document.body.appendChild(canvas);
  
  document.body.style.background = SCREEN_COLOR;

  canvas.style.display = 'block';
  canvas.style.margin = '0 auto';
  canvas.style.background = CANVAS_COLOR;
  canvas.style.border = `solid ${CANVAS_BORDER_WIDTH}px ${CANVAS_BORDER_COLOR}`;

  const random = (min, max) => Math.random() * (max - min) + min;

  const translateXYtoRowCol = (x, y) => 
    (
      { y: parseInt(y / CELL_SIZE), x: parseInt(x / CELL_SIZE) }
    )

  const resizeScene = function() {
    canvas.width = CELL_SIZE * matrix[0].length;
    canvas.height = matrix.length * CELL_SIZE;
    canvas.style.marginTop = `${((window.innerHeight / 2) - (canvas.height / 2))}px`;
  };

  const putTiles = function() {
    reservedLocations.length = 0;

    const rows = matrix[0].length;
    const cols = matrix.length;

    for (let i = 1; i < matrix.length - 1; i ++) {
      for (let j = 1; j < matrix[0].length - 1; j ++) {

        matrix[i][j] = 0;
        
        const putTileOrNot = parseInt(random(1, rows + cols));

        if (putTileOrNot === 1) {
          if (matrix[i][j] === 0) {
            matrix[i][j] = 1;
            reservedLocations.push({
              x: j * CELL_SIZE,
              y: i * CELL_SIZE,
            });
          }
        }
      }
    }
  }

  const buildGrid = function(rows, cols) {
    const matrix = [];

    for (let i = 0; i < rows; i ++) {
      matrix[i] = [];

      for (let j = 0; j < cols; j ++)  {
        matrix[i][j] = 0;
      }
    }
    return matrix;
  };

  const rect = function(x, y, size, fill, stroke, lineWidth = 3, alpha = 1) {
    context.beginPath();
    context.fillStyle = fill;
    context.strokeStyle = stroke;
    context.lineWidth = lineWidth;
    context.globalAlpha = alpha;
    context.fillRect(x, y, size, size);
    context.strokeRect(x, y, size, size);
    context.globalAlpha = 1;
    context.closePath();
  }

  const isGameOver = function() {
    for (let i = 1; i < snake.parts.length; i ++) {
      if (snake.parts[i].x === snake.parts[0].x &&
        snake.parts[i].y === snake.parts[0].y) return true;
    }

    const xyGrid = translateXYtoRowCol(snake.parts[0].x, snake.parts[0].y);

    if (matrix[xyGrid.y][xyGrid.x] === 1) return true;

    return snake.parts[0].x + CELL_SIZE > canvas.width - CELL_SIZE ||
      snake.parts[0].x - CELL_SIZE < 0 ||
      snake.parts[0].y + CELL_SIZE > canvas.height - CELL_SIZE ||
      snake.parts[0].y - CELL_SIZE < 0;
  };

  const addSnake = function(n) {
    const snake = {
      size: CELL_SIZE,
      dir: {
        x: CELL_SIZE,
        y: 0,
      },
      fill: 'orange',
      stroke: '#222222',
      parts: [],
      updateDir: function(x, y) {
        this.dir.x = this.size * x;
        this.dir.y = this.size * y;
      }
    };

    for (let i = n; i > 0; i --) 
      snake.parts.push({ x: CELL_SIZE * i, y: CELL_SIZE * 5 })

    return snake;
  };

  const renderScore = function() {
    context.fillStyle = TEXT_COLOR;
    context.font = `${TEXT_SIZE}px Courier`;
    context.fillText('SCORE: ' + score, 6, TEXT_SIZE);
  };

  const renderInfoText = function() {
    context.fillStyle = TEXT_COLOR;
    context.font = `${TEXT_SIZE}px Courier`;
    context.fillText('PRESS[R] TO REPLAY', 6, TEXT_SIZE);
  };

  const renderTiles = function(matrix) {
    for (let i = 0; i < matrix.length; i ++) {
      for (let j = 0; j < matrix[i].length; j ++)
        if (matrix[i][j] === 1)
          rect(j * CELL_SIZE, i * CELL_SIZE, CELL_SIZE, TILE_INFO.fill, TILE_INFO.stroke, TILE_INFO.width);
    }
  };

  const renderSnake = function(_snake) {
    for (let i = 0; i < _snake.parts.length; i ++) {
      const p = _snake.parts[i];
      rect(p.x, p.y, _snake.size, _snake.fill, _snake.stroke, 5);
    }
  };

  const renderFood = function() {
    food.flashingFactor += 0.1;
    rect(food.x, food.y, CELL_SIZE, food.fill, food.stroke, 5, Math.cos(food.flashingFactor));
  };

  const addFood = function() {
    let isXYAvailable = true;

    food.x = parseInt(random(1, matrix[0].length - 1)) * CELL_SIZE;
    food.y = parseInt(random(1, matrix.length - 1)) * CELL_SIZE;

    for (let i = 0; i < snake.parts.length; i ++) {
      if (food.x === snake.parts[i].x && food.y === snake.parts[i].y) {
        isXYAvailable = false;
        break;
      }
    }

    for (let k = 0; k < reservedLocations.length; k ++) {
      const p = reservedLocations[k];

      if (food.x === p.x && food.y === p.y) { isXYAvailable = false; break; }
    }
    
    if (!isXYAvailable) addFood();
  };

  const update = function() {
    if (gameOver) return;

    countToUpdate ++;

    if (countToUpdate > DELAY) {
      countToUpdate = 0;
  
      const head = { x: snake.parts[0].x, y: snake.parts[0].y };

      snake.parts.unshift(head);
      
      head.x += snake.dir.x;
      head.y += snake.dir.y;

      if (head.x === food.x && head.y === food.y) {
        addFood(); score ++;
      } else snake.parts.pop();

      gameOver = isGameOver(); if (gameOver) return;
    }
  };

  const resetGame = function() {
    if (!gameOver) return;

    snake.parts.forEach(p => { p = null; });
    snake.parts.length = 0;
    snake = null;

    snake = addSnake(SNAKE_INITIAL_LENGTH);
    snake.updateDir(1, 0);

    putTiles();

    score = 0;
    gameOver = false;
  };

  const draw = function() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    renderTiles(matrix); renderSnake(snake); renderFood();

    if (!gameOver) renderScore();
    else renderInfoText('Press R to reset');

  };

  const tick = function() {
    update(); draw(); requestAnimationFrame(tick);
  };

  document.onkeydown = function({ keyCode }) {
    switch(keyCode) {
      case 37: if (snake.dir.x === 0) snake.updateDir(-1, 0);
        break;
      case 38: if (snake.dir.y === 0) snake.updateDir(0, -1);
        break;
      case 39: if (snake.dir.x === 0) snake.updateDir(1, 0);
        break;
      case 40: if (snake.dir.y === 0) snake.updateDir(0, 1);
        break;
      case 82: resetGame();
        break;
    }
  };

  const matrix = buildGrid(GRID_HEIGHT, GRID_WIDTH);
  putTiles();
  let snake  = addSnake(SNAKE_INITIAL_LENGTH);
  
  resizeScene(); addFood(); tick();
}
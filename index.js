let canvas = document.querySelector("#gameCanvas");
let context = canvas.getContext("2d");
let goober = new Image();
goober.src = "Goober.png";
let enemyArr = [];

const Globals = {
    playerSize: 20,
    gooberSize: 20,
    bulletSize: 10,
    bulletColor: "lime",
    tick: 500,
    bulletCooldown: 200,
    canFire: true
}

for (let i = 0; i < 200; i += 20) {
    for (let j = 0; j < 100; j += 20) {
        enemyArr.push([i, j]);
    }
}

let Player = {
    coords: [0, 0],
    moveRight: () => {
        if (!(Player.coords[0] + 20 >= canvas.width)) {
            Player.coords = [Player.coords[0] + 5, Player.coords[1]];
        }
        drawPlayer();
    },
    moveLeft: () => {
        if (!(Player.coords[0] <= 0)) {
            Player.coords = [Player.coords[0] - 5, Player.coords[1]];
        }
        drawPlayer();
    },
    fireBullet: () => {
        Bullets.bulletList.push([Player.coords[0] + 10, 0]);
    }
}

let Game = {
    gameInterval: 0,
    direction: "right",
    opStack: [],
    gameTick: () => {
        // Take Next OpStack
        if (Game.opStack.length > 0) {
            (Game.opStack.shift())();
        }
        // Check Hit Bullets
        for (let i = 0; i < Bullets.bulletList.length; i++) {
            if (checkHit(enemyArr, Bullets.bulletList[i], i)) {
                break;
            }
        }
        // Move Goobers
        try {
            moveGoobers();
        }
        // Catches error if the Goobers have gotten too close
        catch (e) {
            console.error(e);
            stopGame(false);
        }
        // New Bullets
        Bullets.handleBullets();
        // Check Game Over
        if (enemyArr.length === 0) {
            stopGame(true);
        }
    },
    startGame: () => {
        Game.gameInterval = setInterval(Game.gameTick, Globals.tick);
    }
}

const handleKeys = (e) => {
    if (e.key.toLowerCase() === "d") {
        console.log("Moving Right");
        Player.moveRight();
    }
    if (e.key.toLowerCase() === "a") {
        console.log("Moving Left");
        Player.moveLeft();
    }
    if (e.key === " ") {
        console.log("Firing Bullet");
        if (Globals.canFire) {
            Game.opStack.push(() => { Player.fireBullet() });
            Globals.canFire = false;
            setTimeout(() => {
                Globals.canFire = true;
            }, Globals.bulletCooldown);
        }
    }
}

const stopGame = (winner) => {
    if (!winner) {
        alert("Game Over You LOSE!");
    } else {
        alert("Victory!");
    }
    clearCanvas();
    document.removeEventListener("keypress", handleKeys);
    clearInterval(Game.gameInterval);
}

const checkHit = (board, bullet, index) => {
    for (let i = 0; i < board.length; i++) {
        let row = board[i];
        console.log(Bullets.bulletList);
        console.log(bullet, row);
        // Checks X within Row range
        if (bullet[0] <= row[0] + 20 && bullet[0] >= row[0]) {
            // Checks if Y within Row range
            if (canvas.height - 30 - bullet[1] <= row[1] + 20 && canvas.height - 30 - bullet[1] >= row[1]) {
                board.splice(i, 1);
                fillGoobers(board);
                Bullets.bulletList.splice(index, 1);
                return true;
            }
        }
    }
}

const Bullets = {
    bulletObj: {
        "bulletUuid": "bulletNum"
    },
    bulletList: [],
    handleBullets: () => {
        Bullets.bulletList = Bullets.bulletList.filter((bulletArr) => {
            return bulletArr[1] < canvas.height;
        })
        for (let i = 0; i < Bullets.bulletList.length; i++) {
            let bullet = Bullets.bulletList[i];
            context.beginPath();
            context.strokeStyle = Globals.bulletColor;
            context.moveTo(bullet[0], canvas.height - Globals.gooberSize - bullet[1]);
            context.lineTo(bullet[0], canvas.height - Globals.bulletSize - Globals.gooberSize - bullet[1]);
            context.stroke();
            context.stroke();
            context.stroke();
            bullet[1] += 2.5;
        }
    }
}

const fillGoobers = (enemyBoard) => {
    clearUpperCanvas();
    for (let i = 0; i < enemyBoard.length; i++) {
        if (enemyBoard[i][1] + 2 * Globals.gooberSize >= canvas.height) {
            throw "Game Over Error";
        }
        context.drawImage(goober, enemyBoard[i][0], enemyBoard[i][1], Globals.gooberSize, Globals.gooberSize);
    }
}

const clearCanvas = () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
}

const clearUpperCanvas = () => {
    context.clearRect(0, 0, canvas.width, canvas.height - 20);
}

const clearPlayerRow = () => {
    context.clearRect(0, canvas.height - 20, canvas.width, 20);
}

// Returns array of changes to make to all goobers
const gooberChanges = (canvas, direction, currentBoard) => {
    let arrChanges = [0, 0];
    currentBoard.forEach((arr) => {
        if (direction === "right") {
            if (arr[0] + 20 >= canvas.width) {
                direction = "left";
                arrChanges[1] = arrChanges[1] + 2.5;
            }
        }
        else if (direction === "left") {
            if (arr[0] <= 0) {
                direction = "right";
                arrChanges[1] = arrChanges[1] + 2.5;
            }
        }
    });
    if (direction === "right") {
        arrChanges[0] = arrChanges[0] + 2.5;
    } else {
        arrChanges[0] = arrChanges[0] - 2.5;
    }
    return [arrChanges, direction];
}

const moveGoobers = () => {
    let [arrChanges, newDir] = gooberChanges(canvas, Game.direction, enemyArr);
    Game.direction = newDir;
    enemyArr = enemyArr.map(arr => {
        return [arr[0] + arrChanges[0], arr[1] + arrChanges[1]];
    })
    clearUpperCanvas();
    fillGoobers(enemyArr);
}

const startGame = () => {
    drawPlayer();
    document.addEventListener("keypress", handleKeys)
    Game.startGame();
}

const drawPlayer = () => {
    context.fillStyle = "red";
    clearPlayerRow();
    context.fillRect(
        Player.coords[0],
        canvas.height - 20,
        20,
        20);
}
let canvas = document.querySelector("#gameCanvas");
let context = canvas.getContext("2d");
let goober = new Image(20, 20);
goober.src = "Images\\Goober.png";
let enemyArr = [];

const Globals = {
    gameStarted: false,
    tick: 200,
    canFire: true,
    Player: {
        width: 20,
        height: 20
    },
    Goober: {
        width: 20,
        height: 20,
        numberWidth: 10,
        numberHeight: 5
    },
    Bullet: {
        size: 10,
        speed: 5,
        color: "lime",
        cooldown: 200
    }
}

for (let i = 0; i < Globals.Goober.numberWidth * Globals.Goober.width; i += Globals.Goober.width) {
    for (let j = 0; j < Globals.Goober.numberHeight * Globals.Goober.height; j += Globals.Goober.height) {
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
            }, Globals.Bullet.cooldown);
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
            context.strokeStyle = Globals.Bullet.color;
            context.moveTo(bullet[0], canvas.height - Globals.Goober.height - bullet[1]);
            context.lineTo(bullet[0], canvas.height - Globals.Bullet.size - Globals.Goober.height - bullet[1]);
            context.stroke();
            context.stroke();
            context.stroke();
            bullet[1] += Globals.Bullet.speed;
        }
    }
}

const fillGoobers = (enemyBoard) => {
    clearUpperCanvas();
    for (let i = 0; i < enemyBoard.length; i++) {
        if (enemyBoard[i][1] + 2 * Globals.Goober.height >= canvas.height) {
            throw "Game Over Error";
        }
        context.drawImage(goober, enemyBoard[i][0], enemyBoard[i][1], Globals.Goober.width, Globals.Goober.height);
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
    let button = document.querySelector("#startButton");
    button.hidden = true;
    button.disabled = true;
    drawPlayer();
    moveGoobers();
    document.addEventListener("keypress", handleKeys)
    Game.startGame();
}

const drawPlayer = () => {
    context.fillStyle = "red";
    clearPlayerRow();
    context.fillRect(
        Player.coords[0],
        canvas.height - Globals.Player.height,
        Globals.Player.width,
        Globals.Player.height);
}
let canvas = document.querySelector("#gameCanvas");
let context = canvas.getContext("2d");
let goober = new Image();
goober.src = "Goober.png";
let enemyArr = [];

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
        shootBullet(Player.coords[0] + 10);
    }
}

const Game = {
    opStack: [],
    batchGooberMove: () => { },
    batchPlayerMove: () => { },
    batchPlayerShot: () => { }
}

const handleKeys = (e) => {
    console.log(e.key);
    if (e.key.toLowerCase() === "d") {
        Player.moveRight();
    }
    if (e.key.toLowerCase() === "a") {
        console.log("moving left");
        Player.moveLeft();
    }
    if (e.key === " ") {
        console.log("Firing Bullet");
        Player.fireBullet();
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
}

const checkHit = (board, bullet) => {
    for (let i = 0; i < board.length; i++) {
        let row = board[i];
        // Checks X within Row range
        if (bullet[0] <= row[0] + 20 && bullet[0] >= row[0]) {
            // Checks if Y within Row range
            if (bullet[1] <= row[1] + 20 && bullet[1] >= row[1]) {
                delete board[i];
                enemyArr = board.filter((value) => {
                    return Boolean(value);
                })
                fillGoobers(board);
                return true;
            }
        }
    }
}

const Bullets = {
    bulletObj: {
        "bulletUuid": "bulletNum"
    },
    addBullet: (bulletUuid, bulletNum) => {
        Bullets.bulletObj[`${bulletUuid}`] = bulletNum;
    },
    removeBullet: (bulletUuid) => {
        let bulletNum = Bullets.bulletObj[`${bulletUuid}`];
        delete Bullets.bulletObj[`${bulletUuid}`];
        clearInterval(bulletNum);
    }
}

const shootBullet = (startXCoord) => {
    // First path
    let bulletDepth = 0;
    let bulletUuid = Math.floor(Math.random() * 1000);
    let bulletInterval = setInterval(() => {
        console.log(bulletUuid);
        context.beginPath();
        context.strokeStyle = 'lime';
        context.moveTo(startXCoord, canvas.height - 20 - bulletDepth);
        context.lineTo(startXCoord, canvas.height - 30 - bulletDepth);
        context.stroke();
        bulletDepth += 5;
        let hit = checkHit(enemyArr, [startXCoord, canvas.height - 20 - bulletDepth]);
        if (hit) {
            console.log("ending");
            Bullets.removeBullet(bulletUuid);
        }
        if (enemyArr.length === 0) {
            stopGame(true);
        }
    }, 100, bulletUuid);
    Bullets.addBullet(bulletUuid, bulletInterval);
    setTimeout(() => {
        Bullets.removeBullet(bulletUuid);
    }, 2500);
}

const fillGoobers = (enemyBoard) => {
    clearUpperCanvas();
    for (let i = 0; i < enemyBoard.length; i++) {
        if (enemyBoard[i][1] + 20 >= canvas.height) {
            stopGame(false);
            break;
        }
        context.drawImage(goober, enemyBoard[i][0], enemyBoard[i][1], 20, 20);
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
                arrChanges[1] = arrChanges[1] + 5;
            }
        }
        else if (direction === "left") {
            if (arr[0] <= 0) {
                direction = "right";
                arrChanges[1] = arrChanges[1] + 5;
            }
        }
    });
    if (direction === "right") {
        arrChanges[0] = arrChanges[0] + 5;
    } else {
        arrChanges[0] = arrChanges[0] - 5;
    }
    return [arrChanges, direction];
}

const gooberDance = () => {
    let direction = "right";
    for (let i = 0; i < 100; i++) {
        setTimeout(() => {
            let [arrChanges, newDir] = gooberChanges(canvas, direction, enemyArr);
            console.log(arrChanges, enemyArr);
            direction = newDir;
            enemyArr = enemyArr.map(arr => {
                return [arr[0] + arrChanges[0], arr[1] + arrChanges[1]];
            })
            clearUpperCanvas();
            fillGoobers(enemyArr);
        }, i * 200);
    }
}

// Fill Board Called Upon Image Load
goober.addEventListener("load", () => {
    fillGoobers(enemyArr);
})

const startGame = () => {
    drawPlayer();
    document.addEventListener("keypress", handleKeys)
    gooberDance();
}

const drawPlayer = () => {
    context.fillStyle = "red";
    console.log(Player.coords);
    clearPlayerRow();
    context.fillRect(
        Player.coords[0],
        canvas.height - 20,
        20,
        20);
}
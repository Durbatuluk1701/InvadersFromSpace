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

let player = {
    coords: [0, 0],
    moveRight: () => {
        if (!(player.coords[0] + 20 >= canvas.width)) {
            player.coords = [player.coords[0] + 5, player.coords[1]];
        }
        drawPlayer();
    },
    moveLeft: () => {
        if (!(player.coords[0] <= 0)) {
            player.coords = [player.coords[0] - 5, player.coords[1]];
        }
        drawPlayer();
    },
    fireBullet: () => {
        shootBullet(player.coords[0] + 10);
    }
}

const checkHit = (board, bullet) => {
    console.log(board);
    console.log(bullet);
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

const shootBullet = (startXCoord) => {
    // First path
    let bulletDepth = 0;
    let bulletInterval = setInterval(() => {
        context.beginPath();
        context.strokeStyle = 'lime';
        context.moveTo(startXCoord, canvas.height - 20 - bulletDepth);
        context.lineTo(startXCoord, canvas.height - 30 - bulletDepth);
        context.stroke();
        bulletDepth += 5;
        checkHit(enemyArr, [startXCoord, canvas.height - 20 - bulletDepth]);
    }, 100);
    setTimeout(() => {
        clearInterval(bulletInterval);
    }, 2500);
}

const fillGoobers = (enemyBoard) => {
    clearUpperCanvas();
    enemyBoard.forEach(coords => {
        context.drawImage(goober, coords[0], coords[1], 20, 20);
    })
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
            if (arr[0] + 5 >= canvas.width) {
                direction = "left";
                arrChanges[1] = arrChanges[1] + 5;
            }
            arrChanges[0] = arrChanges[0] + 5;
        }
        else if (direction === "left") {
            if (arr[0] - 5 <= 0) {
                direction = "right";
                arrChanges[1] = arrChanges[1] + 5;
            }
            arrChanges[0] = arrChanges[0] - 5;
        }
    });
    return [arrChanges, direction];
}

const gooberDance = () => {
    let newBoard = enemyArr;
    let direction = "right";
    for (let i = 0; i < 505; i++) {
        setTimeout(() => {
            let [arrChanges, newDir] = gooberChanges(canvas, direction, newBoard);
            direction = newDir;
            newBoard = newBoard.map(arr => {
                return [arr[0] + arrChanges[0], arr[1] + arrChanges[1]];
            })
            clearCanvas();
            fillGoobers(newBoard);
        }, i * 500);
    }
}

// Fill Board Called Upon Image Load
goober.addEventListener("load", () => {
    fillGoobers(enemyArr);
})

const startGame = () => {
    drawPlayer();
}

const drawPlayer = () => {
    context.fillStyle = "red";
    console.log(player.coords);
    clearPlayerRow();
    context.fillRect(
        player.coords[0],
        canvas.height - 20,
        20,
        20);
}

document.addEventListener("keypress", (e) => {
    console.log(e.key);
    if (e.key.toLowerCase() === "d") {
        player.moveRight();
    }
    if (e.key.toLowerCase() === "a") {
        console.log("moving left");
        player.moveLeft();
    }
    if (e.key === " ") {
        console.log("Firing Bullet");
        player.fireBullet();
    }
})
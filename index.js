let canvas = document.querySelector("#gameCanvas");
let context = canvas.getContext("2d");
let goober = document.querySelector("#goober");
context.drawImage(goober, 10, 10);
console.log("image");
let placeArr = [
    [10, 10],
    [10, 50],
    [10, 90],
    [50, 10],
    [50, 50],
    [50, 90],
];
placeArr.forEach(coords => {
    context.drawImage(goober, coords[0], coords[1]);
})

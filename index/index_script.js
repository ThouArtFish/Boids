import Flock from "../boid_stuff/Flock.js";
import Vec2 from "../boid_stuff/Vec2.js";

// Constants
const canvas = document.getElementById("display");
const ctx = canvas.getContext("2d");
// initialise flock
const boids = new Flock({count: 100, width: canvas.width, height: canvas.height});
// length of boid pointer
const boid_head = 18;
// track time
var lastTime = 0;

// Updates adjustable variables, looks dodgy
function updateVar() {
    let sliders = document.getElementsByClassName("sliders");
    for (let elem of sliders) {
        switch (elem.id) {
            case "slider_C":
                boids.cohesion = elem.value / 10;
                document.getElementById(elem.id + "_label").innerHTML = boids.cohesion;
                break;
            case "slider_A":
                boids.alignment = elem.value / 10;
                document.getElementById(elem.id + "_label").innerHTML = boids.alignment;
                break;
            case "slider_S":
                boids.separation = elem.value / 10;
                document.getElementById(elem.id + "_label").innerHTML = boids.separation;
                break;
            case "slider_V":
                boids.speed = elem.value * 0.5;
                document.getElementById(elem.id + "_label").innerHTML = elem.value;
                break;
            case "slider_B":
                while (elem.value != boids.flock.length) {
                    if (elem.value > boids.flock.length) {
                        boids.flock.push(boids.createBoid(Vec2.randomInt(5, canvas.width-5), Vec2.randomInt(5, canvas.height-5)));
                    } else if (elem.value < boids.flock.length) {
                        boids.flock.shift();
                    }
                }
                document.getElementById(elem.id + "_label").innerHTML = elem.value;
                break;
        }
    }
}

// draws a single boid
function drawBoid(boid) {
    // Draws the body of the boid
    ctx.beginPath();
    ctx.arc(boid.pos.x, boid.pos.y, boids.boid_diameter, 0, 2 * Math.PI);
    ctx.fill();
    // Draws the "head" of the boid
    ctx.moveTo(boid.pos.x, boid.pos.y);
    let lineEnd = boid.pos.add(boid.vel.scale(boid_head));
    ctx.lineTo(lineEnd.x, lineEnd.y);
    ctx.stroke();
    // Stops drawing
    ctx.closePath();
}

// updates html canvas
function updateDisplay(timestamp) {
    let dTime = (timestamp - lastTime) * 0.06;
    lastTime = timestamp;
    // Clears canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Update adjustable variables
    updateVar();
    // Updates each boid and then draws them
    let total_frens = boids.formGroups();
    for (let i = 0; i < boids.flock.length; i++) {
        boids.updateBoid({deltaTime: dTime, i: i, frens: total_frens[i]});
        drawBoid(boids.flock[i]);
    }
    // Loops
    requestAnimationFrame(updateDisplay);
}

// Startup
ctx.fillStyle = "white";
ctx.strokeStyle = "white";
ctx.lineWidth = 3;

document.getElementById("slider_C").value = 5;
document.getElementById("slider_A").value = 5;
document.getElementById("slider_S").value = 5;
document.getElementById("slider_B").value = 100;
document.getElementById("slider_V").value = 10;

updateDisplay(0);
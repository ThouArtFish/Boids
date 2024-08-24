import Flock from "../boid_stuff/Flock.js";
import Vec2 from "../boid_stuff/Vec2.js";

// Constants
const canvas = document.getElementById("display");
const ctx = canvas.getContext("2d");
// Custom flock
var boids = new Flock({count: 15, width: canvas.width, height: canvas.height, bf: 1.2, a: 0, v: 5, bd: 5, s: 0.3});
// Event stack 
var event_stack = [];
// Track time
var lastTime = 0;
var currentAppleTime = 0;

// Event listener to add events to stack so they can be proccessed in the main loop
canvas.addEventListener("click", function(e) {
    let l = event_stack.push(e);
    if (l == 1) {
        currentAppleTime = lastTime;
    }
});

// Gets mouse position
function mousePos(canvas, e) {
    const rect = canvas.getBoundingClientRect();
    return new Vec2(e.clientX - rect.left, e.clientY - rect.top)
}
// Draws a boid
function drawBoid(boid) {
    ctx.beginPath();
    ctx.arc(boid.pos.x, boid.pos.y, boids.boid_diameter, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
}

// Updates html canvas
function updateDisplay(timestamp) {
    let deltaTime = (timestamp - lastTime) / 1000;
    lastTime = timestamp;
    let appleTimer = (timestamp - currentAppleTime) / 1000;
    if (appleTimer > 6) {
        event_stack.shift();
        currentAppleTime = timestamp;
    }
    // Sets canvas center to apples so boids swarm around it, else default to actual canvas center
    if (event_stack.length > 0) {
        boids.canvas_center = mousePos(canvas, event_stack[0]);
    } else {
        boids.canvas_center = new Vec2(canvas.width/2, canvas.height/2);
    }
    // Clears canvas and updates boids
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    boids.updateBoids(deltaTime * 60);
    for (let i = 0; i < boids.flock.length; i++) {
        // Draws boids
        drawBoid(boids.flock[i]);
        // Goes through event stack
        if (i < event_stack.length) {
            // Gets mouse position relative to canvas origin
            const mouse = mousePos(canvas, event_stack[i]);
            // Draws "apples"
            ctx.beginPath();
            ctx.arc(mouse.x, mouse.y, 10, 0, 2 * Math.PI);
            ctx.fillStyle = "red";
            ctx.fill();
            ctx.fillStyle = "black";
            ctx.closePath();
        }
    }
    requestAnimationFrame(updateDisplay);
}

// Setup
ctx.fillStyle = "black";

updateDisplay(0);

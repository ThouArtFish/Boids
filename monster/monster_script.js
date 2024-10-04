import Flock from "../boid_stuff/Flock.js";
import Vec2 from "../boid_stuff/Vec2.js";

// Constants
const canvas = document.getElementById("display");
const ctx = canvas.getContext("2d");
// Custom flock
const boids = new Flock({count: 25, width: canvas.width, height: canvas.height, gr: 60, bf: 0.15, df: 4, dr: 100, v: 4, bd: 5, s: 0.2, c: 0.3, a: 0.01});
// Event stack 
var event_stack = [];
// Track time
var last_time = 0;
var current_apple_time = 0;
var bullets_fired = 0;
// Current bullet
var bullet = {pos: new Vec2(), vel: new Vec2()}

// Gets mouse position
function mousePos(canvas, e) {
    const rect = canvas.getBoundingClientRect();
    return new Vec2(e.clientX - rect.left, e.clientY - rect.top)
}

// Creats a bullet with a starting position and aimed towards the flock
function createBullet() {
    bullet.pos = new Vec2(Vec2.randomInt(5, canvas.width - 5), -5);
    bullet.vel = boids.flock[0].pos.subtract(bullet.pos).scale(5);
}
// Draws bullet and changes its position
function moveBullet() {
    ctx.beginPath();
    ctx.arc(bullet.pos.x, bullet.pos.y, 10, 0, 2 * Math.PI);
    ctx.fillStyle = "blue";
    ctx.fill();
    ctx.fillStyle = "black";
    ctx.closePath();
    bullet.pos = bullet.pos.add(bullet.vel);
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
    let dTime = (timestamp - last_time) * 0.06;
    last_time = timestamp;
    let appleTimer = (timestamp - current_apple_time) / 1000;
    if (appleTimer > 6 && event_stack.length > 0) {
        event_stack.shift();
        current_apple_time = timestamp;
        boids.flock.push(boids.createBoid(Vec2.randomInt(100, canvas.width-100), Vec2.randomInt(100, canvas.height-100)));
    }
    // creates new bullet every 6 seconds
    if (timestamp / 2000 >= bullets_fired) {
        createBullet();
        bullets_fired += 1;
    }
    // Sets canvas center to apples so boids swarm around it, else default to actual canvas center
    if (event_stack.length > 0) {
        boids.canvas_center = mousePos(canvas, event_stack[0]);
    } else {
        boids.canvas_center = new Vec2(canvas.width/2, canvas.height/2);
    }
    // Clears canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Move bullet
    moveBullet();
    // iterate through each boid
    let total_frens = boids.formGroups();
    for (let i = 0; i < boids.flock.length; i++) {
        boids.updateBoid({deltaTime: dTime, i: i, frens: total_frens[i], def: [bullet.pos]});
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

// Event listener to add events to stack so they can be proccessed in the main loop
canvas.addEventListener("click", function(e) {
    let l = event_stack.push(e);
    if (l == 1) {
        current_apple_time = last_time;
    }
});

ctx.fillStyle = "black";
canvas.style.backgroundColor = "green";
updateDisplay(0);

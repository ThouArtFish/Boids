import Flock from "./Flock.js";
import Boid from "./Boid.js";
import Vec2 from "./Vec2.js";

// Constants

const canvas = document.getElementById("display");
const ctx = canvas.getContext("2d");
const boid_head = 20;
ctx.fillStyle = "white";
ctx.strokeStyle = "white";
ctx.lineWidth = 3;
var boids = new Flock(50, canvas.width, canvas.height)

// Rendering

function draw(boid) {
    ctx.beginPath();
    ctx.arc(boid.pos.x, boid.pos.y, boids.boid_diameter, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.moveTo(boid.pos.x, boid.pos.y);
    let lineEnd = boid.pos.add(boid.vel.scale(boid_head));
    ctx.lineTo(lineEnd.x, lineEnd.y);
    ctx.stroke();
    ctx.closePath();
}

// Updates variables, looks dodgy

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
                boids.speed = elem.value / 10;
                document.getElementById(elem.id + "_label").innerHTML = boids.speed;
                break;
            case "slider_B":
                while (elem.value != boids.flock.length) {
                    if (elem.value > boids.flock.length) {
                        boids.flock.push(new Boid(boids.randomInt(5, canvas.width-5), boids.randomInt(5, canvas.height-5), boids.speed));
                    } else if (elem.value < boids.flock.length) {
                        boids.flock.pop(boids.flock[0])
                    }
                }
                document.getElementById(elem.id + "_label").innerHTML = elem.value;
                break;
        }
    }
}

// Updates screen

function updateScreen() {
    // Clears canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //Update variables if changed with html elem
    updateVar();
    // Updates each boid and then draws them
    for (let i = 0; i < boids.flock.length; i++) {
        boids.updateBoid(i);
        draw(boids.flock[i]);
    }
    //Loops
    requestAnimationFrame(updateScreen);
}

// Startup

document.getElementById("slider_C").value = 5;
document.getElementById("slider_A").value = 5;
document.getElementById("slider_S").value = 5;
document.getElementById("slider_B").value = 50;
document.getElementById("slider_V").value = 20;

updateScreen();

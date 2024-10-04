import Flock from "../boid_stuff/Flock.js";
import Vec2 from "../boid_stuff/Vec2.js";

const canvas = document.getElementById("display");
const ctx = canvas.getContext("2d");
const boid_head = 18;

const flock_settings = {count: 20, width: canvas.width, height: canvas.height, v: 3, gr: 50}
const red_team = new Flock(flock_settings)
const blue_team = new Flock(flock_settings)
for (let i = 0; i < red_team.flock.length; i++) {
    red_team.flock[i].colour = "red";
    blue_team.flock[i].colour = "blue";
}
var last_time = 0;

function drawBoid(boid) {
    ctx.fillStyle = boid.colour;
    ctx.strokeStyle = boid.colour;
    ctx.beginPath();
    ctx.arc(boid.pos.x, boid.pos.y, red_team.boid_diameter, 0, 2 * Math.PI);
    ctx.fill();

    ctx.moveTo(boid.pos.x, boid.pos.y);
    let lineEnd = boid.pos.add(boid.vel.scale(boid_head));
    ctx.lineTo(lineEnd.x, lineEnd.y);
    ctx.stroke();
    ctx.closePath();
}

function updateDisplay(timestamp) {
    let dTime = (timestamp - last_time) * 0.06;
    last_time = timestamp;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let total_boids = new Flock({count: 0, width: 0, height: 0})
    total_boids.flock = [...red_team.flock, ...blue_team.flock]
    let total_frens = total_boids.formGroups()
    for (let i = 0; i < total_boids.flock.length; i++) {
        let red_count = total_frens[i].filter((boid) => boid.colour == "red");
        let blue_count = total_frens[i].filter((boid) => boid.colour == "blue");
        if (i < red_team.flock.length) {
            if (red_count.length >= blue_count.length && blue_count.length > 0) {
                red_team.updateBoid({deltaTime: dTime, i: i, frens: red_count, 
                    att: [blue_count[Vec2.randomInt(0, blue_count.length-1)].pos]});
            } else {
                red_team.updateBoid({deltaTime: dTime, i: i, frens: red_count, 
                    def: blue_count.map((boid) => boid.pos)});
            }
        }
        else if (i >= red_team.flock.length) {
            if (blue_count.length > red_count.length && red_count.length > 0) {
                blue_team.updateBoid({deltaTime: dTime, i: i - red_team.flock.length, frens: blue_count, 
                    att: [red_count[Vec2.randomInt(0, red_count.length-1)].pos]});
            } else {
                blue_team.updateBoid({deltaTime: dTime, i: i - red_team.flock.length, frens: red_count, 
                    def: red_count.map((boid) => boid.pos)});
            }
        }
        drawBoid((i < red_team.flock.length) ? red_team.flock[i] : blue_team.flock[i - red_team.flock.length]);
    }
    requestAnimationFrame(updateDisplay);
}

canvas.style.backgroundColor = "black";
ctx.lineWidth = 3;
updateDisplay(0);
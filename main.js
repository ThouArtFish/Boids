const canvas = document.getElementById("display");
const ctx = canvas.getContext("2d");
ctx.fillStyle = "white";
ctx.strokeStyle = "white";
ctx.lineWidth = 3;
var flock = [];
var pad_horizontal = 10;
var pad_vertical = 10;
var group_radius = 70;
var boidDiameter = 4;
var boidDirIndicator = 15;

document.getElementById("slider_C").value = 5;
document.getElementById("slider_A").value = 5;
document.getElementById("slider_S").value = 5;
document.getElementById("slider_F").value = 60;
document.getElementById("slider_B").value = 50;
document.getElementById("slider_V").value = 20;

var speed = 2;
var alignment;
var cohesion;
var separation;
var fov;

// Class for managing vector calculations
class Vec2 {
    constructor(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }
    add(vec2) {
        return new Vec2(this.x + vec2.x, this.y + vec2.y);
    }
    subtract(vec2) {
        return new Vec2(this.x - vec2.x, this.y - vec2.y);
    }
    scalar_mult(val) {
        return new Vec2(this.x * val, this.y * val);
    }
    length_sq() {
        return (this.x ** 2) + (this.y ** 2);
    }
    length() {
        return Math.sqrt(this.length_sq());
    }
    scale(x) {
        return this.scalar_mult(x/this.length());
    }
    dot(vec2) {
        return (this.x * vec2.x) + (this.y * vec2.y);
    }
    angle(vec2) {
        let cos = (this.dot(vec2)) / (this.length() * vec2.length());
        return Math.acos(cos);
    }
    static avg_vector(vec_arr) {
        let total = new Vec2();
        for (let i = 0; i < vec_arr.length; i++) {
            total = total.add(vec_arr[i]);
        }
        total = total.scalar_mult(1/vec_arr.length);
        return total;
    }
}

// Class for creating boids
class Boid {
    constructor(x, y) {
        this.pos = new Vec2(x, y);
        this.vel = new Vec2(Math.random(), Math.random()).scale(speed);
        this.vel.x = Math.random() > 0.5? this.vel.x: this.vel.x * -1;
        this.vel.y = Math.random() > 0.5? this.vel.y: this.vel.y * -1;
        this.in_padding = false;
    }
    at_border() {
        if (this.pos.x <= 1 || this.pos.x >= canvas.width - 1) {
            this.vel.x *= -1;
        }
        if (this.pos.y <= 1 || this.pos.y >= canvas.height - 1) {
            this.vel.y *= -1;
        }
    }
    at_padding() {
       if ((this.pos.x > pad_horizontal && this.pos.x < canvas.width - pad_horizontal) 
            && (this.pos.y > pad_vertical && this.pos.y < canvas.height - pad_vertical))  {
            this.in_padding = false;
       } else {
            this.in_padding = true;
       }
    }
    find_frens(flock) {
        let l = []
        for (let x in flock) {
            let boid = flock[x];
            let in_range = this.pos.subtract(boid.pos).length_sq() <= group_radius ** 2;
            let in_fov = this.vel.angle(this.pos.subtract(boid.pos)) <= fov;
            if (in_fov && in_range && boid != this && !boid.in_padding) {
                l.push(boid);
            }
        }
        return l;
    }
    update(flock) {
        this.at_border();
        this.at_padding();
        let frens = this.find_frens(flock);
        if (frens.length != 0 && !this.in_padding) {
            let heading = Vec2.avg_vector(frens.map((b) => b.vel)).scale(1);
            let center = Vec2.avg_vector(frens.map((b) => b.pos));
            let normal_dist = Math.min(center.subtract(this.pos).length() / group_radius, 1);
            let dir_to_center = center.subtract(this.pos).scale(1);

            let a = lerp(0, alignment, normal_dist);
            let c = lerp(0, cohesion, normal_dist);
            let s = lerp(0, separation, 1 - normal_dist);

            let total_vectors = [
                heading.scalar_mult(a),
                dir_to_center.scalar_mult(c),
                dir_to_center.scalar_mult(-s),
                this.vel.scale(1)
            ];
            this.vel = Vec2.avg_vector(total_vectors).scale(speed);
        }
        this.pos = this.pos.add(this.vel);
    }
}

// Util
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}
function lerp(a, b, k) {
    return k * (a - b) + b
}

// Rendering
function draw(boid) {
    ctx.beginPath();
    ctx.arc(boid.pos.x, boid.pos.y, boidDiameter, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.moveTo(boid.pos.x, boid.pos.y);
    let lineEnd = boid.pos.add(boid.vel.scale(boidDirIndicator));
    ctx.lineTo(lineEnd.x, lineEnd.y);
    ctx.stroke();
    ctx.closePath();
}

function updateVar() {
    let sliders = document.getElementsByClassName("sliders");
    for (let i = 0; i < sliders.length; i++) {
        let elem = sliders[i];
        switch (elem.id) {
            case "slider_C":
                cohesion = elem.value / 10;
                document.getElementById(elem.id + "_label").innerHTML = cohesion;
                break;
            case "slider_A":
                alignment = elem.value / 10;
                document.getElementById(elem.id + "_label").innerHTML = alignment;
                break;
            case "slider_S":
                separation = elem.value / 10;
                document.getElementById(elem.id + "_label").innerHTML = separation;
                break;
            case "slider_V":
                speed = elem.value / 10;
                document.getElementById(elem.id + "_label").innerHTML = speed;
                break;
            case "slider_F":
                fov = elem.value * (Math.PI / 180)
                document.getElementById(elem.id + "_label").innerHTML = elem.value + "°";
                break;
            case "slider_B":
                for (let i = 0; i < Math.abs(elem.value - flock.length); i++) {
                    if (elem.value > flock.length) {
                        flock.push(new Boid(randomInt(10, canvas.width-10), randomInt(10, canvas.height-10)));
                    } else if (elem.value < flock.length) {
                        flock.pop(flock[0])
                    }
                    if (flock.length == elem.value) {
                        break;
                    }
                }
                document.getElementById(elem.id + "_label").innerHTML = elem.value;
                break;
        }
    }
}

function updateScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateVar();
    for (let key in flock) {
        let boid = flock[key];
        boid.update(flock);
        draw(boid);
    }
    requestAnimationFrame(updateScreen);
}

// Startup

for (let i = 0; i < document.getElementById("slider_B").value; i++) {
    flock.push(new Boid(randomInt(10, canvas.width-10), randomInt(10, canvas.height-10)));
}

updateScreen();
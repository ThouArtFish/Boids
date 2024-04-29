const canvas = document.getElementById("display");
const ctx = canvas.getContext("2d");
ctx.fillStyle = "white";
ctx.strokeStyle = "white";
ctx.lineWidth = 3;
const top_pad = 5;
const side_pad = 5;
const group_radius = 70;
const group_radius_sq = group_radius ** 2;
const boidDiameter = 4;
const boidDirIndicator = 15;
const rule_factor = 0.5;
const border_factor = 0.05;
var flock = [];

var speed;
var alignment;
var cohesion;
var separation;

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
    scalar(val) {
        return new Vec2(this.x * val, this.y * val);
    }
    lengthSq() {
        return (this.x ** 2) + (this.y ** 2);
    }
    length() {
        return Math.sqrt(this.lengthSq());
    }
    scale(x) {
        return this.scalar(x/this.length());
    }
    static sum(vec_arr) {
        let total = new Vec2();
        for (let i = 0; i < vec_arr.length; i++) {
            total = total.add(vec_arr[i]);
        }
        return total;
    }
}
const canvas_center = new Vec2(canvas.width/2, canvas.height/2);
const canvas_radius = canvas.height/2;

// Class for creating and updating boids
class Boid {
    constructor(x, y) {
        this.pos = new Vec2(x, y);
        this.vel = new Vec2(Math.random(), Math.random()).scale(speed);
        this.vel.x = Math.random() > 0.5? this.vel.x: this.vel.x * -1;
        this.vel.y = Math.random() > 0.5? this.vel.y: this.vel.y * -1;
        this.in_pad = false;
    }
    findGroup(flock) {
        let l = []
        for (let x in flock) {
            let boid = flock[x];
            let in_range = boid.pos.subtract(this.pos).lengthSq() <= group_radius_sq;
            if (in_range && boid != this && !boid.in_pad) {
                l.push(boid);
            }
        }
        return l;
    }
    inPadding() {
        let in_pad_side = this.pos.x <= side_pad || this.pos.x >= canvas.width - side_pad;
        let in_pad_top = this.pos.y <= top_pad || this.pos.y >= canvas.height - top_pad;
        if (in_pad_side || in_pad_top) {
            return true;
        } else {
            return false;
        }
    }
    update(flock) {
        this.in_pad = this.inPadding();
        let group = this.findGroup(flock);
        let total_vecs = [this.vel];
        if (group.length != 0 && !this.in_pad) {
            let rule_scale = speed * rule_factor
            let group_heading = Vec2.sum(group.map((b) => b.vel));
            let group_center = Vec2.sum(group.map((b) => b.pos)).scalar(1/group.length);
            let normal_dist_group = Math.min(group_center.subtract(this.pos).length()/group_radius, 1);
            let dir_to_group_center = group_center.subtract(this.pos);

            let rule_vecs = [
                group_heading.scale(rule_scale * alignment * normal_dist_group),
                dir_to_group_center.scale(rule_scale * cohesion * normal_dist_group),
                dir_to_group_center.scale(-(rule_scale * separation * (1 - normal_dist_group)))
            ];
            total_vecs.push(...rule_vecs);
        }
        let dir_to_canvas_center = canvas_center.subtract(this.pos);
        let normal_dist_center = dir_to_canvas_center.length()/canvas_radius;
        total_vecs.push(dir_to_canvas_center.scale(speed * normal_dist_center * border_factor));

        this.vel = Vec2.sum(total_vecs).scale(speed);
        this.pos = this.pos.add(this.vel);
    }
}

// Util
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
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
            case "slider_B":
                for (let i = 0; i < Math.abs(elem.value - flock.length); i++) {
                    if (elem.value > flock.length) {
                        flock.push(new Boid(randomInt(side_pad+3, canvas.width-side_pad-3), randomInt(top_pad+3, canvas.height-top_pad-3)));
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

document.getElementById("slider_C").value = 5;
document.getElementById("slider_A").value = 5;
document.getElementById("slider_S").value = 5;
document.getElementById("slider_B").value = 50;
document.getElementById("slider_V").value = 20;
updateVar()
for (let i = 0; i < document.getElementById("slider_B").value; i++) {
    flock.push(new Boid(randomInt(side_pad+3, canvas.width-side_pad-3), randomInt(top_pad+3, canvas.height-top_pad-3)));
}

updateScreen();
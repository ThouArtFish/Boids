const canvas = document.getElementById("display");
const ctx = canvas.getContext("2d");
ctx.fillStyle = "white";
ctx.strokeStyle = "white";
ctx.lineWidth = 3;
const group_radius = 40;
const group_radius_sq = group_radius ** 2;
const boidDiameter = 4;
const danger_radius_sq = (boidDiameter + 4) ** 2
const boidDirIndicator = 15;
const alignLeniency = 1;
const rule_factor = 0.4;
const border_factor = 0.05;
const collision_factor = 0.05;
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
        return Math.sqrt((this.x ** 2) + (this.y ** 2));
    }
    scale(x) {
        return this.scalar(x/this.length());
    }
    static sum(vec_arr) {
        let total = new Vec2();
        for (let vec of vec_arr) {
            total = total.add(vec);
        }
        return total;
    }
}
const canvas_center = new Vec2(canvas.width/2, canvas.height/2);
const canvas_radius = canvas_center.length() + 10;

// Class for creating and updating boids
class Boid {
    constructor(x, y) {
        this.pos = new Vec2(x, y);
        this.vel = new Vec2(Math.random(), Math.random()).scale(speed);
        this.vel.x = Math.random() > 0.5? this.vel.x: this.vel.x * -1;
        this.vel.y = Math.random() > 0.5? this.vel.y: this.vel.y * -1;
    }
    formGroups(flock) {
        let safe_group = [];
        let danger_group = [];
        for (let boid of flock) {
            let dist_vec = this.pos.subtract(boid.pos);
            let dist_sq = dist_vec.lengthSq();
            if (dist_sq <= group_radius_sq && boid !== this) {
                safe_group.push(boid);
            }
            if (dist_sq <= danger_radius_sq && boid !== this) {
                danger_group.push(dist_vec.scale(speed * collision_factor));
            }
        }
        return {safe: safe_group, danger: danger_group};
    }
    update(flock) {
        let groups = this.formGroups(flock);
        let safe_group = groups.safe;
        let danger_group = groups.danger;
        let total_vecs = [this.vel];
        total_vecs.push(...danger_group);
        if (safe_group.length != 0) {
            let group_heading = Vec2.sum(safe_group.map((b) => b.vel)).scale(speed);
            let group_center = Vec2.sum(safe_group.map((b) => b.pos)).scalar(1/safe_group.length);
            let normal_dist_group = Math.min(group_center.subtract(this.pos).length()/group_radius, 1);
            let dir_to_group_center = group_center.subtract(this.pos).scale(speed);

            let align_check = this.vel.subtract(group_heading).length() >= alignLeniency;
            let rule_vecs = [
                align_check? group_heading.scalar(rule_factor * alignment * normal_dist_group): new Vec2(),
                dir_to_group_center.scalar(rule_factor * cohesion * normal_dist_group),
                dir_to_group_center.scalar(-rule_factor * separation * (1 - normal_dist_group))
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
    for (let elem of sliders) {
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
                        flock.push(new Boid(randomInt(5, canvas.width-5), randomInt(5, canvas.height-5)));
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
    flock.push(new Boid(randomInt(5, canvas.width-5), randomInt(5, canvas.height-5)));
}

updateScreen();
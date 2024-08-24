import Vec2 from "./Vec2.js";

// Class for updating boids
export default class Flock {
    constructor(...args) {
        const [{count, width, height, gr = 50, bd = 4, al = 1, rf = 0.6, bf = 0.05, 
            v = 20, a = 0.5, c = 0.5, s = 0.5}] = args;
        this.group_radius = gr;
        this.group_radius_sq = this.group_radius ** 2;
        this.boid_diameter = bd;
        this.danger_radius_sq = (this.boid_diameter + 4) ** 2;
        this.align_leniency = al;
        this.rule_factor = rf;
        this.border_factor = bf;
        this.canvas_center = new Vec2(width/2, height/2);
        this.canvas_radius = this.canvas_center.length() + 10;
        this.speed = v;
        this.alignment = a;
        this.cohesion = c;
        this.separation = s;

        this.flock = [];
        for (let i = 0; i < count; i++) {
            this.flock.push(this.createBoid(this.randomInt(5, width-5), this.randomInt(5, height-5)));
        }
    }

    // Creates a boid
    createBoid(x, y) {
        let boid = {
            pos: new Vec2(x, y),
            vel: new Vec2(Math.random(), Math.random())
        };
        boid.vel.scale(this.speed);
        boid.vel.x = Math.random() > 0.5? boid.vel.x *= -1: boid.vel.x;
        boid.vel.y = Math.random() > 0.5? boid.vel.y *= -1: boid.vel.y;
        return boid;
    }

    // For each boid in the flock, creates a list of boids which are close enough to be neighbours or "frens"
    formGroups() {
        let frens = [];
        for (let i = 0; i < this.flock.length; i++) {
            frens.push([]);
        }
        for (let i = 0; i < this.flock.length - 1; i++) {
            let boid = this.flock[i];
            let frens_small = frens[i];
            for (let n = i + 1; n < this.flock.length; n++) {
                let other_boid = this.flock[n];
                let vec = boid.pos.subtract(other_boid.pos).lengthSq()
                if (vec <= this.group_radius_sq) {
                    frens_small.push(other_boid);
                    frens[n].push(boid);
                }
            }
        }
        return frens;
    }

    // Updates each boid in the flock depending on its "frens"
    updateBoids(deltaTime) {
        let total_frens = this.formGroups()
        for (let i = 0; i < this.flock.length; i++) {
            let boid = this.flock[i];
            let frens = total_frens[i];
            let total_vecs = [boid.vel];
            if (frens.length != 0) {
                let group_heading = Vec2.sum(frens.map((b) => b.vel)).scale(this.speed);
                let group_center = Vec2.sum(frens.map((b) => b.pos)).scalar(1/frens.length);
                let normal_dist_group = Math.min(group_center.subtract(boid.pos).length()/this.group_radius, 1);
                let dir_to_group_center = group_center.subtract(boid.pos).scale(this.speed);
    
                let align_check = boid.vel.subtract(group_heading).length() >= this.align_leniency;
                let rule_vecs = [
                    align_check? group_heading.scalar(this.rule_factor * this.alignment * normal_dist_group): new Vec2(),
                    dir_to_group_center.scalar(this.rule_factor * this.cohesion * normal_dist_group),
                    dir_to_group_center.scalar(-this.rule_factor * this.separation * (1 - normal_dist_group))
                ];
                total_vecs.push(...rule_vecs);
            }
            let dir_to_canvas_center = this.canvas_center.subtract(boid.pos);
            let normal_dist_center = dir_to_canvas_center.length()/this.canvas_radius;
            total_vecs.push(dir_to_canvas_center.scale(this.speed * normal_dist_center * this.border_factor));

            boid.vel = Vec2.sum(total_vecs).scale(this.speed);
            boid.pos = boid.pos.add(boid.vel.scalar(deltaTime || 1));
        }
    }

    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

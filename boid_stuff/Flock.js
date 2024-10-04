import Vec2 from "./Vec2.js";

// Class for updating boids
export default class Flock {
    constructor(...args) {
        const [{count, width, height, gr = 50, bd = 4, al = 2, rf = 0.6, bf = 0.05, df = 1, dr = 70, af = 1, ar = 70,
            v = 5, a = 0.5, c = 0.5, s = 0.5}] = args;
        // Group radius where boid would be influenced by any neighbours + squared value for quicker calcs
        this.group_radius = gr;
        this.group_radius_sq = this.group_radius ** 2;
        // The size of boid on screen
        this.boid_diameter = bd;
        // Determines when alignment vector should be ignored
        this.align_leniency = al;
        // Range and factor of objects that would deflect boids
        this.deflector_factor = df;
        this.deflector_range = dr;
        // Range and factor of objects that would attract boids
        this.attractor_factor = af;
        this.attractor_range = ar;
        // Canvas center and radius to determine boid distance to center and border factor to adjust vector
        this.canvas_center = new Vec2(width/2, height/2);
        this.canvas_radius = this.canvas_center.length();
        this.border_factor = bf;
        // The big three + speed
        this.speed = v;
        this.alignment = a;
        this.cohesion = c;
        this.separation = s;
        // For adjusting rule vectors
        this.rule_factor = rf;
        
        this.flock = [];
        for (let i = 0; i < count; i++) {
            this.flock.push(this.createBoid(Vec2.randomInt(5, width-5), Vec2.randomInt(5, height-5)));
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

    // Updates each boid in the flock depending on its frens
    updateBoid(...args) {
        const [{deltaTime, i, frens, def = [], att = []}] = args;
        let boid = this.flock[i];
        // Array of all the vectors involved in the next movement
        let total_vecs = [boid.vel];
        if (frens.length > 0) {
            // the general heading of a boid's frens
            let group_heading = Vec2.sum(frens.map((b) => b.vel)).scale(this.speed);
            // the general center of a boid's frens
            let group_center = Vec2.sum(frens.map((b) => b.pos)).scalar(1/frens.length);
            // normalized distance a boid is to the center of it's frens
            let normal_dist_group = Math.min(group_center.subtract(boid.pos).length()/this.group_radius, 1);
            // direction towards group center
            let dir_to_group_center = group_center.subtract(boid.pos).scale(this.speed);

            // the big three
            let rule_vecs = [
                group_heading.scalar(this.rule_factor * this.alignment * normal_dist_group),
                dir_to_group_center.scalar(this.rule_factor * this.cohesion * normal_dist_group),
                dir_to_group_center.scalar(-this.rule_factor * this.separation * (1 - normal_dist_group))
            ];
            total_vecs.push(...rule_vecs);
        }
        // calculates deflector vectors if their are any deflectors
        if (def.length > 0) {
            for (let n in def) {
                let deflector_to_boid = boid.pos.subtract(def[n]);
                let normal_dist = deflector_to_boid.length()/this.deflector_range;
                if (normal_dist < 1) {
                    total_vecs.push(deflector_to_boid.scale(this.speed * (1 - normal_dist) * this.deflector_factor));
                }
            }
        }
        // calculates attractor vectors if their are any attractors
        if (att.length > 0) {
            for (let n in att) {
                let attractor_to_boid = boid.pos.subtract(att[n]);
                let normal_dist = attractor_to_boid.length()/this.attractor_range;
                if (normal_dist < 1) {
                    total_vecs.push(attractor_to_boid.scale(this.speed * normal_dist * this.attractor_factor));
                }
            }
        }
        // applies border vector that stops boid wandering off
        let boid_to_canvas_center = this.canvas_center.subtract(boid.pos);
        let normal_dist = boid_to_canvas_center.length()/this.canvas_radius;
        total_vecs.push(boid_to_canvas_center.scale(this.speed * normal_dist * this.border_factor));
        
        
        boid.vel = Vec2.sum(total_vecs).scale(this.speed);
        boid.pos = boid.pos.add(boid.vel.scalar(deltaTime));
    }
}

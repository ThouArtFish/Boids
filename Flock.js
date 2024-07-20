import Boid from "./Boid.js"
import Vec2 from "./Vec2.js"

// Class for updating boids
export default class Flock {
    constructor(count, width, height, gr = 40, bd = 4, al = 1, rf = 0.6, bf = 0.05, cf = 0.05, 
        v = 2, a = 0.5, c = 0.5, s = 0.5
    ) {
        this.group_radius = gr;
        this.group_radius_sq = this.group_radius ** 2;
        this.boid_diameter = bd;
        this.danger_radius_sq = (this.boid_diameter + 4) ** 2;
        this.align_leniency = al;
        this.rule_factor = rf;
        this.border_factor = bf;
        this.collision_factor = cf;
        this.canvas_center = new Vec2(width/2, height/2);
        this.canvas_radius = this.canvas_center.length() + 10;
        this.speed = v
        this.alignment = a
        this.cohesion = c
        this.separation = s

        this.flock = [];
        for (let i = 0; i < count; i++) {
            this.flock.push(new Boid(this.randomInt(5, width-5), this.randomInt(5, height-5), this.speed));
        }
    }

    formGroups(i) {
        let boid = this.flock[i];
        let safe_group = [];
        let danger_group = [];
        for (let other_boid of this.flock) {
            let dist_vec = boid.pos.subtract(other_boid.pos);
            let dist_sq = dist_vec.lengthSq();
            if (dist_sq <= this.group_radius_sq && other_boid !== boid) {
                safe_group.push(other_boid);
            }
            if (dist_sq <= this.danger_radius_sq && other_boid !== boid) {
                danger_group.push(dist_vec.scale(this.speed * this.collision_factor));
            }
        }
        return [safe_group, danger_group];
    }

    updateBoid(i) {
        let boid = this.flock[i];
        let [safe_group, danger_group] = this.formGroups(i);
        let total_vecs = [boid.vel];
        total_vecs.push(...danger_group);
        if (safe_group.length != 0) {
            let group_heading = Vec2.sum(safe_group.map((b) => b.vel)).scale(this.speed);
            let group_center = Vec2.sum(safe_group.map((b) => b.pos)).scalar(1/safe_group.length);
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
        boid.pos = boid.pos.add(boid.vel);
    }

    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

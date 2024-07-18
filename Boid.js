import Vec2 from "./Vec2.js"

// Class for creating boids
export default class Boid {
    constructor(x, y, speed) {
        this.pos = new Vec2(x, y);
        this.vel = new Vec2(Math.random(), Math.random()).scale(speed);
        this.vel.x = Math.random() > 0.5? this.vel.x: this.vel.x * -1;
        this.vel.y = Math.random() > 0.5? this.vel.y: this.vel.y * -1;
    }
}

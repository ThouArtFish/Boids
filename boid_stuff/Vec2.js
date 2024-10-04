
// Class for managing vector calculations
export default class Vec2 {
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
        return this.scalar((x || 1)/this.length());
    }
    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    static sum(vec_arr) {
        let total = new Vec2();
        for (let vec of vec_arr) {
            total = total.add(vec);
        }
        return total;
    }
}

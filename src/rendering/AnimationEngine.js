// Animation engine for smooth transitions and effects

import { Easing } from '../utils/Math.js';

class Animation {
    constructor(target, property, from, to, duration, easing = 'linear') {
        this.target = target;
        this.property = property;
        this.from = from;
        this.to = to;
        this.duration = duration;
        this.elapsed = 0;
        this.easing = Easing[easing] || Easing.linear;
        this.complete = false;
        this.onComplete = null;
    }

    update(deltaTime) {
        if (this.complete) return;

        this.elapsed += deltaTime;

        if (this.elapsed >= this.duration) {
            this.elapsed = this.duration;
            this.complete = true;
        }

        const t = this.elapsed / this.duration;
        const easedT = this.easing(t);
        const value = this.from + (this.to - this.from) * easedT;

        this.target[this.property] = value;

        if (this.complete && this.onComplete) {
            this.onComplete();
        }
    }

    isComplete() {
        return this.complete;
    }
}

export class AnimationEngine {
    constructor() {
        this.animations = [];
    }

    update(deltaTime) {
        // Update all animations
        for (const animation of this.animations) {
            animation.update(deltaTime);
        }

        // Remove completed animations
        this.animations = this.animations.filter(a => !a.isComplete());
    }

    animate(target, property, from, to, duration, easing = 'linear') {
        const animation = new Animation(target, property, from, to, duration, easing);
        this.animations.push(animation);
        return animation;
    }

    animateScale(target, fromScale, toScale, duration, easing = 'easeOutCubic') {
        this.animate(target, 'scale', fromScale, toScale, duration, easing);
    }

    animateAlpha(target, fromAlpha, toAlpha, duration, easing = 'linear') {
        this.animate(target, 'alpha', fromAlpha, toAlpha, duration, easing);
    }

    pulse(target, property, min, max, duration) {
        const anim = this.animate(target, property, min, max, duration / 2, 'easeInOutQuad');
        anim.onComplete = () => {
            this.animate(target, property, max, min, duration / 2, 'easeInOutQuad');
        };
    }

    clear() {
        this.animations = [];
    }

    getAnimationCount() {
        return this.animations.length;
    }
}

export default AnimationEngine;

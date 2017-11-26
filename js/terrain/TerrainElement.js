"use strict";

/**
 * Helper object when placing objects.
 */
class TerrainElement {
    constructor(x,z,w,d) {
        this.x = x;
        this.z = z;
        this.width = w;
        this.depth = d;
    }

    /**
     * returns true if this element and the argument intersects/ are likely to intersect
     * @param element
     * @returns {boolean}
     */
    intersects(element) {
        let xdist = Math.abs(this.x - element.x);
        let zdist = Math.abs(this.z - element.z);

        return (xdist < (this.width + element.width) && zdist < (this.depth + element.depth));
    }

    intersectsAny(elements) {
        if(elements.length < 1) return false;
        for(var i = 0;i<elements.length;i++) {
            if (this.intersects(elements[i])) return true;
        }
        return false;
    }
}
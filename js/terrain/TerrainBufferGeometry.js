"use strict";

class TerrainBufferGeometry extends THREE.PlaneBufferGeometry {

    constructor({ heightmapImage, width = 100, levelsOfDetail = 4, numberOfSubdivisions = 16, height = 20 }) {

        let totalNumberOfSubdivisions = Math.pow(2, levelsOfDetail) * numberOfSubdivisions;

        // instantiate 
    	super(width, width, totalNumberOfSubdivisions, totalNumberOfSubdivisions);

        //this.type = "TerrainBufferGeometry";

        this.rotateX(-Math.PI / 2);

        this.levelsOfDetail = levelsOfDetail;
        this.numberOfSubdivisions = numberOfSubdivisions;
        this.totalNumberOfSubdivisions = totalNumberOfSubdivisions;

        this.width = width;
        this.height = height;

    	this.quadtree = new SubdivisionQuadtree({ x: 0, y: 0, width: this.width }, this.levelsOfDetail);

    	// initialize the terrain mesh:
    	this.init(heightmapImage);

    	// cache to avoid doing updates when the camera is not moving.
    	this._cache = {
    		x: 0,
    		z: 0,
    		radius: 0
    	};
    }

    init(image) {

    	// get heightmap data
    	this.heightmap = Utilities.getHeightmapData(image, this.totalNumberOfSubdivisions + 1);

    	// assign Y-values
    	let v = 0;
    	for (let i = 0; i < this.heightmap.length; i++) {
    		this.attributes.position.array[v + 1] = this.heightmap[i] * this.height;
    		v += 3;
    	}

    	// move such that the center is in the corner and not in origo.
    	//this.translate(this.width / 2, 0, this.width / 2);

    	// recompute normals.
    	this.computeVertexNormals();

    	// set indexbuffer to dynamic.
    	this.index.setDynamic(true);
    }

    /**
     * Rebuilds the index buffer with the level of detail defined by the nodes.
     * @param  {Quadtree} nodes Leaf nodes.
     */
    rebuild(nodes) {

    	let W = this.totalNumberOfSubdivisions + 1; // width in vertices.

    	let offset = 0; // offset in the index buffer where we want to write.

    	for (let i = 0; i < nodes.length; i++) {

    		let node = nodes[i];
            let neighbours = node.findNeighbours();

            // delta, true if the neighbouring node is on a different lod.
            let delta = [false, false, false, false];

            // get the level difference.
            delta[0] = (neighbours[0] !== null && neighbours[0].level < node.level); // bottom
            delta[1] = (neighbours[1] !== null && neighbours[1].level < node.level); // top
            delta[2] = (neighbours[2] !== null && neighbours[2].level < node.level); // left
            delta[3] = (neighbours[3] !== null && neighbours[3].level < node.level); // right
            

    		let factor = this.totalNumberOfSubdivisions / this.width;

    		let x = Math.round(node.x * factor);
    		let y = Math.round(node.y * factor);
    		let w = Math.round(node.width * factor) - 1;

    		let increment = Math.round(w / this.numberOfSubdivisions);

            // if all neighbours are on same level:
            if (delta[0] === false && delta[1] === false && delta[2] === false && delta[3] === false) { // (we can add an or-clause to enable seams for demonstration purposes)
                for (let j = y; j <= y + w; j += increment) {
                    for (let i = x; i <= x + w; i += increment) {
                        let a = (j * W) + i;
                        let b = (j * W) + (i + increment);
                        let c = ((j + increment) * W) + i;
                        let d = ((j + increment) * W) + (i + increment);

                        // add the vertices.
                        this.index.array[offset + 0] = a;
                        this.index.array[offset + 1] = c;
                        this.index.array[offset + 2] = b;
                        this.index.array[offset + 3] = b;
                        this.index.array[offset + 4] = c;
                        this.index.array[offset + 5] = d;

                        offset += 6;
                    }
                }
            } else {
                // add indices for the non special cases. (middle)
                for (let j = y + increment; j <= (y + w) - increment; j += increment) {
                    for (let i = x + increment; i <= (x + w) - increment; i += increment) {
                        let a = (j * W) + i;
                        let b = (j * W) + (i + increment);
                        let c = ((j + increment) * W) + i;
                        let d = ((j + increment) * W) + (i + increment);

                        // add the vertices.
                        this.index.array[offset + 0] = a;
                        this.index.array[offset + 1] = c;
                        this.index.array[offset + 2] = b;
                        this.index.array[offset + 3] = b;
                        this.index.array[offset + 4] = c;
                        this.index.array[offset + 5] = d;

                        offset += 6;
                    }
                }

                // to get the extreme of a coordinate.
                let maxed = (increment * (this.numberOfSubdivisions - 1));

                // bottom-strip
                for (let i = x, j = y; i <= x + w; i += increment + increment) {

                    let a = (j * W) + i;
                    let b = (j * W) + (i + increment);
                    let c = (j * W) + (i + increment + increment);
                    let d = ((j + increment) * W) + i;
                    let e = ((j + increment) * W) + (i + increment);
                    let f = ((j + increment) * W) + (i + increment + increment);

                    if (i !== x) {
                        this.index.array[offset + 0] = a;
                        this.index.array[offset + 1] = d;
                        this.index.array[offset + 2] = e;
                        offset += 3;
                    }

                    if (delta[0]) {
                        this.index.array[offset + 0] = a;
                        this.index.array[offset + 1] = e;
                        this.index.array[offset + 2] = c;
                        offset += 3;
                    } else {
                        this.index.array[offset + 0] = a;
                        this.index.array[offset + 1] = e;
                        this.index.array[offset + 2] = b;
                        this.index.array[offset + 3] = b;
                        this.index.array[offset + 4] = e;
                        this.index.array[offset + 5] = c;
                        offset += 6;
                    }

                    if (i !== x + maxed - increment) {
                        this.index.array[offset + 0] = c;
                        this.index.array[offset + 1] = e;
                        this.index.array[offset + 2] = f;
                        offset += 3;
                    }
                }

                // top-strip
                for (let i = x, j = y + maxed; i <= x + w; i += increment + increment) {

                    let a = (j * W) + i;
                    let b = (j * W) + (i + increment);
                    let c = (j * W) + (i + increment + increment);
                    let d = ((j + increment) * W) + i;
                    let e = ((j + increment) * W) + (i + increment);
                    let f = ((j + increment) * W) + (i + increment + increment);

                    if (i !== x) {
                        this.index.array[offset + 0] = a;
                        this.index.array[offset + 1] = d;
                        this.index.array[offset + 2] = b;
                        offset += 3;
                    }

                    if (delta[1]) {
                        this.index.array[offset + 0] = b;
                        this.index.array[offset + 1] = d;
                        this.index.array[offset + 2] = f;
                        offset += 3;
                    } else {
                        this.index.array[offset + 0] = b;
                        this.index.array[offset + 1] = d;
                        this.index.array[offset + 2] = e;
                        this.index.array[offset + 3] = b;
                        this.index.array[offset + 4] = e;
                        this.index.array[offset + 5] = f;
                        offset += 6;
                    }

                    if (i !== x + maxed - increment) {
                        this.index.array[offset + 0] = c;
                        this.index.array[offset + 1] = b;
                        this.index.array[offset + 2] = f;
                        offset += 3;
                    }
                }

                // left-strip
                for (let j = y, i = x; j <= y + w; j += increment + increment) {

                    let a = (j * W) + i;
                    let b = (j * W) + (i + increment);

                    let c = ((j + increment) * W) + i;
                    let d = ((j + increment) * W) + (i + increment);

                    let e = ((j + increment + increment) * W) + i;
                    let f = ((j + increment + increment) * W) + (i + increment);

                    if (j !== y) {
                        this.index.array[offset + 0] = a;
                        this.index.array[offset + 1] = d;
                        this.index.array[offset + 2] = b;
                        offset += 3;
                    }

                    if (delta[2]) {
                        this.index.array[offset + 0] = a;
                        this.index.array[offset + 1] = e;
                        this.index.array[offset + 2] = d;
                        offset += 3;
                    } else {
                        this.index.array[offset + 0] = a;
                        this.index.array[offset + 1] = c;
                        this.index.array[offset + 2] = d;
                        this.index.array[offset + 3] = c;
                        this.index.array[offset + 4] = e;
                        this.index.array[offset + 5] = d;
                        offset += 6;
                    }

                    if (j !== y + maxed - increment) {
                        this.index.array[offset + 0] = d;
                        this.index.array[offset + 1] = e;
                        this.index.array[offset + 2] = f;
                        offset += 3;
                    }
                }

                // right-strip
                for (let j = y, i = x + maxed; j <= y + w; j += increment + increment) {

                    let a = (j * W) + i;
                    let b = (j * W) + (i + increment);

                    let c = ((j + increment) * W) + i;
                    let d = ((j + increment) * W) + (i + increment);

                    let e = ((j + increment + increment) * W) + i;
                    let f = ((j + increment + increment) * W) + (i + increment);

                    if (j !== y) {
                        this.index.array[offset + 0] = a;
                        this.index.array[offset + 1] = c;
                        this.index.array[offset + 2] = b;
                        offset += 3;
                    }

                    if (delta[3]) {
                        this.index.array[offset + 0] = b;
                        this.index.array[offset + 1] = c;
                        this.index.array[offset + 2] = f;
                        offset += 3;
                    } else {
                        this.index.array[offset + 0] = b;
                        this.index.array[offset + 1] = c;
                        this.index.array[offset + 2] = d;
                        this.index.array[offset + 3] = c;
                        this.index.array[offset + 4] = f;
                        this.index.array[offset + 5] = d;
                        offset += 6;
                    }

                    if (j !== y + maxed - increment) {
                        this.index.array[offset + 0] = c;
                        this.index.array[offset + 1] = e;
                        this.index.array[offset + 2] = f;
                        offset += 3;
                    }
                }
            }
    	}

    	this.setDrawRange(0, offset); // draw only the defined vertices.
    	this.index.updateRange.count = offset; // avoid uploading unneccessary data to the GPU.
		this.index.needsUpdate = true; // make sure the indices are uploaded.
    }

    /**
     * Update terrain, with LOD based on given position.
     * @param  {{x, y}} position
     */
    update(x, z, radius = 25) {
    	if (x === this._cache.x && z === this._cache.z && radius === this._cache.radius) {
    		return;
    	}
    	
    	this.quadtree.update({ x: x + (this.width / 2), y: z + (this.width / 2), radius });
    	let nodes = this.quadtree.tree.getLeafNodes();

    	this.rebuild(nodes);

    	this._cache.x = x;
    	this._cache.z = z;
    	this._cache.radius = radius;
    }

    /**
     * [getHeightAt description]
     * @param  {[type]} position [description]
     * @return {[type]}          [description]
     */
    getHeightAt(position) {

        position.x += (this.width / 2);
        position.z += (this.width / 2);

        if (0 > position.x || position.x > this.width || 0 > position.z || position.z > this.width) {
            return 0;
        }

        let v = this.totalNumberOfSubdivisions;

        let factor = v / this.width;

        let x_max = Math.ceil(position.x * factor);
        let x_min = Math.floor(position.x * factor);

        let z_max = Math.ceil(position.z * factor);
        let z_min = Math.floor(position.z * factor);

        let h0 = this.heightmap[(z_max * (v + 1)) + x_max] * this.height;
        let h1 = this.heightmap[(z_max * (v + 1)) + x_min] * this.height;
        let h2 = this.heightmap[(z_min * (v + 1)) + x_max] * this.height;
        let h3 = this.heightmap[(z_min * (v + 1)) + x_min] * this.height;

        return Math.min(h0, h1, h2, h3);
    }
}
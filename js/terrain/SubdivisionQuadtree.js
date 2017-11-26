"use strict";

class SubdivisionQuadtree {

	/**
	 * Checks for intersection.
	 * @param  {x, y, radius} circle
	 * @param  {x, y, width} square
	 * @return {boolean}
	 */
	static intersects(circle, square) {
		let deltaX = circle.x - Math.max(square.x, Math.min(circle.x, square.x + square.width));
		let deltaY = circle.y - Math.max(square.y, Math.min(circle.y, square.y + square.width));

		return (deltaX * deltaX + deltaY * deltaY) < (circle.radius * circle.radius);
	}

	static intersectsPoint(point, square) {
		return ((square.x <= point.x) && (point.x <= (square.x + square.width))) &&
			   ((square.y <= point.y) && (point.y <= (square.y + square.width)));
	}

	static getNode(node, point) {
		if (this.intersectsPoint(point, node)) {
			if (node.children === null) {
				return node;
			} else {
				
				let n1 = this.getNode(node.children[0], point);
				if (n1 !== null) {
					return n1;
				}

				let n2 = this.getNode(node.children[1], point);
				if (n2 !== null) {
					return n2;
				}

				let n3 = this.getNode(node.children[2], point);
				if (n3 !== null) {
					return n3;
				}

				let n4 = this.getNode(node.children[3], point);
				if (n4 !== null) {
					return n4;
				}

				// if we ever end up here, something must be wrong with the quadtree.
				throw Error("Point was not in any of the childnodes. Something must be wrong with the quadtree.");
			}
		} else {
			return null;
		}
	}

	static subdivide(node, boundingCircle, levels) {
		// TODO: To reduce memory use, we could also cache the children when we remove them. This would allow us to reuse them.
		// If we dont do this, we're most likely going to have to create a lot of new nodes as a result of reconstraining the tree.

		if (levels > 0 && this.intersects(boundingCircle, node)) {
			if (node.children === null) {
				node.split();
			}

			// subdivide children.
			this.subdivide(node.children[0], boundingCircle, levels - 1);
			this.subdivide(node.children[1], boundingCircle, levels - 1);
			this.subdivide(node.children[2], boundingCircle, levels - 1);
			this.subdivide(node.children[3], boundingCircle, levels - 1);
			
		} else {
			// remove any children the node may have.
			node.children = null;
		}
	}

	/**
	 * Constrains leaf nodes.
	 * @param  {Quadtree-node} node
	 * @return {boolean} Returns true if a change was made.
	 */
	static _constrain(node) {
		if (node.children === null) {

			let splitted = false;
			let neighbours = node.findNeighbours();

			for (let i = 0; i < 4; i++) {
				if (neighbours[i] !== null && node.level - neighbours[i].level > 1) {

					// the neighbour and the node differ by more than one level, we need to split it.
					
					// TODO: we can make this slightly more efficient by splitting it several times depending on the difference.
					// This is slightly tricky because we dont want to split it uniformly,
					// but instead in a way that just fulfills the constraint.
					
					neighbours[i].split();
					splitted = true;
				}
			}

			// reconstrain node.
			//if (splitted) {
			//	this._constrain(node);
			//}

			return splitted;
		} else {
			return this._constrain(node.children[0]) ||
				   this._constrain(node.children[1]) ||
				   this._constrain(node.children[2]) ||
				   this._constrain(node.children[3]);
		}
	}

	static constrain(tree) {
		while (this._constrain(tree));
	}

	constructor(bounds, levelsOfDetail) {
		this.tree = new Quadtree(bounds); // root node.
		this.levelsOfDetail = levelsOfDetail;

		this.previousNode = null;
	}

	update(boundingCircle) {

		// TODO: check if the bounding results in the same node as the previous update.
		// If that is the case we dont have to do anything.
		
		// let node = this.constructor.getNode(this.tree, boundingCircle);
		// console.log(node);

		// if (node === this.previousNode) {
		// 	return;
		// }

		// Else recursively update the tree, by removing nodes that have gone out of scope, and subdividing where new ones are required.
		// Alternatively to save memory we could build the whole tree, and run the constraint only on the returned nodes, but this can be tricky.

		this.constructor.subdivide(this.tree, boundingCircle, this.levelsOfDetail); // re-subdivides the tree.
		this.constructor.constrain(this.tree);
	}
}
"use strict";

/**
 * Quadtree
 */

class Quadtree {
	constructor({ x, y, width, index = null, parent = null, level = 0 }) {

		this.index = index;

		// bounds:
		this.x = x;
		this.y = y;
		this.width = width;

		// structure:
		this.level = level;
		this.parent = parent;
		this.children = null;
	}

	/**
	 * Splits the node into four quadrants.
	 */
	split() {

		if (this.children !== null) {
			throw Error("The quadtree already has children. Unable to split.");
		}

		let width = this.width / 2;
		let x = this.x;
		let y = this.y;

		// bottom left
		let q1 = new Quadtree({
			x: x,
			y: y,
			width,
			index: 0b00,
			parent: this,
			level: this.level + 1
		});

		// bottom right
		let q2 = new Quadtree({
			x: x + width,
			y: y,
			width,
			index: 0b01,
			parent: this,
			level: this.level + 1
		});

		// top left
		let q3 = new Quadtree({
			x: x,
			y: y + width,
			width,
			index: 0b10,
			parent: this,
			level: this.level + 1
		});

		// top right
		let q4 = new Quadtree({
			x: x + width,
			y: y + width,
			width,
			index: 0b11,
			parent: this,
			level: this.level + 1
		});

		// set as children.
		this.children = [q1, q2, q3, q4];
	}

	getLeafNodes() {
		if (this.children === null) {
			return [ this ];
		} else {
			let subNodes = [];

			let l0 = this.children[0].getLeafNodes();
			for (let j = 0; j < l0.length; j++) {
				subNodes.push(l0[j]);
			}

			let l1 = this.children[1].getLeafNodes();
			for (let j = 0; j < l1.length; j++) {
				subNodes.push(l1[j]);
			}

			let l2 = this.children[2].getLeafNodes();
			for (let j = 0; j < l2.length; j++) {
				subNodes.push(l2[j]);
			}

			let l3 = this.children[3].getLeafNodes();
			for (let j = 0; j < l3.length; j++) {
				subNodes.push(l3[j]);
			}
			
			return subNodes;
		}
	}

	// static findMultipleDeepNeighbours(node, index, mod) {

	// 	// gets the nodes in the specified index, with mod.
	// 	let nodes = [node.children[index]];
	// 	nodes.push(node.children[(index ^ mod)]);

	// 	return nodes.reduce((arr, node) => {
	// 		if (node.children === null) {
	// 			return arr.concat([node]);
	// 		} else {
	// 			return arr.concat(this.findMultipleDeepNeighbours(node, index, mod));
	// 		}
	// 	}, []);
	// }

	/**
	 * Finds neighbours by recursively going down the tree using the indices. The indices are mirrored around the mask.
	 * @param  {Quadtree} node
	 * @param  {Number} mask A binary number 10 or 01 telling us the direction we want to look for neighbours.
	 * @param  {Array} indices An array of indices leading up to the starting node.
	 * @return {Array} Returns an array of Quadtree nodes.
	 */
	static findDeepNeighbour(node, mask, indices) {
		if (indices.length === 0 || node.children === null) {
			return node;

			// We dont need deeper neighbours..
			
			// if (node.children === null) {
			// 	return [ node ]; // we cannot go deeper, return the node.
			// } else {
			// 	// the mask tells us the direction.
			// 	// get the opposite of the mask, so that we can get every child node in the given direction.
			// 	let mod = 0b01;
			// 	if (mask === 0b01) {
			// 		mod = mask << 1;
			// 	}

			// 	return this.findMultipleDeepNeighbours(node, node.index ^ mask, mod); // the node has children, get the neighbouring ones.
			// }
		} else {
			return this.findDeepNeighbour(node.children[(indices.pop() ^ mask)], mask, indices); // flip index in the specified direction (mask).
		}
	}

	static findNeighbours(node, neighbours = [null, null, null, null], indices = []) { // B, T, L, R
		// we've reached the root, there cannot exist more neighbours.
		if (node.parent === null) {
			return neighbours;
		}

		// all neighbours have been found.
		if (neighbours[0] !== null && neighbours[1] !== null && neighbours[2] !== null && neighbours[3] !== null) {
			return neighbours;
		}

		let verticalDirection = (node.index >> 1) ^ 1; // extract vertical bit, and flip it.
		let horizontalDirection = ((node.index | 0b10) ^ 1); // set vertical bit always on, and flip horizontal bit, add two to move to horizontal space.

		if (neighbours[verticalDirection] === null) {
			let verticalNeighbourIndex = node.index ^ 0b10; // flips the vertical index bit, ex: BR -> TR, TL -> BL.
			let topLevelNeighbour = node.parent.children[verticalNeighbourIndex]; // bitshifts the nodes index one to the right, to only get the vertical part. Then sets the appropriate sibling as neighbour.
			neighbours[verticalDirection] = this.findDeepNeighbour(topLevelNeighbour, 0b10, indices.concat([])); // enforce pass by value with concat
		}

		if (neighbours[horizontalDirection] === null) {
			let horizontalNeighbourIndex = node.index ^ 1; // flips the horizontal index, ex: BR -> BL, TL -> TR
			let topLevelNeighbour = node.parent.children[horizontalNeighbourIndex];// removes the vertical index parent, and adds 2, such that we only look at the horizontal part. Then adds the vertical sibling neighbour.
			neighbours[horizontalDirection] = this.findDeepNeighbour(topLevelNeighbour, 0b01, indices.concat([])); // enforce pass by value with concat
		}

		return this.findNeighbours(node.parent, neighbours, indices.concat([node.index]));
	}

	findNeighbours() {
		return this.constructor.findNeighbours(this);
	}
}
"use strict";

class TerrainElements {
    //TODO Cleanup
    constructor(objects,app) {
        this.elements = [];
        this.nodelist = [];
        this.app = app;

        this.initTerrainElements(objects);
    }

    placeElement(object, widthScale, depthScale, heightScale, maxh, minh) {

        let bbox = new THREE.Box3().setFromObject(object);
        let width = Math.abs(bbox.min.x - bbox.max.x);
        let depth = Math.abs(bbox.min.z - bbox.max.z);
        let height = Math.abs(bbox.min.y - bbox.max.y);

        object.scale.set(widthScale,heightScale,depthScale);
        
        let pos = this.app.terrain.worldToLocal(object.position.clone());

        let y = this.app.terrain.geometry.getHeightAt(pos) + ((height*heightScale)*0.25);
        object.position.y = y;

        let element = new TerrainElement(object.position.x, object.position.z, widthScale*width,depthScale*depth);

        if (element.intersectsAny(this.elements)) {
            return false;
        }

        if (y > maxh || y < minh) {
            return false;
        }

        this.nodelist.push(object)
        this.elements.push(element);

        return true;
    }

    initTerrainElements(objects) {
        for (let i = 0; i < objects.length; i++ ) {
            let definition = objects[i];

            let parameters = definition.parameters;
            let object = definition.object;

            let err = 0;
            for(let j = 0 ; j < parameters.numberOfObjects; j++) {

                let clone = object.clone();

                clone.position.x = (Math.random() * (this.app.terrain.geometry.width - 100) + 50)  - (this.app.terrain.geometry.width / 2);
                clone.position.z = (Math.random() * (this.app.terrain.geometry.width - 100) + 50)  - (this.app.terrain.geometry.width / 2);
                clone.position.y = 0;

                let size = (Math.random() * (parameters.maxScale - parameters.minScale)) + parameters.minScale;
                let success = this.placeElement(clone, size, size, size, parameters.upperPlacementBound, parameters.lowerPlacementBound);
            }
        }
    }
}
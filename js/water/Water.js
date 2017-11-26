//water normalMap
//https://www.google.no/url?sa=i&rct=j&q=&esrc=s&source=images&cd=&cad=rja&uact=8&ved=0ahUKEwidrevD68DXAhWrAJoKHUrcDgwQjRwIBw&url=https%3A%2F%2Fwww.filterforge.com%2Ffilters%2F4141-normal.html&psig=AOvVaw0ar-hcHXEhFiWNj4OmngXm&ust=1510844240737322
class Water {
    /*constructor(w,h,map) {

        this.normalMap = new THREE.TextureLoader().load("resources/waternormal.jpg");

        this.normalMap.wrapS = THREE.RepeatWrapping;
        this.normalMap.wrapT = THREE.RepeatWrapping;
        this.normalMap.repeat.set( 1, 1 );

        let geo =  new THREE.PlaneBufferGeometry(w,h,w,h);

        geo.rotateX(-Math.PI / 2);//keep the plane straight relative to the terrain

        let material = new THREE.MeshStandardMaterial({
            color: 0x71b1bd,
            envMap:map,
            envMapIntensity:1.2,
            roughness:0.1,
            metalness:0,
            normalMap: this.normalMap,
            displacementMap:this.normalMap,
            displacementScale:1.5,
            //normalMap: new THREE.Vector2( 1.5, 1.0 ),
            bumpScale:1.5,
            //reflectivity:0.7,
            refractionRatio:0.75,
            //opacity:0.
            });
        material.transparent = true;
        this.plane = new THREE.Mesh(geo,material);
    }*/
    constructor(w,h,map) {

        this.normalMap = new THREE.TextureLoader().load("resources/waternormal.jpg");

        this.normalMap.wrapS = THREE.RepeatWrapping;
        this.normalMap.wrapT = THREE.RepeatWrapping;
        this.normalMap.repeat.set( 1, 1 );

        let geo =  new THREE.PlaneBufferGeometry(w,h,w,h);

        geo.rotateX(-Math.PI / 2);//keep the plane straight relative to the terrain

        let material = new THREE.MeshLambertMaterial({
            color: 0x71b1bd,
            envMap:map.texture,
            //envMapIntensity:1.0,
            //roughness:0.1,
            //normalMap: this.normalMap,
            //displacementMap:this.normalMap,
            //displacementScale: 10,
            //normalMap: this.normalMap,
            //displacementMap:this.normalMap,
            //normalMap: new THREE.Vector2( 1.5, 1.0 ),
            //bumpScale:1.5,
            reflectivity:0.7,
            refractionRatio:1.0,
            opacity:0.5
        });
        material.transparent = true;
        this.plane = new THREE.Mesh(geo,material);
    }
    get object() {
        return this.plane;
    }
    update(delta){return;}
}
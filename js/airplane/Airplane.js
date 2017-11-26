class Airplane {
    constructor(obj,speed = 10, radius = 3000, height = 2500){//,p1,p2,p3,p4,speed = 10) {
        this.obj = obj;
        this.speed = speed;

        //define a circle for the plane to move in
        this.curve = new THREE.EllipseCurve(
            -1500,0,
            radius,radius
            );

        this.index = 0;
        this.roti = (Math.PI / 2);//rotation index, start at 90 degrees and rotate towards -90

        //this.startCurve.getPoint(0,this.obj.position);
        let newz = this.curve.getPoint(0).y;
        let newx = this.curve.getPoint(0).x;
        this.obj.position.setX(newx);
        this.obj.position.setZ(newz);
        this.obj.position.setY(height);
    }

    update(delta) {
        this.index += delta / this.speed;
        this.roti -= (delta /this.speed)*Math.PI*2;//limit rotation so that it takes this.speed amount of seconds to go 180 degrees

        this.index = this.index % 1;

        //get next point in curve
        let newz = this.curve.getPoint(this.index).y + 1500;
        let newx = this.curve.getPoint(this.index).x + 1500;
        this.obj.position.setX(newx);
        this.obj.position.setZ(newz);

        //set rotation of plane
        this.obj.rotation.set(0,this.roti,0);

    }
}
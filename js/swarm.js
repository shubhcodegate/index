const mycanvas = document.querySelector('canvas');
var VISCOSITY = 0.01

class Vector2D 
{
    constructor(x, y) {this.values = [x, y]}
    get x(){return this.values[0]}
    get y(){return this.values[1]}
    magnitude() {
        return Math.sqrt(this.values[0] * this.values[0] + this.values[1] * this.values[1]);
    }
    add(other) {
        return new Vector2D(this.values[0] + other.values[0], this.values[1] + other.values[1]);
    }
    sub(other) {
        return new Vector2D(this.values[0] - other.values[0], this.values[1] - other.values[1]);
    }
    eq(other) {
        return (this.values[0] === other.values[0] && this.values[1] === other.values[1])
    }
    lt(other) {
        return this.magnitude() < other.magnitude();
    }
    gt(other) {
        return this.magnitude() > other.magnitude();
    }
    le(other) {
        return this.magnitude() <= other.magnitude();
    }
    ge(other) {
        return this.magnitude() >= other.magnitude();
    }
    mul(other) {
        return new Vector2D(this.values[0] * other, this.values[1] * other);
    }
    div(other){
        return new Vector2D(this.values[0] / other, this.values[1] / other);
    }
    neg(){
        return new Vector2D(-this.values[0], -this.values[1]);
    }
    dotProd(other) {
        return (this.values[0] * other.values[0] + this.values[1] * other.values[1]);
    }
    relativeDist(other){
        return this.sub(other).magnitude();
    }
}
var particleCount = 0
class Particle
{
    /*
    This a Physics Particle which follows physics.
    @param position
    @param mass
    @param radius
    @param velocity default [0,0]
    @param accel default [0,0]
    */
    constructor(x,y,mass,radius,isbounded=false,velocity=[0,0],accel=[0,0])
    {
        particleCount+=1;
        this.objtype = "Particle";
        this.position = new Vector2D(x,y);
        this.velocity = new Vector2D(velocity[0],velocity[1]);
        this.accel = new Vector2D(accel[0],accel[1]);
        this.mass = mass;
        this.size = radius;
        this.boundaryflag = isbounded;
        this.box = [-Infinity,-Infinity,Infinity,Infinity];
        return this;
    }
    get xPos()
    {
        return this.position.x;
    }
    get yPos()
    {
        return this.position.y;
    }
    move()
    {
        this.velocity = this.velocity.add(this.accel);
        this.position = this.position.add(this.velocity);
        this.velocity = this.velocity.mul(1-VISCOSITY);
        
        if (this.boundaryflag) this.boundaryCondition();
        return this;
    }
    enableBoundary(box){
        // Boundary Toggle ult False
        //@param box [x_start,y_start,x_end,y_end]
        this.box = box;
        this.boundaryflag = ~this.boundaryflag;
        return this;
}
    boundaryCondition(){
        if (this.position.values[0]>= this.box[2]-this.size){
            this.velocity.values[0] = -this.velocity.values[0];
            this.position.values[0] = this.box[2]-this.size;
        }
        if (this.position.values[0]<=this.box[0] + this.size){
            this.velocity.values[0] = -this.velocity.values[0];
            this.position.values[0] =this.box[0] + this.size;
        }
        if (this.position.values[1]>=this.box[3]-this.size){
            this.velocity.values[1] = -this.velocity.values[1];
            this.position.values[1] =this.box[3]-this.size;
        }
        if (this.position.values[1]<=this.box[1] + this.size){
            this.velocity.values[1] = -this.velocity.values[1];
            this.position.values[1] =this.box[1] + this.size;
        }
    }
    applyForce(force){
        // Force to be applied on Particle
        //@param force = physics.Vector2D()
        // this.accel = this.accel.add(force.div(this.mass));
        this.accel = force.div(this.mass);
    }
        
}
class myParticle extends Particle
{
    constructor(x,y,mass,radius,color,isbounded=false,velocity=[0,0],accel=[0,0]){
        super(x,y,mass,radius,isbounded=false,velocity=[0,0],accel=[0,0]);
        this.color = color;
    }
    draw(){
        this.ctx = simulationArea.context;
        this.ctx.beginPath()
        this.ctx.arc(this.xPos, this.yPos, this.size, 0, 2 * Math.PI, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
        this.ctx.lineWidth = 5;
        this.ctx.strokeStyle = '#0000';
        this.ctx.stroke();
    }
}
function combination(list) {
    var results=[];
    for (var i = 0; i < list.length - 1; i++) {
        // This is where you'll capture that last value
        for (var j = i + 1; j < list.length; j++) {
          results.push([list[i],list[j]]);
        }
    }
    return results;
}
function perfectCollition(obj1,obj2,elastisity=0.3){
    /*
    This is a custom implimentation of physics collider 
    @param obj1 physics particle
    @param obj2 physics particle
    @param elastisity defaults to 1
    */
    if (obj1.position.eq(obj2.position)){
        let randPos = new Vector2D(Math.floor(Math.random()*10),Math.floor(Math.random()*10));
        obj1.position = obj2.position.add(randPos);
    }
    else if (obj1.position.sub(obj2.position).magnitude()<= obj1.size + obj2.size){
    // ------Collided---
        let x1_x2 = obj1.position.sub(obj2.position);
        let modx1_x2 = x1_x2.magnitude();
        let modx1_x2sq = Math.pow(modx1_x2,2);
        let v1_v2 = obj1.velocity.sub(obj2.velocity);
        let mass1 = (2*obj2.mass)/(obj1.mass+obj2.mass);
        let mass2 = (2*obj1.mass)/(obj1.mass+obj2.mass);
        let vdotsub = v1_v2.dotProd(x1_x2)/modx1_x2sq;

        let vdotsub1 = x1_x2.mul(vdotsub*mass1);
        let vdotsub2 = x1_x2.neg().mul(vdotsub*mass2);
        
        obj1.velocity = obj1.velocity.sub(vdotsub1);
        obj2.velocity = obj2.velocity.sub(vdotsub2);
        let temp = obj1.position;
        obj1.position = obj2.position.add((x1_x2.div(modx1_x2)).mul(obj1.size+obj2.size));
        obj2.position = temp.sub((x1_x2.div(modx1_x2)).mul(obj1.size+obj2.size));
    }
}
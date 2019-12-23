var Engine = Matter.Engine,
  Render = Matter.Render,
  World = Matter.World,
  Bodies = Matter.Bodies,
  Body = Matter.Body,
  colorScheme = ['#2c3531','#116466','#d9b08c','#ffcb9a','#d1e8e2'],
  IVORY = '#fffff0';
const mycanvas = document.querySelector('canvas');
var Vector = Matter.Vector
var VISCOSITY = 0.01
var particleCount = 0
var FORCE_MULTI = 0.0001
var exploreEvent = new Event('exploreEvent');
var a = 10,b = 0.05, c = -document.querySelector('canvas').clientWidth*2;
var mod = Math.sqrt(a*a+b*b);
function PicturFinder(pos1,pos2) {
    let i = Math.floor(pos1.y*simulationArea.width + pos1.x);
    let dist = pixelData[i*4]+pixelData[i*4+1]+pixelData[i*4+2]+pixelData[i*4+3];
    return dist*5;
}
  function lineFinder(pos1,pos2) {
    // a*x + b*y + c = 0
    
    return Math.abs(a*pos1.x + b*pos1.y + c)/mod;
}
var a2 = 10,b2 = 0.02, c2 = -document.querySelector('canvas').clientWidth*8;
var mod2 = Math.sqrt(a2*a2+b2*b2);
function lineFinder2(pos1,pos2) {
    // a*x + b*y + c = 0
    
    return Math.abs(a2*pos1.x + b2*pos1.y + c2)/mod2;
}
var r = 250, x0= document.querySelector('canvas').clientWidth/2, y0 = document.querySelector('canvas').clientHeight/2; var r2=r*r;
function circleFinder(pos1,pos2) {
    // x*x + y*y = r*r

    return Math.abs((pos1.x-x0)*(pos1.x-x0)+(pos1.y-y0)*(pos1.y-y0)-r2);
}
var count = 0;
function counterChanger(pos1,pos2) {
    count+=0.5;
    if(count<300000) {
        if(count==299999){
            document.querySelector('canvas').dispatchEvent(exploreEvent);
        }       
        return circleFinder(pos1,pos2);
    }
    else if(count<600000){
        if(count==599999){
            document.querySelector('canvas').dispatchEvent(exploreEvent);
        } 
            return lineFinder(pos1,pos2);
    }
    else if(count<900000) {
        if(count==899999){
            document.querySelector('canvas').dispatchEvent(exploreEvent);
        } 
        return lineFinder2(pos1,pos2);
    }
    else count =0;
}
class Particle
{
    /*
    *This a Physics Particle which follows physics.
    * @param {world}
    * @param {x}
    * @param {y}
    * @param {radius}
    */
    constructor(world,x,y,radius,options={
        restitution: 0,
        render: {
            fillStyle: colorScheme[1],
            strokeStyle: 'none',
            lineWidth: 1
        }
    })
    {
        particleCount+=1;
        this.body = Bodies.circle(x,y,radius,options);
        this.objtype = "Particle";
        this.force = Vector.create(0,0);
        this.size = radius;
        World.add(world, this.body);
        return this;
    }
    get x()
    {
        return this.body.position.x;
    }
    get y()
    {
        return this.body.position.y;
    }
    set x(value)
    {
        this.body.position.x = value;
    }
    set y(value)
    {
        this.body.position.y = value;
    }
    get position()
    {
        return this.body.position;
    }
    get mass()
    {
        return this.body.mass;
    }
    applyForce(position,force){
        if(force==undefined) throw "force cannot be undefined";
        else    Body.applyForce(this.body, position, force);
        this.force = Vector.create(0,0);
    }
    addForce(force)
    {
        this.force = Vector.add(this.force,force);
    }
    update()
    {
        if(this.force==undefined) throw "force cannot be undefined";
        else    Body.applyForce(this.body, this.position, this.force);
        this.force = Vector.create(0,0);
    }
}
class SwarmParticle extends Particle
{
    constructor(world,x,y,radius,swarm,options,w=0.8,c1=0.2,c2=0.4){
        super(world,x,y,radius,options);
        this.swarm = swarm;
        this.w = w;    //Self Momentum default was 0.8
        this.c1 = c1;    //Cognitive Parameter default was 0.1
        this.c2 = c2;     //Social Parameter default was 0.4
        this.pbest = {x:this.x,y:this.y};
    }
    avoidEnemy()
    {
        for (const hunter of this.swarm.hunters) {
            let relative = Vector.sub(this.position,hunter.position);
            let modRelative = Vector.magnitude(relative);
            this.addForce(Vector.mult(Vector.div(relative,modRelative),sigmoid(modRelative)*FORCE_MULTI*10));
        }
        return this;
    }
    update()
    {
        this.avoidEnemy();
        let cogPar = Vector.mult(Vector.sub(this.pbest,this.position),this.c1);
        let socPar = Vector.mult(Vector.sub(this.swarm.gbest,this.position),this.c2);
        let selfMo = Vector.mult(this.body.velocity,(this.w-1));
        var PSOForce = Vector.mult(Vector.add(cogPar,Vector.add(socPar,selfMo)),this.mass*FORCE_MULTI);
        this.addForce(PSOForce);
        
        // this.applyForce(Vector.create(this.x,this.y),PSOForce);

        super.update();
        if (counterChanger(this.pbest,this.swarm.target) > counterChanger(this.position,this.swarm.target)) this.pbest = {x:this.x,y:this.y};
        return this;
    }
    explore()
    {
        var randForce = Vector.create((Math.random()-0.5)*FORCE_MULTI*300,(Math.random()-0.5)*FORCE_MULTI*300);
        this.addForce(randForce) 
    }
          
}

class Swarm
{
    /*
    * This is a swarm of particles with a target 
    * @method constructor
    * @param {n} number of particles in this swarm
    * @param {target} to optimize the distance
    * @param {collection}  the particle list
    * @param {hunters} HunterParticle
    */
    constructor(n,target,collection=[],hunters = [])
    {
        this.objtype = "Swarm"
        this.n = n
        this.gbest = Vector.create(0,0);
        this.collection = collection;
        this.hunters = hunters;
        this.target = target;
    }
    
    addHunters(hunters)
    {
        this.hunters = hunters;
        return this;
    }

    addTarget(target)
    {
        this.target = target;
        return this;
    }
    addCollection(collection)
    {
        this.collection=collection;
        return this;
    }
    update()
    {
        for (var i of this.collection) {
            i.update();
            if (counterChanger(i.pbest,this.target) < counterChanger(this.gbest,this.target)) this.gbest = i.pbest;
    
        }
        return this;
    }   
    explore()
    {
        for (let i = 0; i < this.collection.length*0.1; i++) 
        {
            this.collection[Math.floor(Math.random()*this.collection.length)].explore(); 
            // this.collection[i].explore();
        }
        return this;
    }
    static createSwarm(world,n,target,options={
        // friction: 0.1,
        restitution: 0.6,
        density: 0.01,
        render: {
            fillStyle: colorScheme[0],
            strokeStyle: 'none',
            lineWidth: 1
        }
    })
    {
        var newSwarm = new Swarm(n,target);
        var collection = [];
        
        for (let i = 0; i < n; i++) {
            let randPos = [Math.random()*simulationArea.width,Math.random()*simulationArea.height];
            collection.push(new SwarmParticle(world,randPos[0],randPos[1],2,newSwarm,options));      
        }
        newSwarm.addCollection(collection);
        return newSwarm;
    }
           
}
class HunterParticle extends Particle
{
    constructor(world,x,y,radius,target,options={
        restitution: 0,
        friction: 0,
        density: 0.1,
        render: {
            fillStyle: colorScheme[3],
            strokeStyle: 'none',
            lineWidth: 1
        }
    })
    {
        super(world,x,y,radius,options);
        this.target = target
    }
        
    addTarget(target)
    {
        this.target = target;
        return this;
    }
    
    update()
    {
        let relative = Vector.sub(this.target,this.position);
        let modRelative = Vector.magnitude(relative);
        if(modRelative !== 0)
        {
            var Force = Vector.mult(Vector.div(relative,modRelative),attacksigmoid(modRelative)*this.mass*FORCE_MULTI*100);
        }
        this.addForce(Force);
        super.update();
        return this;
    }
       
}
class FollowerParticle extends Particle
{
    constructor(world,x,y,radius,target,options={
        restitution: 0,
        friction: 0,
        density: 0.1,
        render: {
            fillStyle: IVORY,
            strokeStyle: 'none',
            lineWidth: 1
        }
    })
    {
        super(world,x,y,radius,options);
        this.target = target;
        this.kp = 0.001;
        this.ki = 0.000001;
        this.kd = 0.05;
        this.error = Vector.create(0,0);
        this.errorsum = Vector.create(0,0);
        this.lasterror = Vector.create(0,0);
    }
        
    addTarget(target)
    {
        this.target = target
        return this;
    }
    update()
    {
        this.error = Vector.sub(this.target,this.position);
        // let error = Vector.magnitude(error);
        // let unitVector = Vector.div(error,error);
        this.errorsum = Vector.add(this.errorsum,this.error)

        var Force = Vector.add(Vector.mult(this.error,this.kp),Vector.mult(this.errorsum,this.ki)) 
        Force = Vector.add(Force,Vector.mult(Vector.sub(this.error,this.lasterror),this.kd));

        this.addForce(Force);

        super.update();
        this.lasterror = this.error;
        return this;
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

function sigmoid(x){ return 1 / (1 + Math.exp(0.2*x-8)); } 
function attacksigmoid(x){return 1 / (1 + Math.exp(-0.05*x+2));}  
function distanceOptimization(pos1,pos2) {
    return Vector.magnitude(Vector.sub(pos1,pos2));
}

function linearForce(x) {
    return 10;
}

function setupCanvas(canvas) {
    // Get the device pixel ratio, falling back to 1.
    var dpr = window.devicePixelRatio || 1;
    // Get the size of the canvas in CSS pixels.
    var rect = canvas.getBoundingClientRect();
    // Give the canvas pixel dimensions of their CSS
    // size * the device pixel ratio.
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    var ctx = canvas.getContext('2d');
    // Scale all drawing operations by the dpr, so you
    // don't have to worry about the difference.
    ctx.scale(dpr, dpr);
    return ctx;
  }

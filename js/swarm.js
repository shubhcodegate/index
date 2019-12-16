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
    constructor(world,x,y,radius,swarm,options,w=0.8,c1=0.04,c2=0.1){
        super(world,x,y,radius,options);
        this.swarm = swarm;
        this.w = w;    //Self Momentum default was 0.8
        this.c1 = c1;    //Social Parameter default was 0.4
        this.c2 = c2;     //Cognitive Parameter default was 0.1
        this.pbest = this.body.position;
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
        let cogPar = Vector.mult(Vector.sub(this.pbest,this.body.position),this.c1);
        let socPar = Vector.mult(Vector.sub(this.swarm.gbest,this.body.position),this.c2);
        let selfMo = Vector.mult(this.body.velocity,(this.w-1));
        var PSOForce = Vector.mult(Vector.add(cogPar,Vector.add(socPar,selfMo)),this.mass*FORCE_MULTI);
        this.addForce(PSOForce);
        if (distanceOptimization(this.pbest,this.swarm.target) > distanceOptimization(this.position,this.swarm.target)) this.pbest = this.position;
        // this.applyForce(Vector.create(this.x,this.y),PSOForce);

        super.update();
        return this;
    }
    explore()
    {
        randForce = Vector.create(Math.random()*10,Math.random()*10);
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
            if (distanceOptimization(i.pbest,this.target) < distanceOptimization(this.gbest,this.target)) this.gbest = i.pbest;
    
        }
        return this;
    }   
    explore()
    {
        for (let i = 0; i < 10; i++) 
        {
            this.collection[Math.floor(Math.random()*this.collection.length)].explore();     
        }
        return this;
    }
    static createSwarm(world,n,target,options={
        // friction: 0.1,
        restitution: 1,
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
            collection.push(new SwarmParticle(world,randPos[0],randPos[1],5,newSwarm,options));      
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
            var Force = Vector.mult(Vector.div(relative,modRelative),attacksigmoid(modRelative)*this.mass*FORCE_MULTI*500);
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

function sigmoid(x){ return 1 / (1 + Math.exp(0.2*x-10)); } 
function attacksigmoid(x){return 1 / (1 + Math.exp(-0.05*x+10));}  
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

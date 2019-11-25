var another,onemore;
var myscene=[],bodies = [];

// Launch the simulation
function launch() {
    simulationArea.init();
    simulationSetup(simulationArea);
}

function simulationSetup(simulationArea) {
    // another = new myParticle(100,100,50,10,"red");
    // another.enableBoundary([1,1,simulationArea.canvas.width-1,simulationArea.canvas.height-1]);
    // onemore = new myParticle(160,160,50,10,"red");
    // onemore.enableBoundary([1,1,simulationArea.canvas.width-1,simulationArea.canvas.height-1]);
    
    for (let i = 5; i < simulationArea.canvas.width; i+=5) {
        bodies.push(new myParticle(i,100,50,5,"red").enableBoundary([1,1,simulationArea.canvas.width-1,simulationArea.canvas.height-1]))
    }
    another = bodies[0];
    myscene = combination(bodies);
}

function update() {
    myscene.forEach(element => {
        perfectCollition(element[0],element[1]);
    });
    if (simulationArea.keys && simulationArea.keys[37]) {another.applyForce(new Vector2D(-1,0));}
    if (simulationArea.keys && simulationArea.keys[39]) {another.applyForce(new Vector2D(1,0)); }
    if (simulationArea.keys && simulationArea.keys[38]) {another.applyForce(new Vector2D(0,-1));}
    if (simulationArea.keys && simulationArea.keys[40]) {another.applyForce(new Vector2D(0,1));}   
    simulationArea.clear();
    bodies.forEach(element => {
        element.move().draw();
    });
}
var simulationArea = {
    canvas : document.querySelector('canvas'),
    init : function() {
        // this.context = this.canvas.getContext("2d");
        this.context = setupCanvas(this.canvas);
        this.interval = setInterval(update, 20);
        window.addEventListener('keydown', function (e) {
            simulationArea.keys = (simulationArea.keys || []);
            simulationArea.keys[e.keyCode] = (e.type == "keydown");
        });
        window.addEventListener('keyup', function (e) {
            simulationArea.keys[e.keyCode] = (e.type == "keydown");            
        });
        window.addEventListener("keydown", function(e) {
            // space and arrow keys
            if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
                e.preventDefault();
            }
        }, false);
    }, 
    clear : function(){
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.fillStyle = 'black';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
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
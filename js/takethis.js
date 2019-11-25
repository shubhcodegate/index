var another,onemore,myscene;

class myParticle extends Particle
{
    constructor(x,y,mass,radius,color,velocity=[0,0],accel=[0,0]){
        super(x,y,mass,radius,velocity=[0,0],accel=[0,0]);
        this.color = color;
    }
    draw(){
        this.ctx = myGameArea.context;
        this.ctx.beginPath()
        this.ctx.arc(this.xPos, this.yPos, this.size, 0, 2 * Math.PI, false);
        this.ctx.fillStyle = 'green';
        this.ctx.fill();
        this.ctx.lineWidth = 5;
        this.ctx.strokeStyle = '#0000';
        this.ctx.stroke();
    }
}
// Start the game
function startGame() {
    myGameArea.start();
    another = new myParticle(100,100,50,10,"red");
    another.enableBoundary([1,1,myGameArea.canvas.width-1,myGameArea.canvas.height-1]);
    onemore = new myParticle(160,160,50,10,"red");
    onemore.enableBoundary([1,1,myGameArea.canvas.width-1,myGameArea.canvas.height-1]);
    myscene = combination([another,onemore]);
}

var myGameArea = {
    canvas : document.querySelector('canvas'),
    start : function() {
        this.context = this.canvas.getContext("2d");
        this.interval = setInterval(updateGameArea, 20);
        window.addEventListener('keydown', function (e) {
            myGameArea.keys = (myGameArea.keys || []);
            myGameArea.keys[e.keyCode] = (e.type == "keydown");
        })
        window.addEventListener('keyup', function (e) {
            myGameArea.keys[e.keyCode] = (e.type == "keydown");            
        })
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

function updateGameArea() {
    myscene.forEach(element => {
        perfectCollition(element[0],element[1]);
    });
    if (myGameArea.keys && myGameArea.keys[37]) {another.applyForce(new Vector2D(-0.1,0));}
    if (myGameArea.keys && myGameArea.keys[39]) {another.applyForce(new Vector2D(0.1,0)); }
    if (myGameArea.keys && myGameArea.keys[38]) {another.applyForce(new Vector2D(0,-0.1));}
    if (myGameArea.keys && myGameArea.keys[40]) {another.applyForce(new Vector2D(0,0.1));}   
    another.move();
    onemore.move();
    myGameArea.clear();
    another.draw();
    onemore.draw()
}
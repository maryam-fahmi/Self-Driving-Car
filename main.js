const carCanvas=document.getElementById("carCanvas");
carCanvas.width=200;
const networkCanvas=document.getElementById("networkCanvas");
networkCanvas.width=300;

const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

const road=new Road(carCanvas.width/2,carCanvas.width*0.9);
N = 100;
const cars=generateCars(N);

//bestCar updates on every frame, must use a let 
let bestCar=cars[0];

//if best brain is found, you set that car to the bestCar value.
if(localStorage.getItem("bestBrain")) {
    bestCar.brain=JSON.parse(localStorage.getItem("bestBrain"));
}

const traffic=[
    new Car(road.getLaneCenter(1),-100,30,50,"DUMMY",2),
    new Car(road.getLaneCenter(0),-300,30,50,"DUMMY",2),
    new Car(road.getLaneCenter(2),-300,30,50,"DUMMY",2),
];

animate();

//create function to save car that reached highest point 
function save() {
    localStorage.setItem("bestBrain",
    JSON.stringify(bestCar.brain));
}

//discard saved best car after use 
function remove() {
    localStorage.removeItem("bestBrain");
}


//generate multiple cars that move in different ways to test out neural system 
function generateCars(N) {
    const cars=[];
    for (let i=1; i<=N; i++) {
        cars.push(new Car(road.getLaneCenter(1),100,30,50, "AI"));
    }
    return cars;
}

function animate(time){
    for(let i=0;i<traffic.length;i++){
        traffic[i].update(road.borders,[]);
    }
    for (let i=0; i<cars.length;i++) {
        cars[i].update(road.borders,traffic);
    }

    //create an array with only y vals to find the car that goes up the highest 
    bestCar=cars.find(
        c=>c.y==Math.min (...cars.map(c=>c.y))
    );

    carCanvas.height=window.innerHeight;
    networkCanvas.height=window.innerHeight;

    carCtx.save();
    carCtx.translate(0,-bestCar.y+carCanvas.height*0.7);

    road.draw(carCtx);
    for(let i=0;i<traffic.length;i++){
        traffic[i].draw(carCtx,"red");
    }

    //draws cars semi transparent
    carCtx.globalAlpha=0.2;
    for (let i=0; i<cars.length;i++) {
        cars[i].draw(carCtx,"blue");
    }
    carCtx.globalAlpha=1;
    //draw only one car with sensors and full translucency
    bestCar.draw(carCtx,"blue",true); //modify draw method to include whether or not sensors are on car 

    carCtx.restore();

    networkCtx.lineDashOffset=-time/50;
    Visualizer.drawNetwork(networkCtx,bestCar.brain);
    requestAnimationFrame(animate);
}
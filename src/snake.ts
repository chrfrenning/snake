import { Model } from "./model";
import { View } from "./view";
import { Controller } from "./controller";

class State {
    model : Model;
    view : View;
    controller : Controller;
    ws : WebSocket;
}

function keyboardHandler(event) : boolean {
    event = event || window.event;

    switch( event.key ) {
        case 'ArrowUp':
        case 'w':
            document['gameState'].controller.up();
            break;
        
        case 'ArrowDown':
        case 's':
            document['gameState'].controller.down();
            break;
        
        case 'ArrowLeft':
        case 'a':
            document['gameState'].controller.left();
            break;
        
        case 'ArrowRight':
        case 'd':
            document['gameState'].controller.right();
            break;

        case ' ':
            document['gameState'].controller.step();
            break;
    }
    
    return true;
}

var xDown = null;
var yDown = null;

function handleTouchStart(e) {
    const firstTouch = e.touches[0];
    xDown = firstTouch.clientX;
    yDown = firstTouch.clientY;
}

function handleTouchMove(e) {
    if ( ! xDown || ! yDown )
        return;

    var xUp = e.touches[0].clientX;
    var yUp = e.touches[0].clientY;

    var xDiff = xDown - xUp;
    var yDiff = yDown - yUp;

    if ( Math.abs(xDiff) > Math.abs(yDiff) ) {
        if ( xDiff > 0 ) {
            document['gameState'].controller.left();
        } else {
            document['gameState'].controller.right();
        }
    } else {
        if ( yDiff > 0 ) {
            document['gameState'].controller.up();
        } else {
            document['gameState'].controller.down();
        }
    }
}

function onWindowResize(this: Window, ev: UIEvent) : void {
    var canvas : HTMLCanvasElement = document.querySelector('canvas');

    canvas.width = this.innerWidth;
    canvas.height = this.innerHeight;
    document.body.style.overflow = "hidden";

}

async function connectToServer(state : State) {
    state.ws = new WebSocket('ws://localhost:7000/ws');
    return new Promise((resolve, reject) => {
        const timer = setInterval(() => {
            if (state.ws.readyState === 1) {
                clearInterval(timer);
                resolve(state.ws);
            }
        }, 10);
    });
}

export function wireupGame(document) : void {
    console.log("Initializing Snake!");
    
    document.gameState = new State();

    var canvas : HTMLCanvasElement = document.querySelector('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    window.addEventListener('resize', onWindowResize, false);

    document.gameState.model = new Model();
    document.gameState.view = new View(document.gameState.model, canvas);
    document.gameState.controller = new Controller(document.gameState.model, document.gameState.view);

    document.addEventListener("keydown", keyboardHandler);

    document.addEventListener("touchstart", handleTouchStart, false);
    document.addEventListener("touchmove", handleTouchMove, false);

    document.gameState.model.is_server_connected = true;
    // connectToServer(document.gameState).then(e => {
    //     var ws : WebSocket = e as WebSocket;
    //     document.gameState.model.is_server_connected = true;

    //     ws.onmessage = (msg) => {
    //         console.log(msg);
    //         const data = JSON.parse(msg.data);
    //         switch( data.type ) {
    //             case "howdy":
    //                 document.gameState.model.setPlayerId(data.id);
    //                 break;
    //             case "update":
    //                 document.gameState.model.updateSnake(data);
    //                 break;
    //             case "delete":
    //                 document.gameState.model.deleteSnake(data);
    //                 break;
    //             default:
    //                 console.log("Unknown message.");
    //                 break;
    //         }
    //     };

    //     ws.send( JSON.stringify({type : "hey"}) );
    // });
}

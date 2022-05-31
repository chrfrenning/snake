import { Model } from "./model";
import { View } from "./view";
import { Controller } from "./controller";

class State {
    model : Model;
    view : View;
    controller : Controller;
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

export function wireupGame(document) : void {
    console.log("Initializing Snake!");
    
    document.gameState = new State();

    var canvas : HTMLCanvasElement = document.querySelector('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    document.gameState.model = new Model();
    document.gameState.view = new View(document.gameState.model, canvas);
    document.gameState.controller = new Controller(document.gameState.model, document.gameState.view);

    document.addEventListener("keydown", keyboardHandler);
}

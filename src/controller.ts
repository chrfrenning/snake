import { Model } from "./model";
import { View } from "./view";
import { Direction } from "./vector";

export class Controller {
    FRAME_RATE : number = 25;

    m : Model;
    v : View;
    debug : boolean = true;

    constructor(m : Model, v : View) {
        this.m = m;
        this.v = v;

        m.setController( this );
        v.setController( this );

        setInterval(() => {
            if ( m.isDirty() ) {
                v.draw();
                m.clearDirty();
            }
        }, 1000 / this.FRAME_RATE);

        setInterval(() => {
            this.m.smallTick();
        }, 1000 / this.FRAME_RATE);

        setInterval(() => {
            this.m.bigTick();
        }, 1000 / 2);
    }

    // keyboard commands

    up() : void {
        this.m.getSnake().nextDirection = Direction.up;
    }

    down() : void {
        this.m.getSnake().nextDirection = Direction.down;
    }

    left() : void {
        this.m.getSnake().nextDirection = Direction.left;
    }

    right() : void {
        this.m.getSnake().nextDirection = Direction.right;
    }

    step() : void {
        
    }

    // random generator

    random(min : number, max : number) : number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}
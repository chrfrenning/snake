import { Direction, oppositeDirection, Point, Rectangle, Vector } from './vector';
import { Controller } from "./controller";
import { View } from "./view";

export class GameObject {
    world : World;
    position : Point = new Point(0, 0);
    z_index : number = 0;
    is_dirty : boolean = true;

    constructor(world : World) {
        this.world = world;
    }

    draw(view : View, context : CanvasRenderingContext2D) : void {
        context.save();
        context.translate(this.position.x, this.position.y);
        context.fillStyle = "#ff0000";
        context.fillRect(0, 0, 10, 10);
        context.restore();
    }

    getPosition() : Point {
        return this.position;
    }

    setPosition(p : Point) : void {
        this.position = p.duplicate();

        this.is_dirty = true;
    }

    move(x : number, y : number) : void {
        this.position.x += x;
        this.position.y += y;

        this.is_dirty = true;
    }

    isDirty() : boolean  {
        return this.is_dirty;
    }

    setDirty() : void {
        this.is_dirty = true;
    }

    clearDirty() : void {
        this.is_dirty = false;
    }

    smallTick() : void {
    }

    bigTick() : void {
    }
};

export class Food extends GameObject {
    nutritionalValue : number = 1;

    constructor(world : World, position : Point) {
        super(world);
        this.position = position;
        this.z_index = 20;
    }

    draw(view : View, context : CanvasRenderingContext2D) : void {
        context.save();
        context.translate(this.position.x * view.getCellWidth(), this.position.y * view.getCellHeight());
        context.fillStyle = this.nutritionalValue > 0 ? "#00ff00" : "#aaaaaa";
        context.fillRect(0, 0, view.getCellWidth(), view.getCellHeight());
        context.restore();
    }

    eat() : number {
        var value = this.nutritionalValue;
        this.nutritionalValue = 0;
        return value;
    }
}

export class Snake extends GameObject {
    parts : Array<Vector> = [];
    foodEaten : number = 0;
    nextDirection : Direction;

    constructor(world : World) {
        super(world);
        this.z_index = 1000;
        
        var initialLength = 3;
        var intialDirection : Direction = Direction.right;
        this.parts.push(new Vector(new Point((world.width/2),world.height/2), initialLength, intialDirection));
        this.nextDirection = intialDirection;
    }

    getPosition(): Point {
        return this.parts[0].getStartPoint();
    }

    draw(view : View, context : CanvasRenderingContext2D) : void {
        var ishead : boolean = true;
        this.parts.forEach(part => {
            
            var cell : Point = part.getStartPoint().duplicate();
            for ( var i = 0; i < part.length; i++ ) {
                context.save();

                context.translate(cell.x * view.getCellWidth(), cell.y * view.getCellHeight());
                context.fillStyle = ishead ? '#ff0000' : '#000000';
                context.fillRect(0, 0, view.getCellWidth(), view.getCellHeight());
                context.restore();

                cell.move(1, oppositeDirection(part.direction));
                ishead = false;
            }
        });
    }

    crawlOne() : void {
        // move the head forward

        var head : Vector = this.parts[0];

        if ( this.nextDirection == head.direction ) {
            head.move(1, head.direction);
            head.length++;
        } else {
            var newPart : Vector = new Vector(head.getStartPoint().duplicate(), 1, this.nextDirection);
            newPart.move(1, newPart.direction);
            this.parts.unshift(newPart);
        }

        // see if we hit some food?

        this.world.objects.forEach( o => {
            if ( o instanceof Food ) {
                if ( o.getPosition().equals(head.getStartPoint()) ) {
                    
                    this.foodEaten += o.eat();
                    //this.world.removeObject(o);
                    // we need a new random food
                    this.world.objects.push(new Food(this.world, new Point(Math.floor(Math.random() * this.world.width), Math.floor(Math.random() * this.world.height))));
                }
            }
        });


        // reduce length unless we're growing

        if ( this.foodEaten > 0 ) {
            this.foodEaten--;
        } else {
            var tail = this.parts[this.parts.length-1];
            tail.length--;
            if ( tail.length == 0 ) {
                this.parts.pop();
            }
        }

        this.setDirty();
    }

    bigTick(): void {
        //this.crawlOne();
    }
}

export class World {
    width : number = 50;
    height : number = 50;

    objects : GameObject[] = [];
    mysnake : Snake;
};

export class Model {
    controller : Controller;

    world : World = new World();
    points : number = 0;
    is_dirty : boolean = true;
    
    constructor() {
        this.world.mysnake = new Snake(this.world);
        this.world.objects.push(this.world.mysnake);
        var foodpos = this.world.mysnake.parts[0].getStartPoint().duplicate();

        foodpos.move(10, this.world.mysnake.nextDirection);
        this.world.objects.push(new Food(this.world, foodpos));
    }

    getSnake() : Snake {
        return this.world.mysnake;
    }

    setController(c : Controller) : void {
        this.controller = c;
    };

    isDirty() : boolean {
        this.world.objects.forEach(element => { if (element.isDirty()) this.is_dirty = true; });
        return this.is_dirty;
    }

    clearDirty() : void {
        this.world.objects.forEach(element => element.is_dirty = false);
        this.is_dirty = false;
    }

    getAllGameObjects() : GameObject[] {
        var objarr : GameObject[] = [];
        
        objarr.push(...this.world.objects);
        objarr.sort( (a, b) => a.z_index < b.z_index ? -1 : 1 );

        return objarr;
    }

    smallTick() : void {
        this.world.objects.forEach( e => e.smallTick() );
    }

    bigTick() : void {
        this.world.objects.forEach( e => e.bigTick() );
    }
};
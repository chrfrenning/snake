import { Direction, oppositeDirection, Point, Rectangle, Vector } from './vector';
import { Controller } from "./controller";
import { View } from "./view";

export class GameObject {
    world : World;
    position : Point = new Point(0, 0);
    z_index : number = 0;
    is_dirty : boolean = true;
    is_thrash : boolean = false;

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

    bigTick(worldMap : GameObject[][]) : void {
    }
};

export class Food extends GameObject {
    nutritionalValue : number = 1;
    age : number = 0;

    constructor(world : World, position : Point) {
        super(world);
        this.position = position;
        this.z_index = 20;
    }

    draw(view : View, context : CanvasRenderingContext2D) : void {
        // only draw the food if the age is more than 40
        if ( this.age > 15 ) {
            context.save();
            context.translate(this.position.x * view.getCellWidth(), this.position.y * view.getCellHeight());
            context.fillStyle = this.nutritionalValue > 0 ? "#00ff00" : "#aaaaaa";
            context.fillRect(0, 0, view.getCellWidth(), view.getCellHeight());
            context.restore();
        }
    }

    eat() : number {
        var value = this.nutritionalValue;
        this.nutritionalValue = 0;
        this.is_thrash = true;
        return value;
    }

    bigTick(worldMap: GameObject[][]): void {
        this.age++;
    }
};

export class Wall extends GameObject {
    constructor(world : World, position : Point) {
        super(world);
        this.position = position;
        this.z_index = 10;
    }

    draw(view : View, context : CanvasRenderingContext2D) : void {
        context.save();
        context.translate(this.position.x * view.getCellWidth(), this.position.y * view.getCellHeight());
        context.fillStyle = "#000000";
        context.fillRect(0, 0, view.getCellWidth(), view.getCellHeight());
        context.restore();
    }
};

export class Snake extends GameObject {
    parts : Array<Vector> = [];
    foodEaten : number = 0;
    nextDirection : Direction;
    is_dead = false;
    id : string;

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

    getAllPoints() : Point[] {
        var points : Point[] = [];

        this.parts.forEach(part => {
            points.push(...part.getAllPoints());
        });

        return points;
    }

    draw(view : View, context : CanvasRenderingContext2D) : void {
        var ishead : boolean = true;
        this.parts.forEach(part => {
            
            var cell : Point = part.getStartPoint().duplicate();
            for ( var i = 0; i < part.length; i++ ) {
                context.save();

                context.translate(cell.x * view.getCellWidth(), cell.y * view.getCellHeight());

                
                if ( this.is_dead )
                    context.fillStyle = '#594336';
                else if ( this.id != undefined ) {
                    context.fillStyle = 'yellow';
                } else 
                    context.fillStyle = ishead ? '#ff0000' : '#000000';
                    

                context.fillRect(0, 0, view.getCellWidth(), view.getCellHeight());
                context.restore();

                cell.move(1, oppositeDirection(part.direction));
                ishead = false;
            }
        });
    }

    crawlOne(worldMap : GameObject[][]) : void {
        // we're already dead

        if (this.is_dead) return;

        // check if we'll crash into something

        var head : Vector = this.parts[0];

        var pos : Point = head.getStartPoint().duplicate();
        pos.move(1, this.nextDirection);

        if ( worldMap[pos.y][pos.x] != null ) {
            if ( worldMap[pos.y][pos.x] instanceof Wall ) {
                this.is_dead = true;
                this.setDirty();
                return;
            } else if ( worldMap[pos.y][pos.x] instanceof Snake ) {
                this.is_dead = true;
                this.setDirty();
                return;
            } else if ( worldMap[pos.y][pos.x] instanceof Food ) {
                this.foodEaten++;

                var food : Food = worldMap[pos.y][pos.x] as Food;
                food.eat();
                
                this.world.removeAllFood(); // we have two foods for each multiplication question
                this.world.addNewFood(worldMap);
                this.setDirty();
            }
        }


        // move the head forward

        if ( this.nextDirection == head.direction ) {
            head.move(1, head.direction);
            head.length++;
        } else {
            var newPart : Vector = new Vector(head.getStartPoint().duplicate(), 1, this.nextDirection);
            newPart.move(1, newPart.direction);
            this.parts.unshift(newPart);
        }


        // see if we are out of bounds?

        if ( head.getStartPoint().x < 0 || head.getStartPoint().x >= this.world.width || head.getStartPoint().y < 0 || head.getStartPoint().y >= this.world.height ) {
            this.is_dead = true;
        }


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

    bigTick(worldMap : GameObject[][]): void {
        this.crawlOne(worldMap);
    }
}

export class World {
    width : number = 10;
    height : number = 10;

    objects : GameObject[] = [];
    mysnake : Snake;

    factor1 : number = 0;
    factor2 : number = 0;

    createMap() : GameObject[][] {
        var map : GameObject[][] = [];
        for ( var i = 0; i < this.height; i++ ) {
            map.push([]);
            for ( var j = 0; j < this.width; j++ ) {
                map[i].push(null);
            }
        }

        this.objects.forEach( o => {
            if ( o instanceof Snake ) {
                var snake : Snake = o as Snake;
                snake.getAllPoints().forEach( p => {
                    map[p.y][p.x] = this.mysnake;
                });
            } else {
                map[o.getPosition().y][o.getPosition().x] = o;
            }
        });

        return map;
    }

    addNewFood(worldMap : GameObject[][]) : void {
        while( true ) {
            var pos : Point = new Point(Math.floor(Math.random() * this.width), Math.floor(Math.random() * this.height));
            if ( worldMap[pos.y][pos.x] == null ) {
                this.objects.push(new Food(this, pos));
                this.factor1 = pos.x + 1;
                this.factor2 = pos.y + 1;

                this.objects.push(new Food(this, new Point(pos.y, pos.x)));

                document.getElementById("factor1").innerHTML = this.factor1.toString();
                document.getElementById("factor2").innerHTML = this.factor2.toString();
                return;
            }
        }
    }

    removeAllFood() : void {
        this.objects = this.objects.filter( o => !(o instanceof Food) );
    }
};

export class Model {
    controller : Controller;

    world : World = new World();
    points : number = 0;
    is_dirty : boolean = true;
    
    constructor() {
        this.world.mysnake = new Snake(this.world);
        this.world.objects.push(this.world.mysnake);
        this.world.addNewFood(this.world.createMap());

        //this.setupWalls(); // not using walls in gangeslange
    }

    setupWalls() : void {
        for ( var i = 0; i < this.world.width; i++ ) {
            this.world.objects.push(new Wall(this.world, new Point(i, 0)));
            this.world.objects.push(new Wall(this.world, new Point(i, this.world.height-1)));
        }

        for ( var i = 0; i < this.world.height; i++ ) {
            this.world.objects.push(new Wall(this.world, new Point(0, i)));
            this.world.objects.push(new Wall(this.world, new Point(this.world.width-1, i)));
        }
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

    setDirty() : void {
        this.is_dirty = true;
    }

    clearDirty() : void {
        // clear dirty flags and also take out the trash
        var objarr : GameObject[] = [];
        this.world.objects.forEach( element => {
            element.clearDirty();

            if ( !element.is_thrash )
                objarr.push(element);
        });

        this.world.objects = objarr;
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
        var worldMap : GameObject[][] = this.world.createMap();
        this.world.objects.forEach( e => e.bigTick(worldMap) );
    }
};
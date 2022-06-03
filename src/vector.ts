export enum Direction {
    up = 1,
    down,
    left,
    right
};

export function oppositeDirection(direction : Direction) : Direction {
    switch (direction) {
        case Direction.up:
            return Direction.down;
        case Direction.down:
            return Direction.up;
        case Direction.left:
            return Direction.right;
        case Direction.right:
            return Direction.left;
    }
};

export class Point {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    duplicate() : Point {
        return new Point( this.x, this.y );
    }

    move(distance : number, direction : Direction) : void {
        if (direction == Direction.up) {
            this.y -= distance;
        } else if (direction == Direction.down) {
            this.y += distance;
        } else if (direction == Direction.left) {
            this.x -= distance;
        } else if (direction == Direction.right) {
            this.x += distance;
        }
    }

    equals(point : Point) : boolean {
        return this.x == point.x && this.y == point.y;
    }

    // moveBy(x : number, y : number) : void {
    //     this.x += x;
    //     this.y += y;
    // }
};

export class Vector {
    position : Point;
    length : number;
    direction : Direction;

    constructor(position: Point, length: number, direction: Direction) {
        this.position = position;
        this.length = length;
        this.direction = direction;
    }

    duplicate() : Vector {
        return new Vector( this.position.duplicate(), this.length, this.direction );
    }

    getStartPoint() : Point {
        return this.position;
    }

    getEndPoint() : Point {
        var endpos : Point = this.position.duplicate();
        endpos.move(this.length, this.direction);
        return endpos;
    }

    getPoint(index : number) : Point {
        var p : Point = this.position.duplicate();
        p.move(index, oppositeDirection(this.direction));
        return p;
    }

    move(distance : number, direction : Direction) : void {
        this.position.move(distance, direction);
    }

    getAllPoints() : Point[] {
        var p : Point[] = [];

        for ( var i = 0; i < this.length; i++ ) {
            p.push(this.getPoint(i));
        }

        return p;
    }
};

export class Rectangle {
    position : Point;
    width : number;
    height : number;

    constructor(position : Point, width: number, height: number) {
        this.position = position;
        this.width = width;
        this.height = height;
    }

    duplicate() : Rectangle {
        return new Rectangle( this.position.duplicate(), this.width, this.height );
    }
};
import { Model } from "./model";
import { Controller } from "./controller";

export class View {
    controller : Controller;
    model : Model;
    canvas : HTMLCanvasElement;

    constructor(model : Model, canvas : HTMLCanvasElement) {
        this.model = model;
        this.canvas = canvas;
    }

    setController(controller : Controller) {
        this.controller = controller;
    }

    draw() : void {
        const w = this.canvas.width;
        const h = this.canvas.height;

        let ctx = this.canvas.getContext("2d");

        ctx.fillStyle = "#EEEEEE";
        ctx.fillRect(0, 0, w, h);

        ctx.save();
        this.drawCheckerBoard(ctx, w, h);
        ctx.restore();

        ctx.save();
        this.model.getAllGameObjects().forEach(o => o.draw(this, ctx)); 
        this.model.clearDirty();
        ctx.restore();

        ctx.font = "12px Roboto";
        ctx.strokeStyle = "#666666";
        ctx.fillStyle = "#666666";
        var text = "Retro Multiplayer Snake (c) c@chph.io  ";
        var metrics = ctx.measureText( text );
        ctx.fillText(text, (w - metrics.width - 10), (h - metrics.actualBoundingBoxAscent) );
    }

    drawCheckerBoard(context : CanvasRenderingContext2D, w : number, h : number) : void {
        var cellwidth = w / this.model.world.width;
        var cellheight = h / this.model.world.height;

        for ( var row = 0; row < this.model.world.height; row++ ) {
            for ( var cell = 0; cell < this.model.world.width; cell++ ) {
                if ( (row + cell) % 2 == 0 ) {
                    context.fillStyle = "#EEEEEE";
                } else {
                    context.fillStyle = "#FFFFFF";
                }

                context.fillRect(cell * cellwidth, row * cellheight, cellwidth, cellheight);

                // paint cell coordinates for debugging
                // context.font = "7px Roboto";
                // context.fillStyle = "#666666";
                // var text : string = row + "," + cell
                // var metrics = context.measureText( text );
                // context.fillText(text, (cell * cellwidth) + (cellwidth / 2) - (metrics.width / 2), (row * cellheight) + (cellheight / 2) + (metrics.actualBoundingBoxAscent / 2));
            }
        }
    }

    getCellWidth() : number {
        return this.canvas.width / this.model.world.width;
    }

    getCellHeight() : number {
        return this.canvas.height / this.model.world.height;
    }
};
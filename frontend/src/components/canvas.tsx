import * as React from "react";
import { GameMap } from "./canvasCode/map/GameMap";
import { RelPoint, Hex } from "./canvasCode/graphics/Point";
import { Settlement } from "./canvasCode/map/Settlement";
import { Road } from "./canvasCode/map/Road";

interface IProps {
    gm: GameMap,
    onClick: (e: React.MouseEvent) => void,
    mayPlaceSettlement: boolean,
    mayPlaceRoad: boolean,
}

interface IState {
    highlightFunc: ((ctx: CanvasRenderingContext2D) => void) | null
}

export class Canvas extends React.Component<IProps, IState> {

    private canvasRef: React.RefObject<HTMLCanvasElement>;

    constructor(props: IProps) {
        super(props);
        this.canvasRef = React.createRef();

        this.state = {
            highlightFunc: null
        }
    }

    componentDidMount() {
        const canvas = this.canvasRef.current;
        if (!canvas) {
            throw Error("this shouldn't happen, canvasRef not set")
        }

        this.makeHiDPICanvas(canvas);
        this.componentDidUpdate();
    }
    
    componentDidUpdate() {
        //console.log('update');
        const canvas = this.canvasRef.current;
        if (!canvas) {
            throw Error("this shouldn't happen, canvasRef not set")
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw Error("getContext('2d') failed");
        }
        // implement draw on ctx here

        ctx.fillStyle = '#8395c1'; // background color is set here!
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

        this.props.gm.draw(ctx);

        if (this.state.highlightFunc) {
            this.state.highlightFunc(ctx);
        }
        

        // ctx.beginPath();
        // ctx.arc(this.state.x, this.state.y, 10, 0, 6.28);
        // ctx.fill();
    }


    // onClick(e: React.MouseEvent) {
    //     // the on-click
        
    //     this.setState({
    //         x: e.clientX,
    //         y: e.clientY
    //     });

    //     console.log(e.clientX, e.clientY);
    // }

    render() {
        return (
            <canvas
                ref={this.canvasRef}
                width={window.innerWidth}
                height={window.innerHeight}
                onClick={this.props.onClick}
                onMouseMove={this.mouseHoverHandler.bind(this)} // this.mouseHoverHandler.bind(this)
            />
        )
    }

    private makeHiDPICanvas(canvas: HTMLCanvasElement) {
        // https://stackoverflow.com/questions/15661339/how-do-i-fix-blurry-text-in-my-html5-canvas
        const w = window.innerWidth;
        const h = window.innerHeight
    
        const ctx: CanvasRenderingContext2D = function() {
            const tmp = canvas.getContext("2d");
            if (tmp == null) {
                throw "CanvasRenderingContext2D is null";
            }
            return tmp;
        }();
    
        const ratio = window.devicePixelRatio || 1;
    
        canvas.width = w * ratio;
        canvas.height = h * ratio;
        canvas.style.width = w + "px";
        canvas.style.height = h + "px";
        
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    
        return canvas;
    }

    mouseHoverHandler(e: React.MouseEvent) {
        const p = new RelPoint(e.clientX, e.clientY);
        const r = Hex.distanceFromNearestHexCorner(p);

        if (this.props.mayPlaceSettlement) {  
            const h = p.toHexPoint();
            const back = h.toRelPoint();          
            
            if (r < Hex.getSideLength() / 4) {
                this.setState({
                    highlightFunc: (ctx) => {
                        Settlement.stroke(back, ctx);
                    }
                });
            }
            else {
                if (this.state.highlightFunc) {
                    // not yet null, reset to null
                    this.setState({
                        highlightFunc: null
                    });
                }
            }
        }
        else if (this.props.mayPlaceRoad) {
            const hArr = p.toDualHexPoint();            
            if (hArr.length == 2) { // hArr is empty if not over a line
                const [a, b] = hArr; 
                this.setState({
                    highlightFunc: (ctx) => {
                        Road.stroke(a.toRelPoint(), b.toRelPoint(), ctx);
                    }
                });
            }
            else {
                if (this.state.highlightFunc) {
                    // not yet null, reset to null
                    this.setState({
                        highlightFunc: null
                    });
                }
            }
        }
        else {
            if (this.state.highlightFunc) {
                // not yet null, reset to null
                this.setState({
                    highlightFunc: null
                });
            }
        }
    }
}
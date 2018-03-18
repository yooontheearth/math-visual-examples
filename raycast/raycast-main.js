function convertYUp(v){
    return v * -1.0;
}
function toRadians (angle) {
    return angle * (Math.PI / 180);
}

class Vector{
    constructor(x, y){
        this.x = x ;
        this.y = y;
    }
    subtract(vec){
        return new Vector(this.x-vec.x, this.y-vec.y);
    }
    add(vec){
        return new Vector(this.x+vec.x, this.y+vec.y);
    }
    multiply(value){
        return new Vector(this.x*value, this.y*value);
    }
    dot(vec){
        return this.x*vec.x + this.y*vec.y;
    }
    dividedBy(value) {
        return new Vector(this.x / value, this.y / value, this.z / value);
    }
    length() {
        return Math.sqrt(this.dot(this));
    }
    unit() {
        return this.dividedBy(this.length());
    }
}

class RotatingRectangle{
    constructor(pos, size){
        this.size = size;
        this.pos = pos;
        this.xAxis = new Vector(1, 0);
        this.yAxis = new Vector(0, convertYUp(1));
        this.rotatedXAxis = null;
        this.rotatedYAxis = null;
        this._angle = 0;
        this._cos = 0;
        this._sin = 0;
    }
    get angle(){
        return this._angle;
    }
    addAngle(value){
        this._angle += value;
        this._cos = Math.cos(toRadians(this._angle));
        this._sin = Math.sin(toRadians(this._angle));
        this.rotatedXAxis = this.rotatePointAroundCenter(this.xAxis, new Vector(0, 0));
        this.rotatedYAxis = this.rotatePointAroundCenter(this.yAxis, new Vector(0, 0));
    }
    get left(){
        return this.pos.x - this.size.x;
    }
    get right(){
        return this.pos.x + this.size.x;
    }
    get top(){
        return this.pos.y - this.size.y;
    }
    get bottom(){
        return this.pos.y + this.size.y;
    }
    rotatePointAroundCenter(point, center){
        center = center || this.pos;
        let temp = point.subtract(center);
        let x = temp.x * this._cos - temp.y * this._sin;
        let y = temp.x * this._sin + temp.y * this._cos;
        return new Vector(x + center.x, y + center.y);
    }
}

class Ray{
    constructor(origin, direction){
        this.origin = origin;
        this.direction = direction.unit();
    }
}

function drawLine(color, start, end){
    c.strokeStyle = color;
    c.beginPath();
    c.moveTo(start.x, start.y);
    c.lineTo(end.x, end.y);
    c.stroke();
}
function drawLengthSpecifiedLine(color, length, origin, direction){
    drawLine(color, origin, direction.multiply(length).add(origin));
}

function drawText(text, point){
    c.textAlign = "center";
    c.fillText(text, point.x, point.y);
}
function drawSlab(rect){
    let color = "#ddcb12";
    const leftTopVertical = rect.rotatePointAroundCenter(new Vector(rect.left, 0));
    const leftBottomVertical = rect.rotatePointAroundCenter(new Vector(rect.left, SlabLength));
    drawLine(color, leftTopVertical, leftBottomVertical);

    const rightTopVertical = rect.rotatePointAroundCenter(new Vector(rect.right, 0));
    const rightBottomVertical = rect.rotatePointAroundCenter(new Vector(rect.right, SlabLength));
    drawLine(color, rightTopVertical, rightBottomVertical);
    drawText("X Left", rect.rotatePointAroundCenter(new Vector(rect.left, rect.pos.y)));
    drawText("X Right", rect.rotatePointAroundCenter(new Vector(rect.right, rect.pos.y)));

    color = "#fc7412";
    const leftTopHorizontal = rect.rotatePointAroundCenter(new Vector(0, rect.top));
    const rightTopHorizontal = rect.rotatePointAroundCenter(new Vector(SlabLength, rect.top));
    drawLine(color, leftTopHorizontal, rightTopHorizontal);

    const leftBottomHorizontal = rect.rotatePointAroundCenter(new Vector(0, rect.bottom));
    const rightBottomHorizontal = rect.rotatePointAroundCenter(new Vector(SlabLength, rect.bottom));
    drawLine(color, leftBottomHorizontal, rightBottomHorizontal);
    drawText("Y Top", rect.rotatePointAroundCenter(new Vector(rect.pos.x, rect.top)));
    drawText("Y Bottom", rect.rotatePointAroundCenter(new Vector(rect.pos.x, rect.bottom)));
}
function drawRectAxis(rect){
    const xPoint = rect.rotatedXAxis.multiply(MinLengthForUnitVector).add(rect.pos);
    drawLine("#cc3537", rect.pos, xPoint);
    drawText("X Axis", xPoint);
    const yPoint = rect.rotatedYAxis.multiply(MinLengthForUnitVector).add(rect.pos);
    drawLine("#26cc2c", rect.pos, yPoint);
    drawText("Y Axis", yPoint);
}
function drawRay(ray){
    drawLine("#9fdde5", ray.origin, ray.direction.multiply(RayCastLength).add(ray.origin));
    drawText("Ray Origin", ray.origin);
}
function drawVector(vector, origin){
    drawLine("#c73ccc", origin, vector.add(origin));
    drawText("Vector", vector.multiply(0.5).add(origin));
}
function drawTimeLine(color, ray, time, text){
    let point = ray.direction.multiply(time).add(ray.origin);
    drawLine(color, ray.origin, point);
    drawText(text, point);
}

const canvas = document.getElementById("canvas");
const c = canvas.getContext("2d");
const [SlabLength, RayCastLength, MinLengthForUnitVector, NoDividingByZero] = [1000, 1000, 40, 0.00001];

const obb = new RotatingRectangle(pos=new Vector(150, 200), size=new Vector(80, 50));
const rayCast = new Ray(origin=new Vector(400, 400), direction=new Vector(-0.8, convertYUp(1)));
const vectorFromOriginOfRayToCenterOfRect = obb.pos.subtract(rayCast.origin);

function draw(){
    obb.addAngle(0.2);
    // When an axis and the vector from the origin of the ray are parallel, then the result of dot product is zero. To avoid dividing by zero, use very small value instead.
    const lengthBetweenOriginOfRayAndCenterOfRectProjectedOnXAxis = obb.rotatedXAxis.dot(vectorFromOriginOfRayToCenterOfRect) || NoDividingByZero;
    const lengthOfDirectionOfRayProjectedOnXAxis = obb.rotatedXAxis.dot(rayCast.direction) || NoDividingByZero;
    const lengthBetweenOriginOfRayAndCenterOfRectProjectedOnYAxis = obb.rotatedYAxis.dot(vectorFromOriginOfRayToCenterOfRect) || NoDividingByZero;
    const lengthOfDirectionOfRayProjectedOnYAxis = obb.rotatedYAxis.dot(rayCast.direction) || NoDividingByZero;

    c.clearRect(0, 0, 500, 500);
    drawSlab(obb);
    drawRectAxis(obb);
    drawRay(rayCast);
    drawVector(vectorFromOriginOfRayToCenterOfRect, rayCast.origin);

    // Visualizing how dot product works. Comment out if you are curious.
    // drawLengthSpecifiedLine("#6e7fb0", lengthBetweenOriginOfRayAndCenterOfRectProjectedOnXAxis, obb.pos, obb.rotatedXAxis);
    // drawLengthSpecifiedLine("#10e7d7", lengthOfDirectionOfRayProjectedOnXAxis * MinLengthForUnitVector, obb.pos, obb.rotatedXAxis);
    // drawLengthSpecifiedLine("#6e7fb0", lengthBetweenOriginOfRayAndCenterOfRectProjectedOnYAxis, obb.pos, obb.rotatedYAxis);
    // drawLengthSpecifiedLine("#10e7d7", lengthOfDirectionOfRayProjectedOnYAxis * MinLengthForUnitVector, obb.pos, obb.rotatedYAxis);

    const t1 = (lengthBetweenOriginOfRayAndCenterOfRectProjectedOnXAxis + obb.size.x) / lengthOfDirectionOfRayProjectedOnXAxis;
    const t2 = (lengthBetweenOriginOfRayAndCenterOfRectProjectedOnXAxis - obb.size.x) / lengthOfDirectionOfRayProjectedOnXAxis;
    const t3 = (lengthBetweenOriginOfRayAndCenterOfRectProjectedOnYAxis + obb.size.y) / lengthOfDirectionOfRayProjectedOnYAxis;
    const t4 = (lengthBetweenOriginOfRayAndCenterOfRectProjectedOnYAxis - obb.size.y) / lengthOfDirectionOfRayProjectedOnYAxis;
    drawTimeLine("#702dcc", rayCast, t1, "TX1");
    drawTimeLine("#75cc4b", rayCast, t2, "TX2");
    drawTimeLine("#702dcc", rayCast, t3, "TY1");
    drawTimeLine("#75cc4b", rayCast, t4, "TY2");

    const tmin = Math.max(Math.min(t1, t2), Math.min(t3, t4));
    const tmax = Math.min(Math.max(t1, t2), Math.max(t3, t4));

    // tmax < 0 means the intersection is in the negative direction of the ray. tmin > tmax means no intersection.
    drawText(tmax < 0 || tmin>tmax ? "NO Intersection" : "YES!", new Vector(50, 450));
    window.requestAnimationFrame(draw);
};
window.requestAnimationFrame(draw);
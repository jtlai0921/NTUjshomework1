/**
 * A fork of https://openprocessing.org/sketch/1153107
 * Basically it still is constructed from delaunay triangulation made from a subdivision process. 
 * But the resulting triangles are used to build squares (Shapes) and displayed in various ways.
 * 
 * Interaction:
 * Press mouse to switch between display modes
 * Press i for hide / show progress bar. Press any other key for new graphic
 *
 * Delaunay triangulation implementation done from scratch with the help of:
 * general algorithm: 			https://en.wikipedia.org/wiki/Delaunay_triangulation
 * point in triangle test:  	http://totologic.blogspot.com/2014/01/accurate-point-in-triangle-test.html
 * defintion of circumcenter: 	https://mathworld.wolfram.com/Circumcenter.html
 * line intersection: 			https://en.wikipedia.org/wiki/Line–line_intersection
 * 
 * Copyright: Diana Lange, 2021-05-17
 * Published under the Creative Commons license NonCommercial 4.0. 
 * Check CC-Attribut-NonCommercial for more information at https://creativecommons.org/licenses/by-nc/4.0/
 */


"use strict";

let subdivision;
let maxPoints = 500;
let pointCount = 0;
let newPointProbability = 60;
let drawFunctions = [drawShapeScaleLinearAndRotate, drawShapeScaleExpAndRotate, drawShapeScaleExp, drawShapeScaleLinear, drawShape];
let drawFunctionsIndex = 0;
let doDrawLoadingBar = true;

p5.Vector.prototype.equals = function (other) {
    return this.x === other.x && this.y === other.y;
};

function setup() {
    createCanvas(windowWidth, windowHeight);
    initSubdivision();
}

function draw() {
    background(30);
    if (pointCount < maxPoints && shouldDo(newPointProbability)) {
        let triangleIndex = randomInt(subdivision.size());
        let triangle = subdivision.get(triangleIndex);
        if (triangle.size() > 10) {
            let newPoint = subdivision.get(triangleIndex).center;
            subdivision.add(newPoint, triangleIndex);
            pointCount++;
        }
    }
    strokeWeight(0.75);
    stroke(210);
    noFill();
    drawShapes(drawFunctions[drawFunctionsIndex]);
    if (doDrawLoadingBar) {
        let barWidth = width * 0.1;
        let barHeight = 30;
        drawLoadingBar(width * 0.5 - barWidth * 0.5, height - barHeight * 2, barWidth, barHeight, pointCount, maxPoints);
    }
}

function initSubdivision() {
    let margin = width * 0.05;
    let bottomLeft = createVector(margin, height - margin);
    let bottomRight = createVector(width - margin, height - margin);
    let top = createVector(width * 0.5, margin);
    subdivision = new Delaunay(top, bottomLeft, bottomRight);

    let left = new Triangle(top, bottomLeft, createVector(margin, margin));
    let right = new Triangle(top, bottomRight, createVector(width - margin, margin));
    left.addNeighbor(subdivision.initialTriangle);
    right.addNeighbor(subdivision.initialTriangle);
    subdivision.add(left);
    subdivision.add(right);
    subdivision.optimize();
    pointCount = 0;
    maxPoints = randomInt(80, 400);
}

function drawLoadingBar(x, y, width, height, currentValue, maxValue) {
    noStroke();
    fill(30);
    rect(x, y, width, height);
    let loadedWith = width * map(currentValue, 0, maxValue, 0, 1);
    noStroke();
    fill(100, 35, 40, 180);
    rect(x, y, loadedWith, height);
    noFill();
    strokeWeight(1);
    stroke(210);
    rect(x, y, width, height);
}

function drawShapes(optionalDrawFct) {
    let drawFct = optionalDrawFct || drawShape;
    let shapes = getShapesFromDelaunay(subdivision);
    for (let shape of shapes.array) {
        drawFct(shape);
    }
}

function drawShapeScaleLinear(shape) {
    drawShapeScaleLinearAndRotate(shape, false, false);
}

function drawShapeScaleLinearAndRotate(shape, optionalRotateFlag, optionalCutoffFlag) {
    let doCutOff = optionalCutoffFlag == undefined ? true : optionalCutoffFlag;
    let doRotate = optionalRotateFlag == undefined ? true : optionalRotateFlag;
    let mean = shape.mean;
    let volume = shape.volume;
    let max = 2 + parseInt(volume) % 20;
    for (let scaleValue = 1; scaleValue > 0.1; scaleValue -= (1 / max)) {
        if (doCutOff && scaleValue < 1 && volume * scaleValue < (width * height * 0.00005)) {
            break;
        }
        push();
        translate(mean.x, mean.y);
        if (doRotate) {
            rotate((1 - scaleValue) * PI / 2);
        }
        scale(scaleValue);
        drawShapeByMeanOffset(shape, mean);
        pop();
    }
}

function drawShapeScaleExp(shape) {
    drawShapeScaleExpAndRotate(shape, false, false);
}

function drawShapeScaleExpAndRotate(shape, optionalRotateFlag, optionalCutoffFlag) {
    let doCutOff = optionalCutoffFlag == undefined ? true : optionalCutoffFlag;
    let doRotate = optionalRotateFlag == undefined ? true : optionalRotateFlag;
    let mean = shape.mean;
    let volume = shape.volume;
    let max = 6;
    max = 2 + parseInt(volume) % 20;
    for (let i = 1; i < max; i++) {
        let scaleValue = 1 / i;
        if (doCutOff && scaleValue < 1 && volume * scaleValue < (width * height * 0.00002)) {
            break;
        }
        strokeWeight(0.75 / scaleValue);
        push();
        translate(mean.x, mean.y);
        if (doRotate) {
            rotate((i - 1) / max * PI / 2);
        }
        scale(scaleValue);
        drawShapeByMeanOffset(shape, mean);
        pop();
    }
}

function drawShape(shape) {
    beginShape();
    for (let edge of shape.edges.array) {
        vertex(edge.start.x, edge.start.y);
    }
    endShape(CLOSE);
}

function drawShapeByMeanOffset(shape, optionalMean) {
    let mean = optionalMean || shape.center;
    beginShape();
    for (let edge of shape.edges.array) {
        vertex(edge.start.x - mean.x, edge.start.y - mean.y);
    }
    endShape(CLOSE);
}

function getShapesFromDelaunay(delaunay) {
    let shapes = new List();
    for (let triangle of delaunay.triangles.array) {
        let center = triangle.center;
        let one = new Edge({ start: center, end: triangle.a });
        let two = new Edge({ start: center, end: triangle.b });
        let three = new Edge({ start: center, end: triangle.c });
        let shapeOne = new Shape(one);
        let shapeTwo = new Shape(two);
        let shapeThree = new Shape(three);
        shapeOne.add(two);
        shapeTwo.add(three);
        shapeThree.add(one);

        let neighborShapeOne = getNeighbor(new Edge({ start: triangle.a, end: triangle.b }), triangle.neighbors);
        let neighborShapeTwo = getNeighbor(new Edge({ start: triangle.b, end: triangle.c }), triangle.neighbors);
        let neighborShapeThree = getNeighbor(new Edge({ start: triangle.c, end: triangle.a }), triangle.neighbors);
        connectToCenter(shapeOne, triangle.a, triangle.b, neighborShapeOne);
        connectToCenter(shapeTwo, triangle.b, triangle.c, neighborShapeTwo);
        connectToCenter(shapeThree, triangle.c, triangle.a, neighborShapeThree);

        if (shapeOne.closed && !shapes.contains(shapeOne)) {
            shapes.add(shapeOne);
        }
        if (shapeTwo.closed && !shapes.contains(shapeTwo)) {
            shapes.add(shapeTwo);
        }
        if (shapeThree.closed && !shapes.contains(shapeThree)) {
            shapes.add(shapeThree);
        }
    }

    return shapes;
}

function getNeighbor(neighborEdge, neighborsList) {
    for (let triangle of neighborsList.array) {
        if (triangle.contains(neighborEdge)) {
            return triangle;
        }
    }
    return null;
}

function connectToCenter(shape, sharedVectorOne, sharedVectorTwo, triangle) {
    if (triangle == null) {
        return;
    }
    let center = triangle.center;
    let one = new Edge({ start: sharedVectorOne, end: center });
    let two = new Edge({ start: sharedVectorTwo, end: center });
    shape.add(one);
    shape.add(two);
}

function mousePressed() {
    drawFunctionsIndex++;
    if (drawFunctionsIndex > drawFunctions.length - 1) {
        drawFunctionsIndex = 0;
    }
}

function keyPressed() {
    if (key === 'i') {
        doDrawLoadingBar = !doDrawLoadingBar;
    } else {
        initSubdivision();
    }
}

function shouldDo(probability) {
    return random(100) < probability;
}

function randomInt(a, b) {
    let min = b == null ? 0 : a;
    let max = b == null ? a : b;
    return parseInt(random(min, max));
}

class List {
    constructor() {
        this.values = [];
    }

    get array() {
        return this.values;
    }

    add(newValue, optionalIndex) {
        if (optionalIndex == null) {
            this.values.push(newValue);
        } else {
            this.array.splice(optionalIndex, 0, newValue);
        }
    }

    set(index, newValue) {
        this.values[index] = newValue;
    }

    get(index) {
        return this.values[index];
    }

    remove(option) {
        if (option.index != null) {
            let index = option.index;
            if (index === this.values.length - 1) {
                this.values.pop();
            } else if (this.values.length > 1) {
                this.values[index] = this.values.pop();
            }
        } else {
            let value = option.value;
            let index = this.indexOf(value);
            if (index > -1) {
                this.remove({ index: index });
            }
        }
    }

    clear() {
        this.values = [];
    }

    size() {
        return this.values.length;
    }

    indexOf(value) {
        if (value == null) {
            return -1;
        }
        for (let i = 0; i < this.values.length; i++) {
            if (value.equals(this.values[i])) {
                return i;
            }
        }
        return -1;
    }

    contains(value) {
        return this.indexOf(value) !== -1;
    }

    toString() {
        return this.values.join("; ");
    }

}

class Edge {

    constructor(options) {
        this.start = options.start;
        this.end = options.end || createVector(
            options.start.x + Math.cos(options.angle) * options.length,
            options.start.y + Math.sin(options.angle) * options.length
        );
    }

    get angle() {
        return Math.atan2(this.start.y - this.end.y, this.start.x - this.end.x);
    }

    get mean() {
        return createVector(
            0.5 * (this.start.x + this.end.x),
            0.5 * (this.start.y + this.end.y)
        );
    }

    get length() {
        return this.start.dist(this.end);
    }

    switchEnds() {
        let temp = this.start;
        this.start = this.end;
        this.end = temp;
    }

    intersection(other) {
        let deltaX = this.start.x - this.end.x;
        let deltaY = this.start.y - this.end.y;
        let deltaXOther = other.start.x - other.end.x;
        let deltaYOther = other.start.y - other.end.y;
        let denominator = deltaX * deltaYOther - deltaY * deltaXOther;
        let subThis = this.start.x * this.end.y - this.start.y * this.end.x;
        let subOther = other.start.x * other.end.y - other.start.y * other.end.x;
        let x = (subThis * deltaXOther - deltaX * subOther) / denominator;
        let y = (subThis * deltaYOther - deltaY * subOther) / denominator;
        return createVector(x, y);
    }

    connects(other) {
        return (this.start.equals(other.start) && this.end.equals(other.end))
            || (this.start.equals(other.end) && this.end.equals(other.start));
    }

    equals(other) {
        return (this.start.equals(other.start) && this.end.equals(other.end))
            || (this.start.equals(other.end) && this.end.equals(other.start));
    }

    draw() {
        line(this.start.x, this.start.y, this.end.x, this.end.y);
    }

}

class Triangle {
    constructor(a, b, c) {
        let mean = createVector((a.x + b.x + c.x) / 3, (a.y + b.y + c.y) / 3);
        let thetaA = Math.atan2(a.y - mean.y, a.x - mean.x);
        let thetaB = Math.atan2(b.y - mean.y, b.x - mean.x);
        let thetaC = Math.atan2(c.y - mean.y, c.x - mean.x);
        if (thetaA > thetaB && thetaA > thetaC) {
            this.a = a;
            if (thetaB > thetaC) {
                this.b = b;
                this.c = c;
            } else {
                this.b = c;
                this.c = b;
            }
        } else if (thetaB > thetaC) {
            this.a = b;
            if (thetaA > thetaC) {
                this.b = a;
                this.c = c;
            } else {
                this.b = c;
                this.c = a;
            }
        } else {
            this.a = c;
            if (thetaA > thetaB) {
                this.b = a;
                this.c = b;
            } else {
                this.b = b;
                this.c = a;
            }
        }

        this.edges = [
            new Edge({ start: this.a, end: this.b }),
            new Edge({ start: this.b, end: this.c }),
            new Edge({ start: this.c, end: this.a })
        ];
        this.neighbors = new List();
    }

    get circumcenter() {
        let halfPi = (Math.PI * 0.5);
        let bisectorOne = new Edge({ start: this.edges[0].mean, angle: this.edges[0].angle + halfPi, length: this.edges[0].length });
        let bisectorTwo = new Edge({ start: this.edges[1].mean, angle: this.edges[1].angle + halfPi, length: this.edges[1].length });
        return bisectorOne.intersection(bisectorTwo);
    }

    get radius() {
        return this.a.dist(this.circumcenter);
    }

    registerNeighbor(triangle) {
        if (!this.neighbors.contains(triangle)) {
            this.neighbors.add(triangle);
        }
    }

    addNeighbor(triangle) {
        if (triangle != null) {
            triangle.registerNeighbor(this);
            this.registerNeighbor(triangle);
        }
    }

    addNeighbors(neighbors) {
        neighbors.array.forEach(neighbor => this.addNeighbor(neighbor));
    }

    unRegisterNeighbor(triangle) {
        this.neighbors.remove({ value: triangle });
    }

    removeAllNeighbors() {
        this.neighbors.array.forEach(n => n.unRegisterNeighbor(this));
        this.neighbors.clear();
    }

    size() {
        let aLength = this.edges[0].length;
        let bLength = this.edges[1].length;
        let cLength = this.edges[2].length;
        let s = (aLength + bLength + cLength) / 2;
        return Math.sqrt(s * (s - aLength) * (s - bLength) * (s - cLength));
    }

    get center() {
        return createVector(
            (this.a.x + this.b.x + this.c.x) / 3,
            (this.a.y + this.b.y + this.c.y) / 3
        );
    }

    contains(edge) {
        return this.edges[0].equals(edge) || this.edges[1].equals(edge) || this.edges[2].equals(edge);
    }

    complement(neighbor) {
        if (!neighbor.a.equals(this.a) && !neighbor.a.equals(this.b) && !neighbor.a.equals(this.c)) {
            return neighbor.a;
        } else if (!neighbor.b.equals(this.a) && !neighbor.b.equals(this.b) && !neighbor.b.equals(this.c)) {
            return neighbor.b;
        }
        return neighbor.c;
    }

    side(a, b, c) {
        return (b.y - a.y) * (c.x - a.x) + (-b.x + a.x) * (c.y - a.y);
    }

    // source: // http://totologic.blogspot.com/2014/01/accurate-point-in-triangle-test.html
    inSide(p) {
        return this.side(this.a, this.b, p) >= 0 && this.side(this.b, this.c, p) >= 0 && this.side(this.c, this.a, p) >= 0;
    }

    inSideCircle(p) {
        let circumCenter = this.circumcenter;
        return p.dist(circumCenter) < this.a.dist(circumCenter);
    }

    isNeighbor(other) {
        for (let i = 0; i < this.edges.length; i++) {
            for (let j = 0; j < other.edges.length; j++) {
                if (this.edges[i].equals(other.edges[j])) {
                    return this.edges[i];
                }
            }
        }
        return false;
    }

    union(other) {
        return this.isNeighbor(other);
    }

    draw() {
        triangle(this.a.x, this.a.y, this.b.x, this.b.y, this.c.x, this.c.y);
    }

    equals(other) {
        return this.a.equals(other.a) && this.b.equals(other.b) && this.c.equals(other.c);
    }

    toString() {
        return "[" + this.a.toString() + " " + this.b.toString() + " " + this.c.toString() + "]"
    }
}

class Shape {
    constructor(edge) {
        this.edges = new List();
        this.edges.add(edge);
    }

    get volume() {
        if (!this.closed) {
            return 0;
        }
        let volume = 0;
        for (let edge of this.edges.array) {
            volume += edge.length;
        }
        return volume;
    }

    get mean() {
        let mean = createVector(0, 0);
        for (let edge of this.edges.array) {
            mean.x += edge.start.x;
            mean.y += edge.start.y;
        }
        mean.x /= this.edges.size();
        mean.y /= this.edges.size();
        return mean;
    }

    get closed() {
        return this.edges.size() > 2 && this.edges.get(0).start.equals(this.edges.get(this.edges.size() - 1).end);
    }

    equals(other) {
        if (this.edges.size() != other.edges.size()) {
            return false;
        }
        for (let i = 0; i < this.edges.size(); i++) {
            if (!other.edges.contains(this.edges.get(i))) {
                return false;
            }
        }
        return true;
    }

    add(newEdge) {
        let index = this.edges.size() - 1;
        let simpleCopy = new Edge({ start: newEdge.start, end: newEdge.end });
        let connector = this.edges.get(index);
        if (connector.start.equals(simpleCopy.end)) {
            this.edges.add(simpleCopy, index);
        } else if (connector.start.equals(simpleCopy.start)) {
            simpleCopy.switchEnds();
            this.edges.add(simpleCopy, index);
        } else if (connector.end.equals(simpleCopy.start)) {
            this.edges.add(simpleCopy, index + 1);
        } else {
            simpleCopy.switchEnds();
            this.edges.add(simpleCopy, index + 1);
        }
    }
}

class Delaunay {
    constructor(a, b, c) {
        this.initialTriangle = new Triangle(a, b, c);
        this.triangles = new List();
        this.clear();
    }

    clear() {
        this.triangles.clear();
        this.triangles.add(this.initialTriangle);
    }

    size() {
        return this.triangles.size();
    }

    get(i) {
        return this.triangles.get(i);
    }

    draw() {
        this.triangles.array.forEach(triangle => triangle.draw());
    }

    findNeighbors(a, sources) {
        let neighbors = new List();
        sources.forEach(source => {
            source.neighbors.array.forEach(sourceTriangle => {
                if (a.isNeighbor(sourceTriangle)) {
                    neighbors.add(sourceTriangle);
                }
            });
        });
        return neighbors;
    }

    optimize(index) {
        let startIndex = index || 0;
        let flipped = true;
        for (let attempts = 0; flipped && attempts < 40; attempts++) {
            flipped = false;
            for (let i = startIndex; i < this.triangles.size(); i++) {
                flipped |= this.optimizeTriangleByIndex(i);
            }
            attempts++;
        }
    }

    optimizeTriangleByIndex(index) {
        let flipped = false;
        let aTriangle = this.triangles.get(index);
        let neighbors = aTriangle.neighbors.array;
        for (let k = 0; k < neighbors.length; k++) {
            let bTriangle = neighbors[k];
            let bExclusiveVector = aTriangle.complement(bTriangle);
            if (!aTriangle.inSideCircle(bExclusiveVector)) {
                continue;
            }
            flipped = true;
            let unionEdge = aTriangle.union(bTriangle);
            let aExclusiveVector = bTriangle.complement(aTriangle);
            let newTriangleA = new Triangle(bExclusiveVector, aExclusiveVector, unionEdge.start);
            let newTriangleB = new Triangle(bExclusiveVector, aExclusiveVector, unionEdge.end);
            let newTriangleANeighbors = this.findNeighbors(newTriangleA, [aTriangle, bTriangle]);
            let newTriangleBNeighbors = this.findNeighbors(newTriangleB, [aTriangle, bTriangle]);
            newTriangleA.addNeighbors(newTriangleANeighbors);
            newTriangleB.addNeighbors(newTriangleBNeighbors);
            newTriangleA.addNeighbor(newTriangleB);
            aTriangle.removeAllNeighbors();
            bTriangle.removeAllNeighbors();
            this.triangles.set(index, newTriangleA);
            this.triangles.set(this.triangles.indexOf(bTriangle), newTriangleB);
            break;
        }
        return flipped;
    }

    findTriangle(p) {
        for (let i = 0; i < this.triangles.size(); i++) {
            let triangle = this.triangles.get(i);
            if (triangle.inSide(p)) {
                return i;
            }
        }
        return -1;
    }

    findFirstNeighbor(triangles, triangle) {
        for (let i = 0; i < triangles.length; i++) {
            if (triangle.isNeighbor(triangles[i])) {
                return triangles[i];
            }
        }
        return null;
    }

    add(newPoint, optionalIndex) {
        let index = optionalIndex || this.findTriangle(newPoint);
        if (index == null || index === -1) {
            return;
        }

        let inside = this.triangles.get(index);

        let a = inside.a;
        let b = inside.b;
        let c = inside.c;
        let neighbors = inside.neighbors.array;

        let newTriangleOne = new Triangle(a, b, newPoint);
        let newTriangleTwo = new Triangle(b, c, newPoint);
        let newTriangleThree = new Triangle(c, a, newPoint);
        let newTriangleOneNeighbor = this.findFirstNeighbor(neighbors, newTriangleOne);
        let newTriangleTwoNeighbor = this.findFirstNeighbor(neighbors, newTriangleTwo);
        let newTriangleThreeNeighbor = this.findFirstNeighbor(neighbors, newTriangleThree);
        inside.removeAllNeighbors();
        newTriangleOne.addNeighbor(newTriangleTwo);
        newTriangleOne.addNeighbor(newTriangleOneNeighbor);
        newTriangleTwo.addNeighbor(newTriangleThree);
        newTriangleTwo.addNeighbor(newTriangleTwoNeighbor);
        newTriangleThree.addNeighbor(newTriangleOne);
        newTriangleThree.addNeighbor(newTriangleThreeNeighbor);
        this.triangles.remove({ index: index });
        this.triangles.add(newTriangleOne);
        this.triangles.add(newTriangleTwo);
        this.triangles.add(newTriangleThree);
        this.optimize(Math.max(this.triangles.size() - 4, 0));
        this.optimize();
    }
}

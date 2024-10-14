/*
Draws a parabola on the canvas.
The parabola is transformed including translation and rotation.
@param {CanvasRenderingContext2D} ctx - rendering context for the canvas
@param {number} x - The x-axis (horizontal) coordinate of the parabola's focus.
@param {number} y - The y-axis (vertical) coordinate of the parabola's focus.
@param {number} a - The focal length of the parabola, where the focus is located at (0, a) and the directrix at y = -a before affine transformation. 
@param {number} rotation - The rotation of the parabola around the focus, expressed in radians.
@param {number} startPos - The starting x-coordinate on the x-axis for drawing the portion of the parabola before affine transformation.
@param {number} endPos - The ending x-coordinate on the x-axis for drawing the portion of the parabola before affine transformation.
@param {bool} counterclockwise - An optional boolean value which, if true, draws the ellipse counterclockwise (anticlockwise). The default value is false (clockwise).
*/
function drawParabola(ctx, x, y, a, rotation, startPos, endPos, counterclockwise = false) {
    function parabola(x) {
        return x * x / 4 / a;
    }
    function intersectionOfTangentLines(point1, point2, a) {
        const x1 = point1.x;
        const y1 = point1.y;
        const x2 = point2.x;
        const y2 = point2.y;
        const x = x1 + x2 + 2 * a * (y2 - y1) / (x1 - x2);
        return {
            x: x,
            y: y1 + x1 * (x - x1) / 2 / a
        };
    }
    function translate(point, deltaX, deltaY) {
        return {x: point.x + deltaX, y: point.y + deltaY};
    }
    // Function to rotate a point around the center, expressed in radians.
    function rotate(point, center, radian) {
        const deltaX = point.x - center.x;
        const deltaY = point.y - center.y;
        return {
            x: center.x + (deltaX * Math.cos(radian) - deltaY * Math.sin(radian)),
            y: center.y + (deltaX * Math.sin(radian) + deltaY * Math.cos(radian))
        };
    }


    // Draw parabola using quadratic Bezier curve
    // Note that the Bezier curve is affine invariant, meaning that an affine transformation of its control points produces 
    // the same result as constructing the curve first and then applying the transformation.
    const focus = {x: 0, y: a};  // Focus of the parabola before affine transformation
    let startPoint, controlPoint, endPoint; // start point, control point and end point of the quadratic Bezier curve before affine transformation
    let rotatedStartPoint, rotatedControlPoint, rotateEndPoint;  // rotation
    let translatedStartPoint, translatedControlPoint, translatedEndPoint;  // rotation and translation

    startPoint = {x: startPos, y: parabola(startPos)};  
    endPoint = {x: endPos, y: parabola(endPos)};
    controlPoint = intersectionOfTangentLines(startPoint, endPoint, a);

    console.log(startPoint);
    console.log(controlPoint);
    console.log(endPoint);
    console.log(focus);

    // Rotation
    radian = counterclockwise ? -rotation : rotation; 
    rotatedStartPoint = rotate(startPoint, focus, radian);
    rotatedControlPoint = rotate(controlPoint, focus, radian);
    rotatedEndPoint = rotate(endPoint, focus, radian);

    // Translation
    const deltaX = x;
    const deltaY = y - a;
    translatedStartPoint = translate(rotatedStartPoint, deltaX, deltaY);
    translatedControlPoint = translate(rotatedControlPoint, deltaX, deltaY);
    translatedEndPoint = translate(rotatedEndPoint, deltaX, deltaY);

    ctx.beginPath();
    ctx.moveTo(translatedStartPoint.x, translatedStartPoint.y);
    ctx.quadraticCurveTo(translatedControlPoint.x, translatedControlPoint.y, 
                         translatedEndPoint.x, translatedEndPoint.y);
    ctx.stroke();
}

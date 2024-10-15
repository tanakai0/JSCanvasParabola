/*
Draws a parabola on the canvas.
The parabola is transformed including translation and rotation.
@param {CanvasRenderingContext2D} ctx - The rendering context for the canvas.
@param {number} x - The x-axis (horizontal) coordinate of the parabola's focus.
@param {number} y - The y-axis (vertical) coordinate of the parabola's focus.
@param {number} a - The focal length of the parabola, where the focus is located at (0, a) and the directrix at y = -a before affine transformation. 
@param {number} rotation - The rotation of the parabola around the focus, expressed in radians.
@param {number} startPos - The starting x-coordinate on the x-axis for drawing the portion of the parabola before affine transformation. The default value is 0.
@param {number} endPos - The ending x-coordinate on the x-axis for drawing the portion of the parabola before affine transformation. The default value is 0.
                         If the startPos equals to endPos, this calculates its range automatically just fitted in the canvas.
@param {bool} counterclockwise - An optional boolean value which, if true, draws the ellipse counterclockwise (anticlockwise). The default value is false (clockwise).
*/
function drawParabola(ctx, x, y, a, rotation, startPos = 0, endPos = 0, counterclockwise = false) {
    
    // Function to calculate the y-coordinate of the parabola on the x-coordinate.
    function parabola(x) {
        return x * x / 4 / a;
    }

    // Function to calculate an intersection of two tangent lines of points on the parabola.
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
    
    // Function to translate a point.
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

    // Function to calculate intersections of the parabola and line.
    // a: The focal length of the parabola, where the focus is located at (0, a) and the directrix at y = -a.
    // point1: A point passes through the line.
    // point2: Another point passes through the line. 
    function intersectionOfParabolaAndLine(a, point1, point2) {
        let intersections = [];
        const x1 = point1.x;
        const y1 = point1.y;
        const x2 = point2.x;
        const y2 = point2.y;
        if (x1 == x2) {  // When the line is vertical.
            intersections.push({x: x1, y: parabola(x1)});
        }
        else {
            const slope = (y2 - y1) / (x2 - x1);
            const intercept = y1 - slope * x1;
            const discriminant = 2 * a * (a * slope **2 + intercept);
            if (discriminant > 0) {
                const xa = 2 * a * slope + Math.sqrt(discriminant);
                const xb = 2 * a * slope - Math.sqrt(discriminant);
                intersections.push({x: xa, y: parabola(xa)});
                intersections.push({x: xb, y: parabola(xb)});
            }
            else if (discriminant == 0){
                const xa = 2 * a * slope;
                intersections.push({x: xa, y: parabola(xa)});
            }
        }
        return intersections;
    }

    // Draw parabola using quadratic Bezier curve.
    // Note that the Bezier curve is affine invariant, meaning that an affine transformation of its control points produces 
    // the same result as constructing the curve first and then applying the transformation.
    const focus = {x: 0, y: a};  // Focus of the parabola before affine transformation.
    let startPoint, controlPoint, endPoint; // start point, control point and end point of the quadratic Bezier curve before affine transformation.
    let rotatedStartPoint, rotatedControlPoint, rotatedEndPoint;  // Rotation.
    let translatedStartPoint, translatedControlPoint, translatedEndPoint;  // Rotation and translation.
    const radian = counterclockwise ? -rotation : rotation; // Radian for rotation.
    const deltaX = x;  // Delta x for translation.
    const deltaY = y - a;  // Delta y for translation.

    if (startPos == endPos) {  // When the range is automatically calculated to fall within the canvas.
        // Calculate the intersections of frame lines and parabola.
        const width = ctx.canvas.width; // Canvas width.
        const height = ctx.canvas.height; // Canvas height.
        // Corners of the canvas frame after affine transformation of the parabola.
        const topLeftCorner     = {x:     0, y:      0};
        const topRightCorner    = {x: width, y:      0};
        const bottomLeftCorner  = {x:     0, y: height};
        const bottomRightCorner = {x: width, y: height};
        
        // Corners of the canvas frame before affine transformation of the parabola.
        const transformedTopLeftCorner =     rotate(translate(    topLeftCorner, - deltaX, - deltaY), focus, - radian);
        const transformedTopRightCorner =    rotate(translate(   topRightCorner, - deltaX, - deltaY), focus, - radian);
        const transformedBottomLeftCorner =  rotate(translate( bottomLeftCorner, - deltaX, - deltaY), focus, - radian);
        const transformedBottomRightCorner = rotate(translate(bottomRightCorner, - deltaX, - deltaY), focus, - radian);
        
        // Intersections of the parabola and transformed frame lines before affine transformation of the parabola.
        let intersections = [];
        intersections.push(...intersectionOfParabolaAndLine(a, transformedTopLeftCorner, transformedTopRightCorner));
        intersections.push(...intersectionOfParabolaAndLine(a, transformedBottomLeftCorner, transformedBottomRightCorner));
        intersections.push(...intersectionOfParabolaAndLine(a, transformedTopLeftCorner, transformedBottomLeftCorner));
        intersections.push(...intersectionOfParabolaAndLine(a, transformedTopRightCorner, transformedBottomRightCorner));
        const startPoint = intersections.reduce((min, point) => {
            return point.x < min.x ? point : min;
        });
        const endPoint = intersections.reduce((max, point) => {
            return point.x > max.x ? point : max;
        });
        console.log(startPoint);
    }
    else {
        startPoint = {x: startPos, y: parabola(startPos)};  
        endPoint = {x: endPos, y: parabola(endPos)};
    }
    controlPoint = intersectionOfTangentLines(startPoint, endPoint, a);

    // Rotation.
    rotatedStartPoint = rotate(startPoint, focus, radian);
    rotatedControlPoint = rotate(controlPoint, focus, radian);
    rotatedEndPoint = rotate(endPoint, focus, radian);

    // Translation.
    translatedStartPoint = translate(rotatedStartPoint, deltaX, deltaY);
    translatedControlPoint = translate(rotatedControlPoint, deltaX, deltaY);
    translatedEndPoint = translate(rotatedEndPoint, deltaX, deltaY);

    // Draw the parabola using quadratic Bezier curve.
    ctx.beginPath();
    ctx.moveTo(translatedStartPoint.x, translatedStartPoint.y);
    ctx.quadraticCurveTo(translatedControlPoint.x, translatedControlPoint.y, 
                         translatedEndPoint.x, translatedEndPoint.y);
    ctx.stroke();
}

/*
Draws a parabola on the canvas.
The parabola can be transformed with translation and rotation.
@param {CanvasRenderingContext2D} ctx - The rendering context for the canvas.
@param {number} x - The x-axis (horizontal) coordinate of the parabola's focus.
@param {number} y - The y-axis (vertical) coordinate of the parabola's focus.
@param {number} a - The focal length of the parabola, where the focus is located at (0, a) and the directrix at y = -a before any transformations. 
@param {number} rotation - The angle of rotation around the focus, in radians.
@param {number} startPos - Optional. Default is 0. The initial x-coordinate for defining the portion of the parabola to draw, before any transformations are applied.
                           After transformations, this corresponds to a distance along the directrix.
                           The value 0 represents the point where the line perpendicular to the directrix, passing through the focus, intersects the directrix. 
@param {number} endPos - Optional. Default is 0. The final x-coordinate for defining the portion of the parabola to draw, before any transformations. 
                         If startPos equals endPos, the range will be calculated automatically to fit the canvas.
@param {boolean} counterclockwise - Optional. Default is false. If true, the parabola is drawn counterclockwise; otherwise, it is drawn clockwise. 
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
    function intersectionOfParabolaAndLine(a, point1, point2, epsilon = 0.001) {
        let intersections = [];
        const x1 = point1.x;
        const y1 = point1.y;
        const x2 = point2.x;
        const y2 = point2.y;
        if (Math.abs(x1-x2) < epsilon) {  // When the line is vertical.
            intersections.push({x: x1, y: parabola(x1)});
        }
        else {
            const slope = (y2 - y1) / (x2 - x1);
            const intercept = y1 - slope * x1;
            const discriminant = 4 * a * (a * slope **2 + intercept);
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

    // Function to calculate the cross product of vectors p1p2 and p1p3.
    function crossProduct(point1, point2, point3) {
        return (point2.x - point1.x) * (point3.y - point1.y)
             - (point2.y - point1.y) * (point3.x - point1.x);
    }

    // Filter the points in the rectangle whose corners are corner1, corner2, corner3 and corner4 (defined in cyclically order)
    function filterInRectangle(intersections, corner1, corner2, corner3, corner4, epsilon = 0.001) {
        return intersections.filter(point => {
            // Calculate the cross product for each edge and the point
            const cross1 = crossProduct(corner1, corner2, point);
            const cross2 = crossProduct(corner2, corner3, point);
            const cross3 = crossProduct(corner3, corner4, point);
            const cross4 = crossProduct(corner4, corner1, point);

            // Check if all cross products are non-negative or non-positive (on the same side of all edges)
            return (cross1 >= - epsilon && cross2 >= - epsilon && cross3 >= - epsilon && cross4 >= - epsilon) ||
                   (cross1 <= epsilon && cross2 <= epsilon && cross3 <= epsilon && cross4 <= epsilon);
        });
    }

    // Draw parabola using quadratic Bezier curve.
    // Note that the Bezier curve is affine invariant, meaning that an affine transformation of its control points produces 
    // the same result as constructing the curve first and then applying the transformation.
    const focus = {x: 0, y: a};  // Focus of the parabola before any transformations.
    // Start point (1st control point), control point (2nd control point) and end point (3rd control point) of the quadratic Bezier curve before any transformations.
    let startPoint, controlPoint, endPoint;
    let rotatedStartPoint, rotatedControlPoint, rotatedEndPoint;  // Rotated points.
    let translatedStartPoint, translatedControlPoint, translatedEndPoint;  // Rotated and translated points.
    const radian = counterclockwise ? -rotation : rotation; // Radian for rotation.
    const deltaX = x;  // Delta x for translation.
    const deltaY = y - a;  // Delta y for translation.
    const epsilon = 0.001;  // A small value to account for calculation errors.

    if (startPos == endPos) {  // When the drawing range is automatically calculated to fall within the canvas.
        // Calculate the intersections of frame lines and parabola.
        const width = ctx.canvas.width; // Canvas width.
        const height = ctx.canvas.height; // Canvas height.
        // Corners of the canvas frame after transformations of the parabola.
        const topLeftCorner     = {x:     0, y:      0};
        const topRightCorner    = {x: width, y:      0};
        const bottomLeftCorner  = {x:     0, y: height};
        const bottomRightCorner = {x: width, y: height};
        
        // Corners of the canvas frame before any transformations of the parabola.
        const transformedTopLeftCorner     = rotate(translate(    topLeftCorner, - deltaX, - deltaY), focus, - radian);
        const transformedTopRightCorner    = rotate(translate(   topRightCorner, - deltaX, - deltaY), focus, - radian);
        const transformedBottomLeftCorner  = rotate(translate( bottomLeftCorner, - deltaX, - deltaY), focus, - radian);
        const transformedBottomRightCorner = rotate(translate(bottomRightCorner, - deltaX, - deltaY), focus, - radian);

        // Intersections of the parabola and transformed frame lines before any transformations of the parabola.
        let intersections = [];
        intersections.push(...intersectionOfParabolaAndLine(a,    transformedTopLeftCorner,    transformedTopRightCorner, epsilon));
        intersections.push(...intersectionOfParabolaAndLine(a, transformedBottomLeftCorner, transformedBottomRightCorner, epsilon));
        intersections.push(...intersectionOfParabolaAndLine(a,    transformedTopLeftCorner,  transformedBottomLeftCorner, epsilon));
        intersections.push(...intersectionOfParabolaAndLine(a,   transformedTopRightCorner, transformedBottomRightCorner, epsilon));
        // Select the points in the rectangle constructed from the frame lines.
        intersections = filterInRectangle(intersections, transformedTopLeftCorner, transformedTopRightCorner,
                                          transformedBottomRightCorner, transformedBottomLeftCorner, epsilon);
        // The startPoint is the point with the smallest x-coordinate (leftmost point).
        startPoint = intersections.reduce((min, point) => {
            return point.x < min.x ? point : min;
        });
        // The endPoint is the point with the largest x-coordinate (rightmost point).
        endPoint = intersections.reduce((max, point) => {
            return point.x > max.x ? point : max;
        });
    }
    else {  // When the drawing range is specified as parameters.
        startPoint = {x: startPos, y: parabola(startPos)};  
        endPoint =   {x: endPos,   y: parabola(endPos)};
    }
    // The second control point of a quadratic Bezier curve is the intersection of the tangents to the first and third control points.
    controlPoint = intersectionOfTangentLines(startPoint, endPoint, a);

    // Rotate control points.
    rotatedStartPoint   = rotate(startPoint,   focus, radian);
    rotatedControlPoint = rotate(controlPoint, focus, radian);
    rotatedEndPoint     = rotate(endPoint,     focus, radian);

    // Translate control points.
    translatedStartPoint   = translate(rotatedStartPoint,   deltaX, deltaY);
    translatedControlPoint = translate(rotatedControlPoint, deltaX, deltaY);
    translatedEndPoint     = translate(rotatedEndPoint,     deltaX, deltaY);

    // Draw the parabola using quadratic Bezier curve.
    // The first and third control points are the endpoints of the Bezier curve, as well as the endpoints of the segment of the parabola.
    ctx.beginPath();
    ctx.moveTo(translatedStartPoint.x, translatedStartPoint.y);
    ctx.quadraticCurveTo(translatedControlPoint.x, translatedControlPoint.y, 
                         translatedEndPoint.x, translatedEndPoint.y);
    ctx.stroke();
}

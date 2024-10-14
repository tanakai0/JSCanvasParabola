/*
Draws a parabola on the canvas.
@param {CanvasRenderingContext2D} ctx - rendering context for the canvas
@param {number} x - The x-axis (horizontal) coordinate of the parabola's focus.
@param {number} y - The y-axis (vertical) coordinate of the parabola's focus.
@param {number} a - The focal length of the parabola, where the focus is located at (0, a) and the directrix at y = -a before rotation. 
@param {number} rotation - The rotation of the parabola around the focus, expressed in radians.
@param {number} startPos - The starting x-coordinate on the x-axis for drawing the portion of the parabola.
@param {number} endPos - The ending x-coordinate on the x-axis for drawing the portion of the parabola.
*/
function drawParabola(ctx, x, y, a, rotation, startPos, endPos) {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(cpX, cpY, endX, endY);
    ctx.stroke();
}

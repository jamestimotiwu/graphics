/**
 * @file Procedural Terrain Generator
 * @author James Timotiwu <jit2@illinois.edu>
*/

/* Vertex buffer */
var vertexBuffer = [];

/* Triangle buffer */
var triangleBuffer = [];

/* Normal buffer */
var normalBuffer = [];

/* Terrain colors */
var colorBuffer = [];

/* Terrain color thresholds */
var colorThresholds = [];

/* Num vertices */
var numVertices = 0;

/* Num faces */
var numFaces = 0;

/* 1. Write procedural generation */
/* Create flat triangulated surface */
/* Produce triangles */
/* Generate tessellated quadrilateral / divide rectangles up into triangles */
/* Generate tessellated quad using recursion / iteration */

/**
 * 
 * @param {*} div - number of subdivisions in plane
 * @param {*} min_x 
 * @param {*} max_x 
 * @param {*} min_y 
 * @param {*} max_y 
 * @param {*} vertex_array 
 */
function generatePlane(div, minX, maxX, minY, maxY) {
    /* Subdivided plane size */
    let deltaX = (this.maxX - this.minX) / div;
    let deltaY = (this.maxY - this.minY) / div;

    for (let i = 0; i <= div; i++) {
        for (let j = 0; j <= div, j++) {
            vertexBuffer.push(minX + deltaX * j);
            vertexBuffer.push(minY + deltaY * i);
            vertexBuffer.push(0);

            normalBuffer.push(0);
            normalBuffer.push(0);
            normalBuffer.push(1);
        }
    }

    for (let i = 0; i < div; i++) {
        for (let j = 0; j < div; j++) {
            var divAddr = i * (div + 1) + j;
            triangleBuffer.push(divAddr);
            triangleBuffer.push(divAddr + 1);
            triangleBuffer.push(divAddr + div + 1);

            triangleBuffer.push(divAddr + 1);
            triangleBuffer.push(divAddr + 1 + div + 1);
            triangleBuffer.push(divAddr + div + 1);
        }
    }

    numVertices = triangleBuffer.length/3;
    numFaces = triangleBuffer.length/3;
}

function setVertex(v, i, j) {

}

function getVertex(i, j) {

}

function setNormal(n, i, j) {

}

function getNormal(i, j) {
    
}

function generateTerrain() {
    return 0;
}

function generateNormals() {

}

function initializeTerrain() {

}


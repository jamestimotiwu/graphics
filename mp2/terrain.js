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
            let divAddr = i * (div + 1) + j;
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
    let divAddr = 3 * (i * (div + 1) + j);
    
    /* Set vertex */
    vertexBuffer[divAddr] = v[0];
    vertexBuffer[divAddr + 1] = v[1];
    vertexBuffer[divAddr + 2] = v[2];
}

function getVertex(i, j) {
    let divAddr = 3 * (i * (div + 1) + j);
    let v = [0, 0, 0]

    /* Get vertex */
    v[0] = vertexBuffer[divAddr];
    v[1] = vertexBuffer[divAddr + 1];
    v[2] = vertexBuffer[divAddr + 2];

    return v;
}

function setNormal(n, i, j) {
    let divAddr = 3 * (i * (div + 1) + j);
    
    /* Set vertex */
    normalBuffer[divAddr] = n[0];
    normalBuffer[divAddr + 1] = n[1];
    normalBuffer[divAddr + 2] = n[2];
}

function getNormal(i, j) {
    let divAddr = 3 * (i * (div + 1) + j);
    let v = [0, 0, 0]

    /* Get vertex */
    v[0] = normalBuffer[divAddr];
    v[1] = normalBuffer[divAddr + 1];
    v[2] = normalBuffer[divAddr + 2];

    return v;    
}

function generateTerrain(div, minX, maxX, minY, maxY) {
    let deltaZ = 0.005;
    let iterations = 60;
    /* 0. Iterate over randomly generated planes follow below */
    for (var o = 0; o <= iterations; o++) {
        /* 1. Choose random point within maxX and minX */
        let randomX = minX + Math.random()*(maxX - minX);
        let randomY = minY + Math.random()*(maxY - minY);

        /* 2. Generate random normal vector n for the plane <X_n, Y_n, 0> */
        //var random_x_n = Math.random() - 0.5;
        //var random_y_n = Math.random() - 0.5;
        let randomX_n = Math.cos(Math.random() * (Math.PI * 2));
        let randomY_n = Math.sin(Math.random() * (Math.PI * 2));

        for (let i = 0; i <= div; i++) {
            for (let j = 0; j <= div; j++) {
                /* 3. Given vertex b, test which side of plane that vertex falls on using dot product test*/

                let curr = [0, 0, 0];
                getVertex(curr, i, j);

                /* 4. Dot product test: (b-p) * n > 0 s.t. b is the current vertex, p is the random point*/
                let side = vec3.fromValues(curr[0] - randomX, curr[1] - randomY, 0);
                let dot_p = vec3.dot(side, vec3.fromValues(randomX_n, randomY_n, 0));

                if (dot_p > 0) {
                    curr[2] += deltaZ;
                } else {
                    curr[2] -= deltaZ;
                }

                setVertex(curr, i, j);
            }
        }
    }
}

function generateNormals() {

}

function initializeTerrain() {

}


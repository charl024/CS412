function createShader(gl, type, source) {
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader));
    }
    return shader;
}

function createProgram(gl, vsSource, fsSource) {
    let vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
    let fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    let prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(prog));
    }
    return prog;
}

// WebGL setup
const canvas = document.getElementById("glcanvas");
const gl = canvas.getContext("webgl2");
if (!gl) alert("WebGL2 not supported");

let vertEditor = document.getElementById("vertEditor");
let fragEditor = document.getElementById("fragEditor");
vertEditor.value = document.getElementById("vertex-shader").textContent;
fragEditor.value = document.getElementById("fragment-shader").textContent;

let program, posLoc, colorLoc, uMVM, uPM, uMTM;
let vbo, nbo, ibo;

// Buffers
function initBuffers(vertices, indices, colors) {
    vbo = gl.createBuffer();  
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    nbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nbo);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

    ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
}

function initShaderProgram() {
    try {
    program = createProgram(gl, vertEditor.value, fragEditor.value);
    gl.useProgram(program);
    posLoc = gl.getAttribLocation(program, "aPosition");
    colorLoc = gl.getAttribLocation(program, "aColor");
    timeLoc = gl.getUniformLocation(program, "uTime");
    uMVM = gl.getUniformLocation(program, "uModelViewMatrix");
    uPM = gl.getUniformLocation(program, "uProjectionMatrix");
    uMTM = gl.getUniformLocation(program, "uModelTransformationMatrix");
    } catch (e) { console.error(e); }
}

initShaderProgram();
vertEditor.onkeyup = initShaderProgram;
fragEditor.onkeyup = initShaderProgram;

// Mouse and keyboard interactions
let mouseDown = false, lastX, lastY, rotX = 0, rotY = 0;
let camX = 0, camY = 0, camZ = -6;

canvas.addEventListener('mousedown', e => {
    mouseDown = true;
    lastX = e.clientX; lastY = e.clientY;
});

canvas.addEventListener('mouseup', () => mouseDown = false);

canvas.addEventListener('mousemove', e => {
    if (!mouseDown) return;
    let dx = e.clientX - lastX;
    let dy = e.clientY - lastY;
    rotY += dx * 0.01;
    rotX += dy * 0.01;
    lastX = e.clientX; lastY = e.clientY;
});

document.addEventListener('keydown', e => {
    const step = 0.2;
    switch (e.key) {
    case 'ArrowUp': camY -= step; break;
    case 'ArrowDown': camY += step; break;
    case 'ArrowLeft': camX += step; break;
    case 'ArrowRight': camX -= step; break;
    case 'w': camZ += step; break;
    case 's': camZ -= step; break;
    }
});

let fov = Math.PI / 4, aspect = canvas.width / canvas.height, zNear = 0.1, zFar = 100;
let f = 1 / Math.tan(fov / 2);
let proj = new Float32Array([
    f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (zFar + zNear) / (zNear - zFar), -1, 0, 0, (2 * zFar * zNear) / (zNear - zFar), 0
]);

let startTime = Date.now();

initBuffers(cube_vertices, cube_indices, cube_colors);


let figure = [];
let num_segments = 2;
let model = new Model(num_segments, mat4Identity(),figure);

model.add_children(0,1);

function drawCube() {
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, nbo);
    gl.enableVertexAttribArray(colorLoc);
    gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.drawElements(gl.TRIANGLES, cube_indices.length, gl.UNSIGNED_SHORT, 0);
}

function render() {
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // rotation matrices
    let cx = Math.cos(rotY), sx = Math.sin(rotY);
    let cy = Math.cos(rotX), sy = Math.sin(rotX);
    let rotX_mat = [1, 0, 0, 0, 0, cy, sy, 0, 0, -sy, cy, 0, 0, 0, 0, 1];
    let rotY_mat = [cx, 0, -sx, 0, 0, 1, 0, 0, sx, 0, cx, 0, 0, 0, 0, 1];
    let shapeRotation = multiplyMat4(rotY_mat, rotX_mat);

    // init model-view matrix as identity matrix
    let modelViewMatrix = mat4Identity();
    // camera translation
    modelViewMatrix = mat4Translate(modelViewMatrix, [camX, camY, camZ]);

    //delta time in ms
    let deltaTime = Date.now() - startTime;
    
    gl.uniformMatrix4fv(uPM, false, proj);
    gl.uniformMatrix4fv(uMVM, false, modelViewMatrix);

    //set time in seconds
    gl.uniform1f(timeLoc, deltaTime/1000.0);

    
    model.set_mvm(modelViewMatrix);
    model.traverse(0);
}

// Initialize when page loads
window.onload = function () {
    setInterval(render, 30);
}
function create_shader(gl, type, source) {
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader));
    }
    return shader;
}

function create_program(gl, vsSource, fsSource) {
    let vs = create_shader(gl, gl.VERTEX_SHADER, vsSource);
    let fs = create_shader(gl, gl.FRAGMENT_SHADER, fsSource);
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

let vert_editor = document.getElementById("vertEditor");
let frag_editor = document.getElementById("fragEditor");
vert_editor.value = document.getElementById("vertex-shader").textContent;
frag_editor.value = document.getElementById("fragment-shader").textContent;

let program, posLoc, colorLoc, uMVM, uPM, uMTM;
let vbo, nbo, ibo;

// Buffers
function init_buffers(vertices, indices, colors) {
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

function init_shader_program() {
    try {
    program = create_program(gl, vert_editor.value, frag_editor.value);
    gl.useProgram(program);
    posLoc = gl.getAttribLocation(program, "aPosition");
    colorLoc = gl.getAttribLocation(program, "aColor");
    timeLoc = gl.getUniformLocation(program, "uTime");
    uMVM = gl.getUniformLocation(program, "uModelViewMatrix");
    uPM = gl.getUniformLocation(program, "uProjectionMatrix");
    uMTM = gl.getUniformLocation(program, "uModelTransformationMatrix");
    } catch (e) { console.error(e); }
}

init_shader_program();

vert_editor.onkeyup = init_shader_program;
frag_editor.onkeyup = init_shader_program;

// Mouse and keyboard interactions
let mouseDown = false, lastX, lastY, rotX = 0.3, rotY = 0;
let camX = 0, camY = -3, camZ = -20;

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

// Keyboard controls for camera movement
const keys = {};
document.addEventListener('keydown', e => keys[e.key] = true);
document.addEventListener('keyup', e => keys[e.key] = false);

let targetZ = camZ;

addEventListener("wheel", (e) => {
    targetZ += (-1) * e.deltaY * 0.01;
});

function update_camera(dt) {
    const speed = 4.0;
    if (keys['w']) camY -= speed * dt;
    if (keys['s']) camY += speed * dt;
    if (keys['a']) camX += speed * dt;
    if (keys['d']) camX -= speed * dt;

    camZ += (targetZ - camZ) * 5 * dt;
}

// Projection matrix
let fov = Math.PI / 4, aspect = canvas.width / canvas.height, zNear = 0.1, zFar = 100;
let f = 1 / Math.tan(fov / 2);
// let proj = new Float32Array([
//     f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (zFar + zNear) / (zNear - zFar), -1, 0, 0, (2 * zFar * zNear) / (zNear - zFar), 0
// ]);

let proj = perspective(fov, aspect, zNear, zFar);

// Animation loop
let last_time = Date.now();
let start_time = Date.now();

// Initialize primitives
const {vertices: cube_body_vertices, indices: cube_body_indices} = cube_data();
const cube_body_colors = generate_colors([242.0/255.0, 0.6, 122.0/255.0], cube_body_vertices.length / 3);
const cube_body = new Shape(gl, program, cube_body_vertices, cube_body_indices, cube_body_colors);

const {vertices: pyramid_fin_vertices, indices: pyramid_fin_indices} = pyramid_data();
const pyramid_fin_colors = generate_colors([0.5, 0.0, 0.5], pyramid_fin_vertices.length / 3);
const pyramid_fin = new Shape(gl, program, pyramid_fin_vertices, pyramid_fin_indices, pyramid_fin_colors);

const {vertices: cone_body_vertices, indices: cone_body_indices} = cone_data(30, 30, 1.0, 2.0);
const cone_body_colors = generate_colors([242.0/255.0, 0.7, 122.0/255.0], cone_body_vertices.length / 3);
const cone_body = new Shape(gl, program, cone_body_vertices, cone_body_indices, cone_body_colors);

const {vertices: cylinder_body_vertices, indices: cylinder_body_indices} = cylinder_data(30, 30, 1.0, 2.0);
const cylinder_body_colors = generate_colors([242.0/255.0, 0.7, 122.0/255.0], cylinder_body_vertices.length / 3);
const cylinder_body = new Shape(gl, program, cylinder_body_vertices, cylinder_body_indices, cylinder_body_colors);

const {vertices: sphere_head_vertices, indices: sphere_head_indices} = sphere_data(30, 30, 1.0);
const sphere_head_colors = generate_colors([242.0/255.0, 0.5, 122.0/255.0], sphere_head_vertices.length / 3);
const sphere_head = new Shape(gl, program, sphere_head_vertices, sphere_head_indices, sphere_head_colors);

const {vertices: sphere_eye_vertices, indices: sphere_eye_indices} = sphere_data(30, 30, 1.0);
const sphere_eye_colors = generate_colors([0.0, 0.0, 0.0], sphere_eye_vertices.length / 3);
const sphere_eye = new Shape(gl, program, sphere_eye_vertices, sphere_eye_indices, sphere_eye_colors);


// Hierarchical model setup
let figure = [];
let num_segments = 13;
let model = new Model(num_segments,  mat4Identity(), figure);

model.add_children(0,1);
model.add_children(1,2);
model.add_children(2,3);
model.add_children(3,4);
model.add_children(4,5);
model.add_children(0, 6);
model.add_children(6, 7);
model.add_children(0, 8);
model.add_children(0, 9);
model.add_children(0, 10);
model.add_children(7, 11);
model.add_children(7, 12);

// interactive ui
let spinrate = 0.1;

const spinrate_slider = document.getElementById("spinrateSlider");
const spinrate_value = document.getElementById("spinrateValue");

spinrate_slider.addEventListener("input", () => {
  spinrate = parseFloat(spinrate_slider.value);
  spinrate_value.textContent = spinrate.toFixed(2);
})

let oscillationrate = 1.0;

const oscillationrate_silder = document.getElementById("oscillationSlider");
const oscillationrate_value = document.getElementById("oscillationValue");

oscillationrate_silder.addEventListener("input", () => {
  oscillationrate = parseFloat(oscillationrate_silder.value);
  oscillationrate_value.textContent = oscillationrate.toFixed(2);
})

// rendering
function render() {
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(197/255, 248/255, 243/255, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // rotation matrices
    let cx = Math.cos(rotY), sx = Math.sin(rotY);
    let cy = Math.cos(rotX), sy = Math.sin(rotX);
    let rotX_mat = [1, 0, 0, 0, 0, cy, sy, 0, 0, -sy, cy, 0, 0, 0, 0, 1];
    let rotY_mat = [cx, 0, -sx, 0, 0, 1, 0, 0, sx, 0, cx, 0, 0, 0, 0, 1];
    let shape_rotation = multiplyMat4(rotY_mat, rotX_mat);

    // init model-view matrix as identity matrix
    let model_view_matrix = mat4Identity();
    // camera translation
    model_view_matrix = mat4Translate(model_view_matrix, [camX, camY, camZ]);
    // model_view_matrix = multiplyMat4(model_view_matrix, shape_rotation);

    let model_transformation_matrix = mat4Identity();
    model_transformation_matrix = multiplyMat4(model_transformation_matrix, shape_rotation);

    //delta time in ms
    let current_time = Date.now();
    let delta_time = (current_time - last_time)/1000.0;
    let elapsed_time = (current_time - start_time)/1000.0;
    last_time = current_time;
    update_camera(delta_time);

    // set the uniforms
    gl.uniformMatrix4fv(uPM, false, proj);
    gl.uniformMatrix4fv(uMVM, false, model_view_matrix);
    gl.uniformMatrix4fv(uMTM, false, model_transformation_matrix);

    //set time in seconds
    gl.uniform1f(timeLoc, elapsed_time);

    // draw the model
    model.set_mtm(model_transformation_matrix);
    model.update_dynamic_params(elapsed_time, delta_time, spinrate, oscillationrate);
    model.update_node_transform(0);
    model.walk(0);

    requestAnimationFrame(render);
}

// Initialize when page loads
window.onload = function () {
    requestAnimationFrame(render);
}
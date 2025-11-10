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

const vertex_shader_src = document.getElementById("vertex-shader").textContent.trim();
const fragment_shader_src = document.getElementById("fragment-shader").textContent.trim();

let program, posLoc, colorLoc, uMVM, uPM, uMTM;
let uKa, uKd, uKs, uAlpha, uViewPos, uAttOn;
let uTex, uBumpStrength, uBumpOn;
let uLightPos1, uLightPos2, uLightColor1, uLightColor2;

const material_uniforms = {
    uKa, 
    uKd, 
    uKs, 
    uAlpha,
    uBumpOn
};

function init_shader_program() {
    try {
    program = create_program(gl, vertex_shader_src, fragment_shader_src);
    gl.useProgram(program);

    posLoc = gl.getAttribLocation(program, "aPosition");
    colorLoc = gl.getAttribLocation(program, "aColor");
    timeLoc = gl.getUniformLocation(program, "uTime");
    uMVM = gl.getUniformLocation(program, "uModelViewMatrix");
    uPM = gl.getUniformLocation(program, "uProjectionMatrix");
    uMTM = gl.getUniformLocation(program, "uModelTransformationMatrix");

    material_uniforms.uKa = gl.getUniformLocation(program, "uKa");
    material_uniforms.uKd = gl.getUniformLocation(program, "uKd");
    material_uniforms.uKs = gl.getUniformLocation(program, "uKs");
    material_uniforms.uAlpha = gl.getUniformLocation(program, "uAlpha");

    uLightPos1 = gl.getUniformLocation(program, "uLightPos1");
    uLightPos2 = gl.getUniformLocation(program, "uLightPos2");
    uLightColor1 = gl.getUniformLocation(program, "uLightColor1");
    uLightColor2 = gl.getUniformLocation(program, "uLightColor2");

    uViewPos = gl.getUniformLocation(program, "uViewPos");
    uAttOn = gl.getUniformLocation(program, "uAttBool")

    uTex = gl.getUniformLocation(program, "uTex");
    uBumpStrength = gl.getUniformLocation(program, "uBumpStrength");
    material_uniforms.uBumpOn = gl.getUniformLocation(program, "uBumpOn");

    } catch (e) { 
        console.error(e); 
    }
}

init_shader_program();

// Mouse and keyboard interactions
let mouseDown = false, lastX, lastY, rotX = 0.1, rotY = 0.0;
let camX = 0, camY = 0, camZ = -5;

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
let fov = Math.PI / 3, aspect = canvas.width / canvas.height, zNear = 0.1, zFar = 100;
let f = 1 / Math.tan(fov / 2);

let proj = perspective(fov, aspect, zNear, zFar);

// texture setup
const rocky_terrain_img = "./textures/rocky_terrain_tex.png";
const river_pebbles_img = "./textures/river_pebbles_tex.png";
const riverbed_rock_img = "./textures/riverbed_rock_tex.png";
const mud_cracked_img   = "./textures/mud_cracked_tex.png";
const concrete_floor_img = "./textures/concrete_floor_tex.jpg";
const decrepit_wallpaper_img = "./textures/decrepit_wallpaper_tex.jpg";
const ceiling_interior_img = "./textures/ceiling_interior_tex.jpg";
const worn_planks_img = "./textures/worn_planks_tex.jpg";
const black_painted_planks_img = "./textures/black_painted_planks_tex.jpg";
const wood_table_img = "./textures/wood_table_tex.jpg";
const fabric_black_img = "./textures/fabric_black_tex.jpg";
const rusty_metal_img_type1 = "./textures/rusty_metal1_tex.jpg";
const rusty_metal_img_type2 = "./textures/rusty_metal2_tex.jpg";

const tv_static_vid = "./textures/tv_static.webm";
const tv_channel1_vid = "./textures/tv_channel_1.webm";
const tv_channel2_vid = "./textures/tv_channel_2.webm";
const tv_channel3_vid = "./textures/tv_channel_3.webm";
const tv_channel4_vid = "./textures/tv_channel_4.webm";

const tv_static = document.createElement("video");
tv_static.src = tv_static_vid;
tv_static.autoplay = true;
tv_static.loop = true;
tv_static.muted = true;
tv_static.playsInline = true;
tv_static.play();

const tv_channel1 = document.createElement("video");
tv_channel1.src = tv_channel1_vid;
tv_channel1.autoplay = true;
tv_channel1.loop = true;
tv_channel1.muted = true;
tv_channel1.playsInline = true;
tv_channel1.play();

const tv_channel2 = document.createElement("video");
tv_channel2.src = tv_channel2_vid;
tv_channel2.autoplay = true;
tv_channel2.loop = true;
tv_channel2.muted = true;
tv_channel2.playsInline = true;
tv_channel2.play();

const tv_channel3 = document.createElement("video");
tv_channel3.src = tv_channel3_vid;
tv_channel3.autoplay = true;
tv_channel3.loop = true;
tv_channel3.muted = true;
tv_channel3.playsInline = true;
tv_channel3.play();

const tv_channel4 = document.createElement("video");
tv_channel4.src = tv_channel4_vid;
tv_channel4.autoplay = true;
tv_channel4.loop = true;
tv_channel4.muted = true;
tv_channel4.playsInline = true;
tv_channel4.play();

// shape setup
const cube_ground_type1 = makeShape(gl, program, cube_data, concrete_floor_img, ground_material);
const cube_wall_type1 = makeShape(gl, program, cube_data, decrepit_wallpaper_img, wallpaper_old_material);
const cube_ceil_type1 = makeShape(gl, program, cube_data, worn_planks_img, ground_material);
const cube_table_black = makeShape(gl, program, cube_data, black_painted_planks_img, ground_material);
const cube_fabric_black = makeShape(gl, program, cube_data, fabric_black_img, black_plastic_material);

let cube_tv_screen = makeShape(gl, program, cube_data, tv_static, tv_screen_material);

const cone_table_leg = makeShape(gl, program, () => cone_data(30, 30, 1.0, 1.0), black_painted_planks_img, wood_material);
const cylinder_metal_rusty_type1 = makeShape(gl, program, () => cylinder_data(30, 30, 1.0, 1.0), rusty_metal_img_type1, metal_gray_material);
const cylinder_metal_rusty_type2 = makeShape(gl, program, () => cylinder_data(30, 30, 1.0, 1.0), rusty_metal_img_type2, metal_gray_material);


// Hierarchical model setup
let figure = [];
let num_segments = 19;
let model = new Model(num_segments,  mat4Identity(), figure);

model.add_children(0, 1);
model.add_children(0, 2);
model.add_children(0, 3);
model.add_children(0, 4);
model.add_children(0, 5);
model.add_children(0, 6);
model.add_children(6, 7);
model.add_children(6, 8);
model.add_children(6, 9);
model.add_children(6, 10);
model.add_children(6, 11);
model.add_children(11, 12);
model.add_children(11, 13);
model.add_children(11, 14);
model.add_children(11, 15);
model.add_children(11, 16);
model.add_children(0, 17);
model.add_children(0, 18);



// lighting setup
let light_world_position1 = [0, 3, -5.75];
let light_world_position2 = [0, 3, -6.25];

let light_color1 = [0.7, 0.7, 0.7];
let light_color2 = [0.7, 0.7, 0.7];

let view_direction = [0, 0, 0];

// interactive ui
let spinrate = 0.1;

// const spinrate_slider = document.getElementById("spinrateSlider");
// const spinrate_value = document.getElementById("spinrateValue");

// spinrate_slider.addEventListener("input", () => {
//   spinrate = parseFloat(spinrate_slider.value);
//   spinrate_value.textContent = spinrate.toFixed(2);
// })

let bumpStrength = 100.0;

const bs_slider = document.getElementById("bumpStrengthSlider");
const bs_val = document.getElementById("bumpStrengthValue");

bs_slider.addEventListener("input", () => {
  bumpStrength = parseFloat(bs_slider.value);
  bs_val.textContent = bumpStrength.toFixed(2);
});

let oscillationrate = 1.0;

// const oscillationrate_silder = document.getElementById("oscillationSlider");
// const oscillationrate_value = document.getElementById("oscillationValue");

// oscillationrate_silder.addEventListener("input", () => {
//   oscillationrate = parseFloat(oscillationrate_silder.value);
//   oscillationrate_value.textContent = oscillationrate.toFixed(2);
// });

// const lightintensity_slider = document.getElementById("lightIntensitySlider");
// const lightintensity_value = document.getElementById("lightIntensityValue");

// let ambient_coeff = 0.5;

// lightintensity_slider.addEventListener("input", () => {
//   ambient_coeff = parseFloat(lightintensity_slider.value);
//   lightintensity_value.textContent = ambient_coeff.toFixed(2);
// });

// let attButton = false;

// document.getElementById("AttOnButton").addEventListener("click", () => {
//     attButton = !attButton;
// });

// let animationButton = false;

// document.getElementById("AnimationButton").addEventListener("click", () => {
//     animationButton = !animationButton;
// });

let currentChannel = 0;

document.getElementById("ChangeChannelButton").addEventListener("click", () => {
    currentChannel = (currentChannel + 1) % 5;
    switch (currentChannel) {
        case 0:
            cube_tv_screen.init_video_texture(tv_static);
            break;
        case 1:
            cube_tv_screen.init_video_texture(tv_channel1);
            break;
        case 2:
            cube_tv_screen.init_video_texture(tv_channel2);
            break;
        case 3:
            cube_tv_screen.init_video_texture(tv_channel3);
            break;
        case 4:
            cube_tv_screen.init_video_texture(tv_channel4);
            break;
    }

    model.figure[16].shape = cube_tv_screen;
});

let temperatureLights = false;

document.getElementById("TLButton").addEventListener("click", () => {
    temperatureLights = !temperatureLights;
}); 

function update_lights_pos(angle) {
    // light_world_position1 = [5 * Math.cos(angle), 5 * Math.sin(angle), 5];
    // light_world_position2 = [-5 * Math.cos(angle), -5 * Math.sin(angle), -5];

    if (temperatureLights) {
        light_color1 = [1.0, 0.6, 0.4];
        light_color2 = [0.4, 0.6, 1.0];
    } else {
        light_color1 = [0.7, 0.7, 0.7];
        light_color2 = [0.7, 0.7, 0.7];
    }
}

// texture setup
const rocky_terrain_tex = new Image();
rocky_terrain_tex.src = "./textures/river_pebbles_tex.png";


// Animation loop
let last_time = Date.now();
let start_time = Date.now();

// rendering
function render() {
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // rotation matrices
    let cx = Math.cos(rotY), sx = Math.sin(rotY);
    let cy = Math.cos(rotX), sy = Math.sin(rotX);
    let rotX_mat = [1, 0, 0, 0, 0, cy, sy, 0, 0, -sy, cy, 0, 0, 0, 0, 1];
    let rotY_mat = [cx, 0, -sx, 0, 0, 1, 0, 0, sx, 0, cx, 0, 0, 0, 0, 1];
    let shape_rotation = multiplyMat4(rotY_mat, rotX_mat);

    // init model-view matrix as identity matrix
    let model_view_matrix = mat4Identity();
    
    // view transformations
    model_view_matrix = multiplyMat4(model_view_matrix, shape_rotation);
    model_view_matrix = mat4Translate(model_view_matrix, [camX, camY, camZ]);


    let model_transformation_matrix = mat4Identity();
    // model_transformation_matrix = multiplyMat4(model_transformation_matrix, shape_rotation);

    //delta time in ms
    let current_time = Date.now();
    let delta_time = (current_time - last_time)/1000.0;
    let elapsed_time = (current_time - start_time)/1000.0;
    last_time = current_time;
    update_camera(delta_time);
    update_lights_pos(elapsed_time);

    // set the uniforms
    gl.uniformMatrix4fv(uPM, false, proj);
    gl.uniformMatrix4fv(uMVM, false, model_view_matrix);
    gl.uniformMatrix4fv(uMTM, false, model_transformation_matrix);

    gl.uniform3fv(uLightPos1, light_world_position1);
    gl.uniform3fv(uLightPos2, light_world_position2);
    gl.uniform3fv(uLightColor1, light_color1);
    gl.uniform3fv(uLightColor2, light_color2);

    gl.uniform3fv(uViewPos, view_direction);
    // gl.uniform1f(uAttOn, attButton);
    // gl.uniform1f(material_uniforms.uKa, ambient_coeff);
    gl.uniform1f(uBumpStrength, bumpStrength);

    //set time in seconds
    gl.uniform1f(timeLoc, elapsed_time);

    // draw the model
    model.set_mtm(model_transformation_matrix);
    
    // if (animationButton) {
    model.update_dynamic_params(elapsed_time, delta_time, spinrate, oscillationrate);
    // model.update_node_transform(0);
    // }
    
    model.walk(0);

    requestAnimationFrame(render);
}

// Initialize when page loads
window.onload = function () {
    requestAnimationFrame(render);
}
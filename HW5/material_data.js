
const ground_material = {   
    Kd: 0.4,
    Ks: 0.1,
    alpha: 10.0,
    color: colorconvert(200, 200, 200)
};

const wood_material = {   
    Kd: 0.2,
    Ks: 0.1,
    alpha: 10.0,
    color: colorconvert(205,170,125)
};

const hay_material = {   
    Kd: 0.3,
    Ks: 0.1,
    alpha: 1.0,
    color: colorconvert(218,197,134)
};

const metal_gray_material = {
    Kd: 0.2,
    Ks: 0.9,
    alpha: 1000.0,
    color: colorconvert(128, 128, 128)
};

const metal_orange_material = {
    Kd: 0.2,
    Ks: 0.9,
    alpha: 1000.0,
    color: colorconvert(252, 129, 0)
};

const metal_red_material = {
    Kd: 0.2,
    Ks: 0.9,
    alpha: 1000.0,
    color: colorconvert(244, 0, 0)
};

const candy_material = {
    Kd: 0.5,
    Ks: 0.5,
    alpha: 10.0,
    color: colorconvert(38, 180, 28)
}

const ball_material = {   
    Kd: 0.1,
    Ks: 0.1,
    alpha: 1.0,
    color: [1.0, 0.9, 1.0] 
};


function colorconvert(r, g, b) {
    return [r/255, g/255, b/255];
}
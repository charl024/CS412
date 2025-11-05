

class Shape {
    constructor(gl, program, geometry, material = {}) {
        this.gl = gl;
        this.program = program;

        this.vertices   = new Float32Array(geometry.vertices);
        this.indices    = new Uint16Array(geometry.indices);
        this.colors     = new Float32Array(geometry.colors);
        this.normals    = new Float32Array(geometry.normals);
        this.tex_coords = new Float32Array(geometry.tex_coords);

        this.material = {
            Kd: material.Kd ?? 0.5,
            Ks: material.Ks ?? 0.5,
            alpha: material.alpha ?? 10.0,
            color: material.color ?? [0.5, 0.5, 0.5]
        };

        this.segment_function

        this.buffer = new ShapeBuffer(gl, program, this.vertices, this.indices, this.colors, this.normals, this.tex_coords);
    }

    draw(uniforms) {
        const gl = this.gl;

        gl.useProgram(this.program);

        gl.uniform1f(uniforms.uKd, this.material.Kd);
        gl.uniform1f(uniforms.uKs, this.material.Ks);
        gl.uniform1f(uniforms.uAlpha, this.material.alpha);

        this.buffer.render();
    }
}

function makeShape(gl, program, geometry_func, material) {
    const geo = geometry_func();
    const colors = generate_colors(material.color, geo.vertices.length / 3);
    geo.colors = colors;
    return new Shape(gl, program, geo, material);
}
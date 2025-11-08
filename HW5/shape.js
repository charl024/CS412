

class Shape {
    constructor(gl, program, geometry, tex_img_src, material = {}) {
        this.gl = gl;
        this.program = program;

        this.vertices   = new Float32Array(geometry.vertices);
        this.indices    = new Uint16Array(geometry.indices);
        this.colors     = new Float32Array(geometry.colors);
        this.normals    = new Float32Array(geometry.normals);
        this.tex_coords = new Float32Array(geometry.tex_coords);
        this.tangents   = new Float32Array(geometry.tangents);

        this.is_tex_loaded = false;

        if (tex_img_src) {
            console.log("tex img src valid")
            this.texture = gl.createTexture();
            this.tex_img_src = tex_img_src;
            this.load_texture_src()
        }

        this.material = {
            Kd: material.Kd ?? 0.5,
            Ks: material.Ks ?? 0.5,
            alpha: material.alpha ?? 10.0,
            color: material.color ?? [0.5, 0.5, 0.5]
        };

        this.segment_function

        this.buffer = new ShapeBuffer(gl, program, this.vertices, this.indices, this.colors, this.normals, this.tex_coords, this.tangents);
    }

    load_texture_src() {
        const tex_img = new Image();
        tex_img.src = this.tex_img_src;
        tex_img.onload = () => {
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tex_img);
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        }
    }

    draw(uniforms) {
        const gl = this.gl;

        gl.useProgram(this.program);

        if (this.texture) {
            let unit = 0;
            gl.activeTexture(gl.TEXTURE0 + unit); 
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.uniform1i(gl.getUniformLocation(this.program, "uTex"), unit);
        }

        gl.uniform1f(uniforms.uKd, this.material.Kd);
        gl.uniform1f(uniforms.uKs, this.material.Ks);
        gl.uniform1f(uniforms.uAlpha, this.material.alpha);

        this.buffer.render();
    }
}

function makeShape(gl, program, geometry_func, tex_img_src, material) {
    const geo = geometry_func();
    const colors = generate_colors(material.color, geo.vertices.length / 3);
    geo.colors = colors;
    return new Shape(gl, program, geo, tex_img_src, material);
}
export class Renderer {
    constructor() {
        this.canvas = document.getElementById("glcanvas");
        this.gl = this.canvas.getContext("webgl2");
        if (!this.gl) {
            throw new Error("WebGL2 not supported");
        }

        this.vertEditor = document.getElementById("vertEditor");
        this.fragEditor = document.getElementById("fragEditor");

        this.vertEditor.value = document.getElementById("vertex-shader").textContent.trim();
        this.fragEditor.value = document.getElementById("fragment-shader").textContent.trim();

        this.program = null;
        this.attribs = {};
        this.uniforms = {};

        this.initShaderProgram();
        this.vertEditor.onkeyup = () => this.initShaderProgram();
        this.fragEditor.onkeyup = () => this.initShaderProgram();
    }


    createShader(type, source) {
        const gl = this.gl;
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        return shader;
    }

    createProgram(vsSource, fsSource) {
        const gl = this.gl;
        const vs = this.createShader(gl.VERTEX_SHADER, vsSource);
        const fs = this.createShader(gl.FRAGMENT_SHADER, fsSource);

        const prog = gl.createProgram();
        gl.attachShader(prog, vs);
        gl.attachShader(prog, fs);
        gl.linkProgram(prog);

        return prog;
    }


    initShaderProgram() {
        const gl = this.gl;
        try {
            this.program = this.createProgram(
                this.vertEditor.value,
                this.fragEditor.value
            );
            gl.useProgram(this.program);

            this.attribs.aPosition = gl.getAttribLocation(this.program, "aPosition");
            this.attribs.aColor = gl.getAttribLocation(this.program, "aColor");

            this.uniforms.uTime = gl.getUniformLocation(this.program, "uTime");
            this.uniforms.uModelViewMatrix = gl.getUniformLocation(this.program, "uModelViewMatrix");
            this.uniforms.uProjectionMatrix = gl.getUniformLocation(this.program, "uProjectionMatrix");
            this.uniforms.uModelTransformationMatrix = gl.getUniformLocation(this.program, "uModelTransformationMatrix");

        } catch (e) {
            console.error("shader init failed:", e.message);
        }
    }
}

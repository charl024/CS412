// Model.js
// The code for the Model class that handles hierarchical modeling in WebGL can be sourced from
// code snippets provided from the 7th Edition of "Interactive Computer Graphics" by Edward Angel, in chapter 9

class Model {
    constructor(num_segments, model_transformation_matrix, figure) {
        this.num_segments = num_segments;
        this.model_transformation_matrix = model_transformation_matrix;
        this.figure = figure;
        this.mat_stack = [];

        this.dynamic_angle = 0.0;
        this.dt = 0.0;
        this.spinrate = 0.1;
        this.spinphase = 0.0;
        this.oscillationrate = 1.0;

        this.figure_init(this.num_segments);

        for (var i = 0; i < this.num_segments; i++) {
            this.init_node(i);
        }
    }

    set_mtm( model_transformation_matrix) {
        this.model_transformation_matrix = model_transformation_matrix;
    }

    update_dynamic_params(angle, dt, spinrate, oscillationrate) {
        this.dynamic_angle = angle; 
        this.dt = dt;
        this.spinrate = spinrate;
        this.oscillationrate = oscillationrate;
    }

    walk(idx) {
        if (idx == null) {
            return;
        }

        const node = this.figure[idx];

        // save state
        this.mat_stack.push(this.model_transformation_matrix);
        // apply local transformation
        this.model_transformation_matrix = multiplyMat4(this.model_transformation_matrix, node.transform);
        // apply this node's world transformation
        this.figure[idx].wtransform();
        // draw the figure
        this.figure[idx].shape.draw(material_uniforms);

        if (node.children != null) {
            for (var i = 0; i < node.children.length; i++) {
                this.walk(node.children[i]);
            }
        }

        // restore state
        this.model_transformation_matrix = this.mat_stack.pop();
    }

    create_node(idx, transform, wtransform, children, shape) {
        var node = {
            idx: idx,
            transform: transform,
            itransform: transform,
            wtransform: wtransform,
            children: children,
            shape: shape,

            local_angle: {x : 0.0, y : 0.0, z : 0.0},
            rotation_dir: {x : 1, y : 1, z : 1}
        };
        return node;
    }

    update_node_transform(idx) {
        if (idx == null) {
            return;
        }
        const node = this.figure[idx];
        let delta;

        switch (idx) {
            case 0:
                this.spinphase += this.dt * this.spinrate;
                delta = mat4Identity();
                
                delta = mat4RotateY(delta, this.spinphase);

                node.transform = multiplyMat4(node.itransform, delta);
                break;

            case 14:
                let amplitude = 0.3;
                let frequency = 1.0 * this.oscillationrate;
                let y_offset = amplitude * Math.sin(2 * Math.PI * frequency * this.dynamic_angle);
                let x_offset = amplitude * Math.cos(2 * Math.PI * frequency * this.dynamic_angle);

                delta = mat4Identity();
                
                delta = mat4Translate(delta, [x_offset, y_offset, 0]);

                node.transform = multiplyMat4(node.itransform, delta);
                break;
                
            default:
                break;
        }

        if (node.children != null) {
            for (var i = 0; i < node.children.length; i++) {
                this.update_node_transform(node.children[i]);
            }
        }
    }

    add_children(parent_idx, child_idx) {
        if (this.figure[parent_idx].children == null) {
            this.figure[parent_idx].children = [];
        }
        this.figure[parent_idx].children.push(child_idx);
    }

    figure_init(num_segments) {
        for (var i = 0; i < num_segments; i++) {
            let new_node = this.create_node(i, mat4Identity(), null, null);
            this.figure.push(new_node);
        }
    }

    init_node(idx) {
        var initial_transform = mat4Identity();
        let base_shape;
        
        switch (idx) {
            case 0:
                base_shape = cube_ground;
                initial_transform = mat4Translate(initial_transform, [0.0, -1.0, 0.0]);
                this.figure[idx] = this.create_node(idx, initial_transform, 
                    () => {
                        let segment_mat = mat4Scale(this.model_transformation_matrix, [100.0, 0.01, 100.0]);
                        gl.uniformMatrix4fv(uMTM, false, segment_mat);
                    }, 
                    null, base_shape);
                break;
            case 1:
                base_shape = cube_bench;
                initial_transform = mat4Translate(initial_transform, [0.0, 1.0, 0.0]);
                this.figure[idx] = this.create_node(idx, initial_transform, 
                    () => {
                        let segment_mat = mat4Scale(this.model_transformation_matrix, [2.0, 0.1, 2.0]);
                        gl.uniformMatrix4fv(uMTM, false, segment_mat);
                    }, 
                    null, base_shape);
                break;
            case 2:
                base_shape = cube_bench;
                initial_transform = mat4Translate(initial_transform, [1.80, -0.5, 1.80]);
                this.figure[idx] = this.create_node(idx, initial_transform, 
                    () => {
                        let segment_mat = mat4Scale(this.model_transformation_matrix, [0.1, 0.5, 0.1]);
                        gl.uniformMatrix4fv(uMTM, false, segment_mat);
                    }, 
                    null, base_shape);
                break;
            case 3:
                base_shape = cube_bench;
                initial_transform = mat4Translate(initial_transform, [-1.80, -0.5, 1.80]);
                this.figure[idx] = this.create_node(idx, initial_transform, 
                    () => {
                        let segment_mat = mat4Scale(this.model_transformation_matrix, [0.1, 0.5, 0.1]);
                        gl.uniformMatrix4fv(uMTM, false, segment_mat);
                    }, 
                    null, base_shape);
                break;
            case 4:
                base_shape = cube_bench;
                initial_transform = mat4Translate(initial_transform, [1.80, -0.5, -1.80]);
                this.figure[idx] = this.create_node(idx, initial_transform, 
                    () => {
                        let segment_mat = mat4Scale(this.model_transformation_matrix, [0.1, 0.5, 0.1]);
                        gl.uniformMatrix4fv(uMTM, false, segment_mat);
                    }, 
                    null, base_shape);
                break;
            case 5:
                base_shape = cube_bench;
                initial_transform = mat4Translate(initial_transform, [-1.80, -0.5, -1.80]);
                this.figure[idx] = this.create_node(idx, initial_transform, 
                    () => {
                        let segment_mat = mat4Scale(this.model_transformation_matrix, [0.1, 0.5, 0.1]);
                        gl.uniformMatrix4fv(uMTM, false, segment_mat);
                    }, 
                    null, base_shape);
                break;
            case 6:
                base_shape = cube_straw;
                initial_transform = mat4Translate(initial_transform, [-3.2, 0.0, 0.0]);
                this.figure[idx] = this.create_node(idx, initial_transform, 
                    () => {
                        let segment_mat = mat4Scale(this.model_transformation_matrix, [0.8, 0.1, 1.5]);
                        gl.uniformMatrix4fv(uMTM, false, segment_mat);
                    }, 
                    null, base_shape);
                break;
            case 7:
                base_shape = cube_straw;
                initial_transform = mat4Translate(initial_transform, [3.2, 0.0, 0.0]);
                this.figure[idx] = this.create_node(idx, initial_transform, 
                    () => {
                        let segment_mat = mat4Scale(this.model_transformation_matrix, [0.8, 0.1, 1.5]);
                        gl.uniformMatrix4fv(uMTM, false, segment_mat);
                    }, 
                    null, base_shape);
                break;
            case 8:
                base_shape = cylinder_metal_gray;
                initial_transform = mat4Translate(initial_transform, [-1.4, 0.1, 0.0]);
                this.figure[idx] = this.create_node(idx, initial_transform, 
                    () => {
                        let segment_mat = mat4Scale(this.model_transformation_matrix, [0.5, 0.01, 0.5]);
                        gl.uniformMatrix4fv(uMTM, false, segment_mat);
                    }, 
                    null, base_shape);
                break;
            case 9:
                base_shape = cylinder_metal_gray;
                initial_transform = mat4Translate(initial_transform, [1.4, 0.1, 0.0]);
                this.figure[idx] = this.create_node(idx, initial_transform, 
                    () => {
                        let segment_mat = mat4Scale(this.model_transformation_matrix, [0.5, 0.01, 0.5]);
                        gl.uniformMatrix4fv(uMTM, false, segment_mat);
                    }, 
                    null, base_shape);
                break;
            case 10:
                base_shape = cylinder_metal_red;
                initial_transform = mat4Translate(initial_transform, [1.5, 0.1, -1.0]);
                this.figure[idx] = this.create_node(idx, initial_transform, 
                    () => {
                        let segment_mat = mat4Scale(this.model_transformation_matrix, [0.15, 0.4, 0.15]);
                        gl.uniformMatrix4fv(uMTM, false, segment_mat);
                    }, 
                    null, base_shape);
                break;
            case 11:
                base_shape = cylinder_metal_orange;
                initial_transform = mat4Translate(initial_transform, [-1.2, 0.1, 1.0]);
                this.figure[idx] = this.create_node(idx, initial_transform, 
                    () => {
                        let segment_mat = mat4Scale(this.model_transformation_matrix, [0.15, 0.4, 0.15]);
                        gl.uniformMatrix4fv(uMTM, false, segment_mat);
                    }, 
                    null, base_shape);
                break;
            case 12:
                base_shape = cylinder_metal_gray;
                initial_transform = mat4Translate(initial_transform, [0.0, 0.1, 0.0]);
                this.figure[idx] = this.create_node(idx, initial_transform, 
                    () => {
                        let segment_mat = mat4Scale(this.model_transformation_matrix, [0.8, 0.01, 0.8]);
                        gl.uniformMatrix4fv(uMTM, false, segment_mat);
                    }, 
                    null, base_shape);
                break;
            case 13:
                base_shape = sphere_ball;
                initial_transform = mat4Translate(initial_transform, [0.0, 0.1, 0.0]);
                this.figure[idx] = this.create_node(idx, initial_transform, 
                    () => {
                        let segment_mat = mat4Scale(this.model_transformation_matrix, [0.6, 0.2, 0.6]);
                        gl.uniformMatrix4fv(uMTM, false, segment_mat);
                    }, 
                    null, base_shape);
                break;
            case 14:
                base_shape = cone_topping;
                initial_transform = mat4Translate(initial_transform, [0.0, 0.25, 0.0]);
                initial_transform = mat4RotateX(initial_transform, Math.PI/2);
                this.figure[idx] = this.create_node(idx, initial_transform, 
                    () => {
                        let segment_mat = mat4Scale(this.model_transformation_matrix, [0.1, 0.1, 0.1]);
                        gl.uniformMatrix4fv(uMTM, false, segment_mat);
                    }, 
                    null, base_shape);
                break;
            default:
                break;
        }
    }
}


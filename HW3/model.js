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
        this.figure[idx].shape.draw();

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

        switch (idx) {
            case 0:
                this.update_base(node);
                break;
            case 1:
                this.update_segment1(node);
                break;
            case 2:
                this.update_segment2(node);
                break;
            case 3:
                this.update_segment3(node);
                break;
            case 4:
                this.update_segment4(node);
                break;
            case 5:
                this.update_tail(node);
                break;
            case 6:
                this.update_head(node);
                break;
            case 7:
                this.update_face(node);
                break;
            case 8:
                this.update_left_fin(node);
                break;
            case 9:
                this.update_right_fin(node);
                break;
            case 10:
                this.update_top_fin(node);
                break;
            case 11:
                this.update_left_eye(node);
                break;
            case 12:
                this.update_right_eye(node);
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
        
        switch (idx) {
            case 0:
                let base_shape = cube_body;
                initial_transform = mat4Translate(initial_transform, [0.0, 0.0, 0.0]);
                this.figure[idx] = this.create_node(idx, initial_transform, () => this.base_segment(), null, base_shape);
                break;

            case 1:
                let segment1_shape = cube_body;
                initial_transform = mat4Translate(initial_transform, [2.0, 0.0, 0.0]);
                this.figure[idx] = this.create_node(idx, initial_transform, () => this.segment1(), null, segment1_shape);
                break;

            case 2:
                let segment2_shape = cube_body;
                initial_transform = mat4Translate(initial_transform, [1.0, 0.0, 0.0]);
                this.figure[idx] = this.create_node(idx, initial_transform, () => this.segment2(), null, segment2_shape);
                break;

            case 3:
                let segment3_shape = cylinder_body;
                initial_transform = mat4Translate(initial_transform, [-0.8, 0.0, 0.0]);
                initial_transform = mat4RotateZ(initial_transform, -Math.PI / 2);
                this.figure[idx] = this.create_node(idx, initial_transform, () => this.segment3(), null, segment3_shape);
                break;

            case 4:
                let segment4_shape = cone_body;
                initial_transform = mat4Translate(initial_transform, [0.0, 1.7, 0.0]);
                // initial_transform = mat4RotateZ(initial_transform, -Math.PI);
                this.figure[idx] = this.create_node(idx, initial_transform, () => this.segment4(), null, segment4_shape);
                break;

            case 5:
                let tail_shape = pyramid_fin;
                initial_transform = mat4Translate(initial_transform, [0.0, 1.0, 0.0]);
                initial_transform = mat4RotateZ(initial_transform, -Math.PI);
                this.figure[idx] = this.create_node(idx, initial_transform, () => this.tail_segment(), null, tail_shape);
                break;

            case 6:
                let head_shape = cube_body;
                initial_transform = mat4Translate(initial_transform, [-2, 0.0, 0.0]);
                this.figure[idx] = this.create_node(idx, initial_transform, () => this.head_segment(), null, head_shape);
                break;

            case 7:
                let face_shape = sphere_head;
                initial_transform = mat4Translate(initial_transform, [-1, 0.0, 0.0]);
                this.figure[idx] = this.create_node(idx, initial_transform, () => this.face_segment(), null, face_shape);
                break;

            case 8:
                let left_fin_shape = pyramid_fin;
                initial_transform = mat4Translate(initial_transform, [-0.8, 0.0, 1.0]);
                initial_transform = mat4RotateX(initial_transform, -Math.PI / 2);
                initial_transform = mat4RotateZ(initial_transform, Math.PI);
                this.figure[idx] = this.create_node(idx, initial_transform, () => this.left_fin_segment(), null, left_fin_shape);
                break;

            case 9:
                let right_fin_shape = pyramid_fin;
                initial_transform = mat4Translate(initial_transform, [-0.8, 0.0, -1.0]);
                initial_transform = mat4RotateX(initial_transform, Math.PI / 2);
                initial_transform = mat4RotateZ(initial_transform, Math.PI);
                this.figure[idx] = this.create_node(idx, initial_transform, () => this.right_fin_segment(), null, right_fin_shape);
                break;

            case 10:
                let top_fin_shape = pyramid_fin;
                initial_transform = mat4Translate(initial_transform, [-0.3, 1.0, 0.0]);
                this.figure[idx] = this.create_node(idx, initial_transform, () => this.top_fin_segment(), null, top_fin_shape);
                break;

            case 11:
                let left_eye_shape = sphere_eye;
                initial_transform = mat4Translate(initial_transform, [-0.8, 0.3, 0.5]);
                this.figure[idx] = this.create_node(idx, initial_transform, () => this.left_eye_segment(), null, left_eye_shape);
                break;

            case 12:
                let right_eye_shape = sphere_eye;
                initial_transform = mat4Translate(initial_transform, [-0.8, 0.3, -0.5]);
                this.figure[idx] = this.create_node(idx, initial_transform, () => this.right_eye_segment(), null, right_eye_shape);
                break;

            default:
                break;
        }
    }


    // per-segment functions for world transform
    base_segment() {
        let segment_mat = mat4Scale(this.model_transformation_matrix, [2.0, 1.0, 1.0]);
        gl.uniformMatrix4fv(uMTM, false, segment_mat);
    }

    segment1() {
        let segment_mat = mat4Scale(this.model_transformation_matrix, [0.8, 0.8, 0.8]);
        gl.uniformMatrix4fv(uMTM, false, segment_mat);
    }

    segment2() {
        let segment_mat = mat4Scale(this.model_transformation_matrix, [0.5, 0.5, 0.5]);
        gl.uniformMatrix4fv(uMTM, false, segment_mat);
    }
    
    segment3() {
        let segment_mat = mat4Scale(this.model_transformation_matrix, [0.4, 0.89, 0.4]);
        gl.uniformMatrix4fv(uMTM, false, segment_mat);
    }

    segment4() {
        let segment_mat = mat4Scale(this.model_transformation_matrix, [0.4, 1.0, 0.4]);
        gl.uniformMatrix4fv(uMTM, false, segment_mat);
    }

    tail_segment() {
        let segment_mat = mat4Scale(this.model_transformation_matrix, [1.0, 1.0, 0.3]);
        gl.uniformMatrix4fv(uMTM, false, segment_mat);
    }

    head_segment() {
        let segment_mat = mat4Scale(this.model_transformation_matrix, [1.0, 0.9, 0.9]);
        gl.uniformMatrix4fv(uMTM, false, segment_mat);
    }

    face_segment() {
        let segment_mat = mat4Scale(this.model_transformation_matrix, [1.0, 0.9, 0.9]);
        gl.uniformMatrix4fv(uMTM, false, segment_mat);
    }

    left_fin_segment() {
        let segment_mat = mat4Scale(this.model_transformation_matrix, [1.0, 1.3, 0.2]);
        gl.uniformMatrix4fv(uMTM, false, segment_mat);
    }

    right_fin_segment() {
        let segment_mat = mat4Scale(this.model_transformation_matrix, [1.0, 1.3, 0.2]);
        gl.uniformMatrix4fv(uMTM, false, segment_mat);
    }

    top_fin_segment() {
        let segment_mat = mat4Scale(this.model_transformation_matrix, [2.0, 1.0, 0.2]);
        gl.uniformMatrix4fv(uMTM, false, segment_mat);
    }

    left_eye_segment() {
        let segment_mat = mat4Scale(this.model_transformation_matrix, [0.15, 0.15, 0.15]);
        gl.uniformMatrix4fv(uMTM, false, segment_mat);
    }

    right_eye_segment() {
        let segment_mat = mat4Scale(this.model_transformation_matrix, [0.15, 0.15, 0.15]);
        gl.uniformMatrix4fv(uMTM, false, segment_mat);
    }

    // per-segment functions for updating local transform
    update_base(node) {
        let change = this.dt * this.spinrate;
        node.local_angle.x += change;
        node.transform = mat4RotateY(node.transform, change);

        let amplitude = 0.3;
        let frequency = 1 * this.oscillationrate;
        let y_offset = 0.2 * amplitude * Math.sin(2 * Math.PI * frequency * this.dynamic_angle);

        node.transform = mat4Translate(node.transform, [0, y_offset, 0]);
    }

    update_segment1(node) {
        let change = this.dt * 0.5 * node.rotation_dir.y * this.oscillationrate;
        node.local_angle.y += change;
        let bound = Math.PI/16;
        if (node.local_angle.y > bound || node.local_angle.y < -bound) {
            node.rotation_dir.y *= -1;
        }
        node.transform = mat4RotateY(node.transform, change);
    }

    update_segment2(node) {
        let change = this.dt * 0.5 * node.rotation_dir.y * this.oscillationrate;
        let bound = Math.PI/16;
        node.local_angle.y += change;
        if (node.local_angle.y > bound || node.local_angle.y < -bound) {
            node.rotation_dir.y *= -1;
        }
        node.transform = mat4RotateY(node.transform, change);
    }

    update_tail(node) {
        let change = this.dt * 1.0 * node.rotation_dir.y * this.oscillationrate;
        node.local_angle.y += change;
        let bound = Math.PI/8;
        if (node.local_angle.y > bound || node.local_angle.y < -bound) {
            node.rotation_dir.y *= -1;
        }
        node.transform = mat4RotateX(node.transform, change);
    }

    // these functions are placeholders, current not in use because I do not need them to animate the fish
    update_segment3(node) {

    }

    update_segment4(node) {

    }

    update_head(node) {

    }

    update_face(node) {

    }

    update_face(node) {

    }

    update_left_fin(node) {

    }

    update_right_fin(node) {
        
    }

    update_top_fin(node) {

    }

    update_left_eye(node) {

    }

    update_right_eye(node) {

    }
}


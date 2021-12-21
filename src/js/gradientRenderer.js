// importing boilerplate functions
import createProgramFromSources, {
    resizeCanvasToDisplaySize,
} from '../js/webglUtils';
// vertex shader function that is just a function to accompany the fragment shader
const getVertexShader = () => {
    const vs = `#version 300 es
    in vec2 a_position;

    uniform vec2 u_resolution;

    out vec2 v_position;

    void main(){
        gl_Position = vec4(a_position/u_resolution * 2.0 - 1.0, 0, 1);
        v_position = vec2(a_position.x, u_resolution.y-a_position.y);
    }
    `;
    return vs;
};
// fragment shader function that returns FS with the number of points embedded in the source (length)
const getFragmentShader = (length) => {
    const fs = `#version 300 es
    precision highp float;

    in vec2 v_position;

    uniform vec2 u_resolution;
    uniform ivec2 pointsXY[${length}];
    uniform float pointsRadius[${length}];
    uniform vec3 pointsRGB[${length}];
    uniform vec3 pointsHSV[${length}];

    out vec4 outColor;

    vec2 minMax(vec3 rgb){
        vec2 mM = vec2(rgb[0], rgb[0]);
        for(int i=1;i<3;i++){
            if (rgb[i] < mM[0])
                mM[0] = rgb[i];
            if (rgb[i] > mM[1])
                mM[1] = rgb[i];
        }
        return mM;
    }

    vec3 rgbToHsv(vec3 rgb){
        float hue=0.0, C, V, Sv;
        vec2 mM = minMax(rgb);
        C = mM[1] - mM[0];
        if(C==0.0){
        }else if(mM[1]==rgb[0]){
            hue = mod((rgb[1] - rgb[2]) / C, 6.0);
        }else if(mM[1]==rgb[1]){
            hue =     (rgb[2] - rgb[0]) / C + 2.0;
        }else if(mM[1]==rgb[2]){
            hue =     (rgb[0] - rgb[1]) / C + 4.0;
        }
        hue = mod((mod(hue * 60.0, 360.0) + 360.0), 360.0);

        
        V = mM[1];
        if(V==0.0) Sv = 0.0;
        else Sv = C/(V);

        return vec3(hue, Sv, V);
    }

    float f(int n, vec3 hsv){
        float k;
        k = mod((float(n) + hsv[0] / 60.0), 6.0);
        float fOut=hsv[2] - hsv[2] * hsv[1] * max(0.0, min(min(k, 4.0 - k), 1.0));
        return fOut;
    }

    vec3 hsvToRgb(vec3 hsv){
        vec3 rgb = vec3(f(5,hsv), f(3,hsv), f(1,hsv));
        return rgb;
    }

    float dist(ivec2 pos, ivec2 point){
        return pow(pow(float(pos.x-point.x), 2.0)+pow(float(pos.y-point.y), 2.0), 0.5);
    }

    void main(){
        // ivec2 position = ivec2((v_position + 1.0) / 2.0 * u_resolution);
        ivec2 position = ivec2(v_position);
        float invSum = 0.0;
        vec3 hsv = vec3(0,0,0), rgb = vec3(0,0,0);
        int pointCentre = -1;
        for(int i=0;i<${length};i++){
            float d = dist(pointsXY[i], position);
            if(abs(d)>0.0000001){
                float invD = pow((1.0+pointsRadius[i]/10.0)/d, 3.0);
                hsv += invD * pointsHSV[i];
                rgb += invD * pointsRGB[i];
                invSum += invD;
            }else{
                pointCentre=i;
            }
        }
        if(pointCentre == -1){
            hsv = hsv/invSum;
            rgb = rgb/invSum;
            // outColor = vec4(rgb, 1);
            vec3 rgbInHsv = rgbToHsv(rgb);
            // outColor = vec4(rgb, 1);
            hsv[0] = rgbInHsv[0];
            // hsv[1] = (1.25*rgbInHsv[1]+0.75*hsv[1])/2.0;
            // hsv[1] = (2.0*rgbInHsv[1]+0.0*hsv[1])/2.0;
            hsv[1] = rgbInHsv[1];
            hsv[2] = (1.75*rgbInHsv[2]+0.25*hsv[2])/2.0;
            // hsv[2]=0.5;
            outColor = vec4(hsvToRgb(hsv),1);
            // outColor = vec4(rgb,1);
            // outColor = vec4(hsv,1);
            // outColor = vec4(hsv[0]/360.0, hsv[1], hsv[2], 1);
            // outColor = vec4(rgbInHsv[0]/360.0, rgbInHsv[1], rgbInHsv[2], 1);
        }else{
            hsv = pointsHSV[pointCentre];
            rgb = pointsRGB[pointCentre];
            outColor = vec4(rgb, 1);
        }
    }

    `;
    return fs;
};
const renderGradient = (points, canvas) => {
    if (points && points.length > 0) {
        // accessing WebGL2 context from canvas
        const gl = canvas.getContext('webgl2');

        // resizing canvas context to canvas width set by CSS
        canvas.width = canvas.offsetWidth * 1;
        canvas.height = canvas.offsetHeight * 1;

        // creating program using the vs and fs functions above
        const program = createProgramFromSources(gl, [
            getVertexShader(),
            getFragmentShader(points.length),
        ]);

        // storing locations of attributes and uniforms (state variables)
        const locations = {
            position: gl.getAttribLocation(program, 'a_position'),
            resolution: gl.getUniformLocation(program, 'u_resolution'),
            pointsRadius: gl.getUniformLocation(program, 'pointsRadius'),
            pointsXY: gl.getUniformLocation(program, 'pointsXY'),
            pointsRGB: gl.getUniformLocation(program, 'pointsRGB'),
            pointsHSV: gl.getUniformLocation(program, 'pointsHSV'),
        };

        // creating a position buffer to load the entire clipspace into webgl buffer
        var positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        // clipspace is formed using two (anticlockwise) triangles
        // prettier-ignore
        var positions = [
                   0, canvas.height, 
        canvas.width, 0, 
        canvas.width, canvas.height, 
                   0, 0, 
        canvas.width, 0, 
                   0, canvas.height
    ];
        // loading positions array to graphics buffer
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(positions),
            gl.STATIC_DRAW
        );

        // creating vertex array object that will attach the positionBuffer to the attributes
        var vao = gl.createVertexArray();
        // binding current vertex array to vao
        gl.bindVertexArray(vao);
        // connecting vao to a_position attribute
        gl.enableVertexAttribArray(locations.position);
        // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        var size = 2; // 2 components per iteration (x, y)
        var type = gl.FLOAT; // the data is 32bit floats
        var normalize = false; // don't normalize the data
        var stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position (consecutive elemets)
        var offset = 0; // start at the beginning of the buffer
        // attach vao to the current ARRAY_BUFFER (positionBuffer) and pass instructions on how to interpret the data
        gl.vertexAttribPointer(
            locations.position,
            size,
            type,
            normalize,
            stride,
            offset
        );

        // resizing canvas to fit the fill clipspace - not sure why since we already did canvas.width = offsetWidth and all...
        resizeCanvasToDisplaySize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        // Telling WebGL to use our program (with the pair of shaders)
        gl.useProgram(program);

        // generating arrays that will be sent to uniforms
        const pointsRadius = points.map(({ radius }) => {
            return radius;
        });
        // console.log(pointsRadius.flat());
        const pointsXY = points.map(({ x, y }) => {
            return [x, y];
        });
        const pointsRGB = points.map(({ colour }) => {
            return [colour.rgb.r / 255, colour.rgb.g / 255, colour.rgb.b / 255];
        });
        const pointsHSV = points.map(({ colour }) => {
            return [colour.hsv.h / 360, colour.hsv.s, colour.hsv.v];
        });
        // setting uniforms
        gl.uniform1fv(locations.pointsRadius, pointsRadius.flat());
        gl.uniform2iv(locations.pointsXY, pointsXY.flat());
        gl.uniform3fv(locations.pointsRGB, pointsRGB.flat());
        gl.uniform3fv(locations.pointsHSV, pointsHSV.flat());
        gl.uniform2f(locations.resolution, canvas.width, canvas.height);

        // drawwwww
        var primType = gl.TRIANGLES;
        offset = 0;
        var count = positions.length / size;
        gl.drawArrays(primType, offset, count);
        // requestAnimationFrame(renderGradient);

        // // simply reading the data
        // var results = new Uint8Array(canvas.width * canvas.height * 4);
        // gl.readPixels(
        //     0,
        //     0,
        //     canvas.width,
        //     canvas.height,
        //     gl.RGBA,
        //     gl.UNSIGNED_BYTE,
        //     results
        // );
        // var resultsB = [];
        // // for (let i = 0; i < canvas.width * canvas.height; i++) {
        // //     resultsB.push({
        // //         r: results[4 * i],
        // //         g: results[4 * i + 1],
        // //         b: results[4 * i + 2],
        // //         a: results[4 * i + 3],
        // //     });
        // // }
        // console.log(results.slice(0, 4));
    }
};

export default renderGradient;

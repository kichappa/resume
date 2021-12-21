import logo from './logo.svg';
import './css/App.css';
import './css/portfolio.css';
import './css/bg.css';
import Portfolio from './components/Portfolio';
import Canvas from './components/Canvas';
import bgShapes1 from './static/Back Shapes_bg.svg';
import bgShapes2 from './static/Back Shapes_bg_2.svg';
import { useState, useEffect } from 'react';

function App() {
    const rgbToHslHsvHex = (rgb) => {
        var rgbArr = [rgb.r, rgb.g, rgb.b];
        var M, m, C, hue, V, L, Sv, Sl;
        M = Math.max(...rgbArr);
        m = Math.min(...rgbArr);
        C = M - m;
        // I = (rgbArr[0] + rgbArr[1] + rgbArr[2]) / 3;
        // Hue
        if (C === 0) hue = 0;
        else if (M === rgbArr[0]) hue = ((rgbArr[1] - rgbArr[2]) / C) % 6;
        else if (M === rgbArr[1]) hue = (rgbArr[2] - rgbArr[0]) / C + 2;
        else if (M === rgbArr[2]) hue = (rgbArr[0] - rgbArr[1]) / C + 4;
        hue *= 60;
        // Lightness and Value
        V = M / 255;
        L = (M + m) / (2 * 255);
        // Saturation
        if (V === 0) Sv = 0;
        else Sv = C / (V * 255);
        if (L === 1 || L === 0) Sl = 0;
        else Sl = C / (255 * (1 - Math.abs(2 * L - 1)));

        hue = ((hue % 360) + 360) % 360;
        let hsv = { h: hue, s: Sv, v: V, a: 1 };
        let hsl = { h: hue, s: Sl, l: L, a: 1 };
        rgb.a = 1;
        let hex = '#';
        for (let i in rgbArr) {
            let colorcode = Math.floor(rgbArr[i]).toString(16);
            hex += '0'.repeat(2 - colorcode.length) + colorcode;
        }
        return { rgb: rgb, hsv: hsv, hsl: hsl, hex: hex };
    };
    /**
     * Function that converts hex encoded colour to rgb format.
     *
     * @param {string} hex
     * @returns {rgb} {r,g,b}
     */
    const hexToRgb = (hex) => {
        var aRgbHex = hex.match(/.{1,2}/g);
        // console.log(aRgbHex)
        var aRgb = {
            r: parseInt(aRgbHex[0], 16),
            g: parseInt(aRgbHex[1], 16),
            b: parseInt(aRgbHex[2], 16),
        };
        return aRgb;
    };
    /**
     * Function to convert multi-representation colour object to 2x3 array of RGB and HSV representations.
     *
     * @param {{rgb:object, hsv:object, [hsl:object, hex:object]}} obj
     * @return {[Array, Array]} [[h, s, v], [r, g, b]].
     */
    const hsvRgbObjToArr = (obj) => {
        var arr = [
            [0, 0, 0],
            [0, 0, 0],
        ];
        arr[0] = [obj.hsv.h, obj.hsv.s, obj.hsv.v];
        arr[1] = [obj.rgb.r, obj.rgb.g, obj.rgb.b];
        return arr;
    };

    const getColourPoints = (rawCP) => {
        let cP = new Array(rawCP.radii.length);
        for (let i in rawCP.colours) {
            // console.log(rawCP.colours[i]);
            // console.log(hexToRgb(rawCP.colours[i]));
            cP[i] = {
                x: rawCP.positions[i][0] / rawCP.viewport[0],
                y: rawCP.positions[i][1] / rawCP.viewport[1],
                colour: rgbToHslHsvHex(hexToRgb(rawCP.colours[i])),
                colourArr: hsvRgbObjToArr(
                    rgbToHslHsvHex(hexToRgb(rawCP.colours[i]))
                ),
                radius: rawCP.radii[i],
            };
        }
        // console.log(cP);
        return cP;
    };
    var rawCP = {
        colours: [
            'DEECE5',
            'C7DEE5',
            'E3EEFD',
            'FFFFFF',
            'FFFFFF',
            'E7F5EE',
            'DEECE5',
        ],
        radii: [1, 2, 1, 1, 1, 1, 1],
        positions: [
            [120.8854, 78.9364],
            [382.0792, 303.7385],
            [108.4034, 492.5733],
            [483.9389, 561.1634],
            [816.4031, 521.2621],
            [832.2423, 592.2427],
            [810.4892, 299.7712],
        ],
        viewport: [841.89, 595.28],
    };
    const [colourPoints, setColourPoints] = useState(getColourPoints(rawCP));
    // console.log(colourPoints);
    return (
        <div className="App">
            <Canvas id={'gradientPalette'} canvasPoints={colourPoints} />
            <div className="bg_c_c">
                <div id="bg_Container_1" className="bg_Container">
                    <object
                        data={bgShapes1}
                        id="bgShapes_1"
                        type="image/svg+xml"
                        alt="bg image"
                    />
                </div>
            </div>
            <div className="bg_c_c">
                <div id="bg_Container_2" className="bg_Container">
                    <object
                        data={bgShapes2}
                        id="bgShapes_2"
                        type="image/svg+xml"
                        alt="another bg image"
                    />
                </div>
            </div>
            <div id="portfolios">
                <Portfolio
                    title="UX Portfolio"
                    link="https://kichappa.github.io/resume/ux.htm"
                    desc="Here are the works I did in User Experience Design. These include wireframes and prototypes made for my intern at HeyPrescribe!, coursework and hobby."
                />
                <Portfolio
                    title="Design Portfolio"
                    link="https://kichappa.github.io/resume/design.htm"
                    desc="This is my general design portfolio. These are works done primarily for coursework or hobby."
                />
            </div>
        </div>
    );
}

export default App;

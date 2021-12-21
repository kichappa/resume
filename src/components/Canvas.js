import React, { useState, useRef, useEffect } from 'react';
import renderGradient from '../js/gradientRenderer';

var worker = new window.Worker('./gradientWorker.js');

const Canvas = ({ id, canvasPoints }) => {
    const [points, setPoints] = useState(canvasPoints);
    const [oPoints] = useState(JSON.parse(JSON.stringify(canvasPoints)));
    const [canvas] = useState(useRef(null));
    const [cSize, setCSize] = useState([]);
    const [windowSize, setWindowSize] = useState({
        width: undefined,
        height: undefined,
    });
    const [firstRender, setFirstRender] = useState(true);
    const draw = (imageData) => {
        var ctx = canvas.current.getContext('2d');
        ctx.putImageData(imageData, 0, 0);
        window.requestAnimationFrame(() => draw(imageData));
    };
    const scaleCP = () => {
        // console.log('scaling to size');
        if (canvas.current.width != canvas.current.clientWidth) {
            canvas.current.width = canvas.current.clientWidth;
        }
        if (canvas.current.height != canvas.current.clientHeight) {
            canvas.current.height = canvas.current.clientHeight;
        }
        // console.log(
        //     '[',
        //     canvas.current.clientWidth,
        //     ', ',
        //     canvas.current.clientHeight,
        //     ']'
        // );
        for (let i in points) {
            points[i].x = oPoints[i].x * canvas.current.width;
            points[i].y = oPoints[i].y * canvas.current.height;
        }
        setPoints([...points]);
    };
    const shootPixel = () => {
        if (!canvas.current.getContext('webgl2')) {
            console.log('WebGL2 not available, using CPU.');
            var ctx = canvas.current.getContext('2d');
            const imageData = ctx.createImageData(
                canvas.current.width,
                canvas.current.height
            );
            var imDataLength = imageData.data.length;
            // Calling worker
            worker.terminate();
            worker = new window.Worker('./gradientWorker.js');
            worker.postMessage({
                imageData: imageData,
                points: points,
                canvas: {
                    width: canvas.current.width,
                    height: canvas.current.height,
                },
            });
            worker.onerror = (err) => {
                console.log('error', err);
            };
            worker.onmessage = (e) => {
                if (imDataLength === e.data.imageData.data.length) {
                    window.requestAnimationFrame(() => draw(e.data.imageData));
                }
            };
        } else {
            window.requestAnimationFrame(() =>
                renderGradient(points, canvas.current)
            );
        }
    };
    useEffect(() => {
        // setPoints(canvasPoints);
        scaleCP();
        shootPixel();
    }, points);

    useEffect(() => {
        // console.log('inside useEffect');
        if (!firstRender) {
            if (
                canvas.current.clientWidth !== cSize[0] ||
                canvas.current.clientHeight !== cSize[1]
            ) {
                scaleCP();
                shootPixel();
            }
        }
    }, [windowSize]);

    useEffect(() => {
        setFirstRender(false);
        if (!canvas.current.getContext('webgl2')) {
            alert(
                'WebGL not available in this browser/platform. Renders may be slower.'
            );
        }
        setPoints(canvasPoints);
        setCSize([canvas.current.clientWidth, canvas.current.clientHeight]);
        // Handler to call on window resize
        function handleResize() {
            // Set window width/height to state
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        }
        // Add event listener
        window.addEventListener('resize', handleResize);
        // handleResize();
    }, []);
    return <canvas id={id} ref={canvas} />;
};

export default Canvas;

import * as React from "react";
import {useEffect, useRef} from "react";


import * as THREE from 'three';
import {BoxGeometry, Material, Mesh} from 'three';
import {Font, FontLoader} from "three/examples/jsm/loaders/FontLoader";
import {TextGeometry} from "three/examples/jsm/geometries/TextGeometry";
import {deg2Radians} from "../tools";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {RoundedBoxGeometry} from "three/examples/jsm/geometries/RoundedBoxGeometry";


const FONT_URL = 'https://cdn.yionr.cn/STFangsong_Regular.json'

/*
spotify
 */
export function SpotifyPlayer() {
    let ref = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        ref.current && render(ref.current)
    }, [ref.current])

    return (
        <>
            <canvas ref={ref}></canvas>
        </>

    );
}


const songFontProperties = {
    size: 1,

    height: .1,

    curveSegments: 12,

    bevelEnabled: true, // 斜角
    bevelThickness: 0.15, // 斜角深度

    bevelSize: 0.08, // 斜角延伸

    bevelSegments: 10, // 斜角分段数量
}

const singerFontProperties = {
    size: .6,

    height: .1,

    curveSegments: 12,

    bevelEnabled: true, // 斜角
    bevelThickness: 0.15, // 斜角深度

    bevelSize: 0.08, // 斜角延伸

    bevelSegments: 10, // 斜角分段数量
}

const processFontProperties = {
    size: .4,

    height: .1,

    curveSegments: 12,

    bevelEnabled: true, // 斜角
    bevelThickness: 0.15, // 斜角深度

    bevelSize: 0.08, // 斜角延伸

    bevelSegments: 10, // 斜角分段数量
}

let es: Array<EventSource | number> = []

async function render(canvas: HTMLCanvasElement) {


    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(25, 2, 0.1, 100)
    camera.position.set(0, 0, 20);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({canvas, antialias: true,alpha: true})

    const controls = new OrbitControls(camera, renderer.domElement);

    // 设置控制器属性
    controls.enableDamping = true; // 开启阻尼
    controls.dampingFactor = 0.05; // 阻尼系数，越小越平滑
    controls.rotateSpeed = 0.5; // 拖拽旋转速度

    // 监听窗口大小变化事件
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

// 添加监听鼠标滚轮事件，缩放视图
    renderer.domElement.addEventListener('wheel', (event) => {
        event.preventDefault();
        const delta = event.deltaY;
        const fov = camera.fov + delta * 0.01;
        camera.fov = THREE.MathUtils.clamp(fov, 10, 75);
        camera.updateProjectionMatrix();
    });

// 添加监听鼠标点击事件，设置视角
    renderer.domElement.addEventListener('mousedown', (event) => {
        event.preventDefault();
        controls.enabled = true;
    });

// 添加监听鼠标松开事件
    renderer.domElement.addEventListener('mouseup', () => {
        // controls.enabled = false;
    });


    // 播放器面板，面板上有文字，进度条，面板可以小幅度3d旋转
    const PANEL_DEPTH = 1
    let panelMesh = generateBox(16, 4, PANEL_DEPTH, '#407fbf',undefined,true)
    panelMesh.rotation.set(deg2Radians(-20), deg2Radians(18), 0)
    scene.add(panelMesh)

    let material = new THREE.MeshPhongMaterial()

    let imageMesh = generateBox(3.5, 3.5, .5, 'white', material)
    imageMesh.position.set(-6, 0, .5)
    panelMesh.add(imageMesh)

    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(20, 20, 100);
    light.target.position.set(0, 0, 0);
    scene.add(light);
    scene.add(light.target);

    let font = await loadFont()


    let songMesh = await generateWord('歌名', {x: -4, y: .7, z: PANEL_DEPTH}, 'pink', font, songFontProperties)
    let singerMesh = await generateWord('歌手', {x: -4, y: -.6, z: PANEL_DEPTH}, 'pink', font, singerFontProperties)
    let processMesh = await generateWord('进度', {x: -4, y: -1.5, z: PANEL_DEPTH}, 'pink', font, processFontProperties)

    panelMesh.add(songMesh)
    panelMesh.add(singerMesh)
    panelMesh.add(processMesh)

    function startUpdateSpotifyContent() {
        let lastImage: string;
        let uuid = parseInt(String(Math.random() * 10000))
        let event = new EventSource(`https://spotify-service.yionr.workers.dev/nowListening-sse?c=${uuid}`)
        es.push(event)
        event.addEventListener('open', e => {
            while (es.length > 2) {
                let e = es.shift()
                if (e instanceof EventSource)
                    e?.close()
                else
                    clearInterval(e)
            }

            // @ts-ignore
            es.push(setInterval(() => {
                fetch(`https://spotify-service.yionr.workers.dev/rpc?c=${uuid}`)
            }, 2000))
        })
        event.addEventListener('message', (e: MessageEvent<string>) => {
            /*
            {
            "p":"02:13/03:20",
            "sn":"lovely (with Khalid)",
            "n":"Billie Eilish,Khalid",
            "i":[
                {"height":640,"url":"https://i.scdn.co/image/ab67616d0000b2738a3f0a3ca7929dea23cd274c","width":640},
                {"height":300,"url":"https://i.scdn.co/image/ab67616d00001e028a3f0a3ca7929dea23cd274c","width":300},
                {"height":64,"url":"https://i.scdn.co/image/ab67616d000048518a3f0a3ca7929dea23cd274c","width":64}
            ],
            "st":true}
             */
            let {p: process, sn: song, n: singer, st: status, i: image} = JSON.parse(e.data)
            if (status === null) {
                updateText(songMesh, '没在听歌哦', font, songFontProperties)
                updateText(singerMesh, '', font, singerFontProperties)
                updateText(processMesh, '', font, processFontProperties)
            } else {
                updateText(songMesh, song, font, songFontProperties)
                updateText(singerMesh, singer, font, singerFontProperties)
                updateText(processMesh, process + (!status ? '(pause)': ''), font, processFontProperties)
                if (lastImage !== image[1]['url']) {
                    lastImage = image[1]['url']
                    updateImage(imageMesh, lastImage)
                }
            }
        })
        return event
    }

    startUpdateSpotifyContent()


    const animate = () => {
        requestAnimationFrame(animate)
        controls.update()
        renderer.render(scene, camera)
    }

    animate()


}

interface PlaybackState {
    p: string,
    sn: string,
    n: string,
    i: Array<Image>,
    st: string
}

interface Image {
    height: number,
    width: number,
    url: string
}

function loadFont(): Promise<Font> {
    return new Promise((resolve, reject) => {
        const loader = new FontLoader();
        loader.load(FONT_URL, (font) => {
            resolve(font)
        }, (e) => {
            console.log(`${e.loaded} / ${e.total}`)
        })
    })
}

async function generateWord(text: string, position = {
    x: 0,
    y: 0,
    z: 0
}, color = 'pink', font: Font, fontProperties: Object) {
    return new Promise<Mesh>(async (resolve, reject) => {

        const fontGeometry = new TextGeometry(text, Object.assign(fontProperties, {font: font}));
        const fontMaterial = new THREE.MeshPhongMaterial({
            color
        })

        let fontMesh = new THREE.Mesh(fontGeometry, fontMaterial)

        fontMesh.position.set(position.x, position.y, position.z)

        resolve(fontMesh)
    })

}

async function updateText(fontMesh: Mesh, text: string, font: Font, fontProperties: Object) {
    fontMesh.geometry.dispose()
    fontMesh.geometry =
        new TextGeometry(text, Object.assign(fontProperties, {font: font}));
}

async function updateImage(imageMesh: Mesh, image: string) {
    // 更新mesh的材质
    const loader = new THREE.TextureLoader();
    const material = new THREE.MeshPhongMaterial({
        color: 0xFFFFFF,
        map: loader.load(image)
    })
    imageMesh.material = material
}


function generateBox(width: number, height: number, depth: number, color: string, material?: Material,round?: boolean) {
    let geometry: BoxGeometry | RoundedBoxGeometry
    if (round) {
        geometry = new RoundedBoxGeometry(width, height, depth,10, depth / 4 )
    } else {
        geometry = new THREE.BoxGeometry(width, height, depth)
    }
    if (!material)
        material = new THREE.MeshPhongMaterial({
            color,
            shininess: 150
        })
    return new THREE.Mesh(geometry, material)
}
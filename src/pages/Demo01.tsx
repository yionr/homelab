import * as React from "react";
import {useRef, useEffect} from "react";

import * as THREE from 'three';
import {BufferGeometry} from "three";

function renderCubes(canvas: HTMLCanvasElement) {
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, 1920/1080, 0.1, 5)

    const renderer = new THREE.WebGLRenderer({canvas})
    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)

    const geometry = new THREE.BoxGeometry(1,1,1)

    function makeInstance(color: string, {x = 0, y = 0, z = 0} = {}) {
        const material = new THREE.MeshPhongMaterial({color});

        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        cube.position.x = x;

        return cube;
    }

    let cubus: THREE.Mesh<THREE.BoxGeometry, THREE.MeshPhongMaterial>[] = []

    cubus.push(makeInstance('0x00ff00'))
    cubus.push(makeInstance('0xff0000', {x: -4, y: -4, z: -4}))
    cubus.push(makeInstance('0xff0000', {x: -2, y: -2, z: -2}))
    cubus.push(makeInstance('0xff0000', {x: 2, y: 2, z: 2}))
    cubus.push(makeInstance('0x0000ff', {x: 4, y: 4, z: 4}))


    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);

    camera.position.z = 5
    //
    const animate = () => {
        requestAnimationFrame(animate)
        cubus.forEach(cube => {
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;
        })
        renderer.render(scene, camera)
    }

    animate()
}

export function Demo01() {

    const ref = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        ref.current && renderCubes(ref.current)
    })

    return (
        <>
            <canvas ref={ref}></canvas>
        </>

    );
}
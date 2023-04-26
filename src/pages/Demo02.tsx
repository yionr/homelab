import * as React from "react";
import {useRef,useEffect} from "react";

import * as THREE from 'three';


export function Demo02 () {

    const ref = useRef<HTMLDivElement>(null);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );

    useEffect(() => {
        ref.current && (ref.current.innerHTML = '')
        ref.current?.appendChild( renderer.domElement );
    })

    const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 500 );
    camera.position.set( 0, 0, 100 );
    camera.lookAt( 0, 0, 0 );



    const scene = new THREE.Scene();

    //create a blue LineBasicMaterial
    const material = new THREE.LineBasicMaterial( { color: 0x0000ff } );
    const points = [];
    points.push( new THREE.Vector3( - 10, 0, 0 ) );
    points.push( new THREE.Vector3( 0, 10, 0 ) );
    points.push( new THREE.Vector3( 10, 0, 0 ) );

    const geometry = new THREE.BufferGeometry().setFromPoints( points );

    const line = new THREE.Line( geometry, material );

    scene.add( line );
    const light = new THREE.AmbientLight( 0x404040 ); // soft white light
    scene.add( light );
    animate()
    function animate() {
        requestAnimationFrame(animate)
        renderer.render( scene, camera );
    }

    return (
        <>
            <div ref={ref}></div>
        </>

    );
}
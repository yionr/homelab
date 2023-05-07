import React, {useRef} from "react";
import {NavLink, Outlet} from "react-router-dom";
import './Aside.css'

export function Aside() {
    return (
        <>
            <div className={'page'}>
                <ul>

                    <li><NavLink
                        to={`/demo01`}
                    >Demo01</NavLink></li>
                    <li><NavLink
                        to={`/demo02`}
                    >Demo02</NavLink></li>
                    <li><NavLink
                        to={`/demo03`}
                    >Demo03</NavLink></li>
                </ul>
                <Outlet/>

            </div>
        </>
    )
}
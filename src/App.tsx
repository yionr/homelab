import React, {useEffect, useRef} from 'react';
import './App.css';

import {render} from "@testing-library/react";
import {RouterProvider} from "react-router-dom";
import router from "./router";

function App() {
    return (
        <>
            <RouterProvider router={router} />
        </>
    );
}

export default App;

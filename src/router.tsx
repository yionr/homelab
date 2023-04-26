import {createBrowserRouter} from "react-router-dom";
import {Demo01} from "./pages/Demo01";
import {Demo02} from "./pages/Demo02";
import {Demo03} from "./pages/Demo03";
import {Aside} from "./components/Aside/Aside";
export default createBrowserRouter([
    {
        path: "/",
        element: <Aside />,
        children: [
            {
                path: 'demo01',
                element: <Demo02/>
            },
            {
                path: 'demo02',
                element: <Demo01/>
            },
            {
                path: 'demo03',
                element: <Demo03/>
            },
        ]
    },

])
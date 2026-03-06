import { createBrowserRouter } from "react-router";
import { Root } from "./pages/Root";
import { Home } from "./pages/Home";
import { Products } from "./pages/Products";
import { ProductDetail } from "./pages/ProductDetail";
import { Configure } from "./pages/Configure";
import { Craft } from "./pages/Craft";
import { NotFound } from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "products", Component: Products },
      { path: "products/:id", Component: ProductDetail },
      { path: "configure", Component: Configure },
      { path: "craft", Component: Craft },
      { path: "*", Component: NotFound },
    ],
  },
]);

import {Router} from "express"

import CartsController from "../controler/CartsController"
import TransactionsController from "../controler/TransactionsController"
const routes = new Router();


routes.get("/carts", CartsController.index);
routes.post("/carts", CartsController.create);
routes.put("/carts/:id", CartsController.update);
routes.delete("/carts/:id", CartsController.destroy);


routes.post("/transactions", TransactionsController.create);


export default routes;
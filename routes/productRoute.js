
import express from "express";
import { requireRole } from "../middleware/roleMiddleware.js";
import { validateProduct, validateProductUpdate } from "../middleware/validationMiddleware.js";
import { createProduct, updateProduct, listProducts } from "../controller/productController.js";

const productRouter = express.Router();

productRouter.post("/", requireRole(["admin", "manager"]), validateProduct, createProduct);
productRouter.put("/:id", requireRole(["admin", "manager"]), validateProductUpdate, updateProduct);
productRouter.get("/", listProducts);

export default productRouter;

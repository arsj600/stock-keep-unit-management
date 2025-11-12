
import express from "express";
import { requireRole } from "../middleware/roleMiddleware.js";
import { validateStock } from "../middleware/validationMiddleware.js";
import { createStock, updateStock, adjustStock, listStocks, analytics } from "../controller/stockController.js";

const stockRouter = express.Router();

stockRouter.post("/", requireRole(["admin", "manager"]), validateStock, createStock);
stockRouter.put("/:id", requireRole(["admin", "manager"]), validateStock, updateStock);
stockRouter.patch("/:id/stock", requireRole(["admin", "manager"]), adjustStock); 
stockRouter.get("/", listStocks);
stockRouter.get("/analytics", requireRole(["admin"]), analytics);

export default stockRouter;

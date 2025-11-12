
import { getDb } from "../config/db.js";
import { ObjectId } from "mongodb";

const collectionName = "stocks";

export async function createStock(req, res) {
  try {
    const db = getDb();
    const { productId, code, stock = 0, price, isActive = true, attributes = {} } = req.body;

   
    const prod = await db.collection("products").findOne({ _id: new ObjectId(productId) });
    if (!prod || !prod.isActive) {
      return res.status(400).json({ success: false, error: "Invalid or inactive product" });
    }

    const doc = {
      product: new ObjectId(productId),
      code,
      stock: Number(stock),
      price: Number(price),
      isActive,
      attributes,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      const result = await db.collection(collectionName).insertOne(doc);
      const inserted = await db.collection(collectionName).findOne({ _id: result.insertedId });
      return res.status(201).json({ success: true, stock: inserted });
    } catch (err) {
      
      if (err.code === 11000) {
        return res.status(400).json({ success: false, error: "Stock code must be unique per product." });
      }
      throw err;
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateStock(req, res) {
  try {
    const db = getDb();
    const { id } = req.params;
    const payload = { ...req.body, updatedAt: new Date() };

   
    if (payload.productId) payload.product = new ObjectId(payload.productId);

    delete payload.productId;

    const result = await db.collection(collectionName).findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: payload },
      { returnDocument: "after" }
    );

    if (!result.value) return res.status(404).json({ success: false, error: "Stock not found" });

    res.json({ success: true, stock: result.value });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ success: false, error: "Stock code must be unique per product." });
    }
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function adjustStock(req, res) {
  try {
    const db = getDb();
    const { id } = req.params;
    const { delta } = req.body; 

    if (typeof delta !== "number") return res.status(400).json({ success: false, error: "delta must be a number" });


    const stockDoc = await db.collection(collectionName).findOne({ _id: new ObjectId(id) });
    if (!stockDoc) return res.status(404).json({ success: false, error: "Stock not found" });

    const newStock = stockDoc.stock + delta;
    if (newStock < 0) return res.status(400).json({ success: false, error: "Stock cannot go below zero." });

    await db.collection(collectionName).updateOne({ _id: stockDoc._id }, { $set: { stock: newStock, updatedAt: new Date() } });

    const updated = await db.collection(collectionName).findOne({ _id: stockDoc._id });
    res.json({ success: true, stock: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function listStocks(req, res) {
  try {
    const db = getDb();
    const {
      productId,
      isActive,
      outOfStock,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortDir = "desc",
      search, 
    } = req.query;

    const filter = {};
    if (productId) filter.product = new ObjectId(productId);
    if (typeof isActive !== "undefined") filter.isActive = isActive === "true";
    if (outOfStock === "true") filter.stock = 0;
    if (search) filter.$or = [{ code: { $regex: search, $options: "i" } }, { "attributes.value": { $regex: search, $options: "i" } }];

    const skip = (Number(page) - 1) * Number(limit);
    const sort = { [sortBy]: sortDir === "desc" ? -1 : 1 };


    const pipeline = [
      { $match: filter },
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "productDoc",
        },
      },
      { $unwind: { path: "$productDoc", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          product: 1,
          code: 1,
          stock: 1,
          price: 1,
          isActive: 1,
          attributes: 1,
          createdAt: 1,
          updatedAt: 1,
          productName: "$productDoc.name",
        },
      },
      { $sort: sort },
      { $skip: skip },
      { $limit: Number(limit) },
    ];

    const stocks = await db.collection(collectionName).aggregate(pipeline).toArray();
    const total = await db.collection(collectionName).countDocuments(filter);

    res.json({ success: true, total, page: Number(page), limit: Number(limit), stocks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function analytics(req, res) {
  try {
    const db = getDb();
    const totalProducts = await db.collection("products").countDocuments();
    const totalStocks = await db.collection(collectionName).countDocuments();
    const outOfStock = await db.collection(collectionName).countDocuments({ stock: 0 });


    const lowStock = await db.collection(collectionName).find({ stock: { $lte: 5 } }).sort({ stock: 1 }).limit(5).toArray();

    res.json({ success: true, totalProducts, totalStocks, outOfStock, lowStock });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
}

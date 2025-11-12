
import { getDb } from "../config/db.js";
import { ObjectId } from "mongodb";

const collectionName = "products";

export async function createProduct(req, res) {
  try {
    const db = getDb();
    const { name, description, categories, price, isActive = true } = req.body;
    const doc = {
      name,
      description,
      categories,
      price,
      isActive,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await db.collection(collectionName).insertOne(doc);
    const inserted = await db.collection(collectionName).findOne({ _id: result.insertedId });
    res.status(201).json({ success: true, product: inserted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateProduct(req, res) {
  try {
    const db = getDb();
    const { id } = req.params;
    const payload = { ...req.body, updatedAt: new Date() };

    const productId = new ObjectId(id);
    const result = await db.collection(collectionName).findOneAndUpdate(
      { _id: productId },
      { $set: payload },
      { returnDocument: "after" }
    );

    if (!result.value) return res.status(404).json({ success: false, error: "Product not found" });

   
    if (typeof req.body.isActive !== "undefined" && req.body.isActive === false) {
      await db.collection("stocks").updateMany({ product: productId, isActive: true }, { $set: { isActive: false, updatedAt: new Date() } });
    }

    res.json({ success: true, product: result.value });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function listProducts(req, res) {
  try {
    const db = getDb();
    const {
      page = 1,
      limit = 10,
      isActive,
      search,
      sortBy = "createdAt",
      sortDir = "desc",
    } = req.query;

    const filter = {};
    if (typeof isActive !== "undefined") filter.isActive = isActive === "true";
    if (search) filter.$text = { $search: search };

    const skip = (Number(page) - 1) * Number(limit);
    const sort = { [sortBy]: sortDir === "desc" ? -1 : 1 };

    const cursor = db.collection(collectionName).find(filter).sort(sort).skip(skip).limit(Number(limit));
    const products = await cursor.toArray();
    const total = await db.collection(collectionName).countDocuments(filter);

    res.json({
      success: true,
      total,
      page: Number(page),
      limit: Number(limit),
      products,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
}

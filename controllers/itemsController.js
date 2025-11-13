// controllers/itemsController.js
const Item = require("../models/Item");

/**
 * GET /api/items?hostelNo=H1
 * List items for a hostel. hostelNo is required as query param.
 */
exports.listItems = async (req, res) => {
  try {
    const hostelNo = req.query.hostelNo || (req.body && req.body.hostelNo);
    if (!hostelNo) {
      return res.status(400).json({ success: false, message: "hostelNo required" });
    }

    // Simple pagination support (optional)
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Number(req.query.limit) || 100);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Item.find({ hostelNo }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Item.countDocuments({ hostelNo }),
    ]);

    return res.json({ success: true, items, meta: { total, page, limit } });
  } catch (err) {
    console.error("listItems:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * GET /api/items/:id
 * Return a single item by id
 */
exports.getItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Item.findById(id);
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });
    return res.json({ success: true, item });
  } catch (err) {
    console.error("getItem:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * POST /api/items
 * Create new item
 * Body: { name, price, rebate?, isTodayMessOff?, diet?, hostelNo }
 * If you have authentication, you should ensure that the butler is allowed to create for that hostelNo.
 */
exports.createItem = async (req, res) => {
  try {
    const { name, price, rebate = 0, isTodayMessOff = false, diet = 0, hostelNo } = req.body;
    if (!name || price == null || !hostelNo) {
      return res.status(400).json({ success: false, message: "name, price and hostelNo are required" });
    }

    // Optional: enforce numeric and non-negative
    const item = new Item({
      name: String(name).trim(),
      price: Number(price),
      rebate: Number(rebate) || 0,
      isTodayMessOff: !!isTodayMessOff,
      diet: Number(diet) || 0,
      hostelNo,
    });

    await item.save();
    return res.json({ success: true, item });
  } catch (err) {
    console.error("createItem:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * PUT /api/items/:id
 * Update an item partially or fully.
 * Accepts fields: name, price, rebate, isTodayMessOff, diet, hostelNo
 */
exports.updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = {};
    const allowed = ["name", "price", "rebate", "isTodayMessOff", "diet", "hostelNo"];

    allowed.forEach((k) => {
      if (Object.prototype.hasOwnProperty.call(req.body, k)) {
        updates[k] = req.body[k];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: "No valid fields provided for update" });
    }

    // Optionally: you can check permissions here (e.g., butler.hostelNo === updates.hostelNo or existing item's hostel)
    const item = await Item.findByIdAndUpdate(id, { $set: updates }, { new: true });
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });

    return res.json({ success: true, item });
  } catch (err) {
    console.error("updateItem:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * DELETE /api/items/:id
 */
exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Item.findByIdAndDelete(id);
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });
    return res.json({ success: true, message: "Deleted", item });
  } catch (err) {
    console.error("deleteItem:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get items in lite format: [{ name, price }]
exports.getItemsLite = async (req, res) => {
  try {
    const hostelNo = req.query.hostelNo; // optional filter

    const query = hostelNo ? { hostelNo } : {};

    // Only select required fields
    const items = await Item.find(query).select("name price").sort({ name: 1 });

    // Convert to simple array
    const formatted = items.map(it => ({
      name: it.name,
      price: it.price
    }));

    return res.json({ success: true, items: formatted });

  } catch (err) {
    console.error("getItemsLite:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while returning lite items"
    });
  }
};

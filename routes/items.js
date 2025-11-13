const express = require("express");
const router = express.Router();
const itemsCtrl = require("../controllers/itemsController");

router.get("/", itemsCtrl.listItems);
router.get("/lite/all", itemsCtrl.getItemsLite);   // ⭐ NEW ROUTE
router.get("/:id", itemsCtrl.getItem);
router.post("/", itemsCtrl.createItem);
router.put("/:id", itemsCtrl.updateItem);
router.delete("/:id", itemsCtrl.deleteItem);

module.exports = router;

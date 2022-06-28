var express = require("express");
var router = express.Router();

// Require our controllers.
var card_controller = require("../controllers/cardController");
var element_typeController = require("../controllers/element_typeController");
var card_instanceController = require("../controllers/cardinstanceController");

// GET catalog home page.
router.get("/", card_controller.index);

// GET request for creating a Book. NOTE This must come before routes that display Book (uses id).
router.get("/card/create", card_controller.card_create_get);

// POST request for creating Book.
router.post("/card/create", card_controller.card_create_post);

// GET request to delete Book.
router.get("/card/:id/delete", card_controller.card_delete_get);

// POST request to delete Book.
router.post("/card/:id/delete", card_controller.card_delete_post);

// GET request to update Book.
router.get("/card/:id/update", card_controller.card_update_get);

// POST request to update Book.
router.post("/card/:id/update", card_controller.card_update_post);

// GET request for one Book.
router.get("/card/:id", card_controller.card_detail);

// GET request for list of all Book.
router.get("/cards", card_controller.card_list);

/// GENRE ROUTES ///

// GET request for creating a Element Type. NOTE This must come before route that displays Element Type (uses id).
router.get(
  "/element_type/create",
  element_typeController.element_type_create_get
);

// POST request for creating Element Type.
router.post(
  "/element_type/create",
  element_typeController.element_type_create_post
);

// GET request to delete Element Type.
router.get(
  "/elementtype/:id/delete",
  element_typeController.element_type_delete_get
);

// POST request to delete Element Type.
router.post(
  "/elementtype/:id/delete",
  element_typeController.element_type_delete_post
);

// GET request for one Element Type.
router.get("/elementtype/:id", element_typeController.element_type_detail);

// GET request for list of all Element Type.
router.get("/elementtypes", element_typeController.element_type_list);

/// CARDINSTANCE ROUTES ///

// GET request for creating a CardInstance. NOTE This must come before route that displays CardInstance (uses id).
router.get(
  "/cardinstance/create",
  card_instanceController.cardinstance_create_get
);

// POST request for creating CardInstance.
router.post(
  "/cardinstance/create",
  card_instanceController.cardinstance_create_post
);

// GET request to delete CardInstance.
router.get(
  "/cardinstance/:id/delete",
  card_instanceController.cardinstance_delete_get
);

// POST request to delete CardInstance.
router.post(
  "/cardinstance/:id/delete",
  card_instanceController.cardinstance_delete_post
);

// GET request to update CardInstance.
router.get(
  "/cardinstance/:id/update",
  card_instanceController.cardinstance_update_get
);

// POST request to update CardInstance.
router.post(
  "/cardinstance/:id/update",
  card_instanceController.cardinstance_update_post
);

// GET request for one CardInstance.
router.get("/cardinstance/:id", card_instanceController.cardinstance_detail);

// GET request for list of all CardInstance.
router.get("/cardinstances", card_instanceController.cardinstance_list);

module.exports = router;

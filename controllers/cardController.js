var Card = require("../models/card");
var Element_Type = require("../models/element_type");
var CardInstance = require("../models/card_instance");

const { body, validationResult } = require("express-validator");

var async = require("async");

exports.index = function (req, res) {
  async.parallel(
    {
      card_count: function (callback) {
        Card.countDocuments({}, callback);
      },
      card_instance_count: function (callback) {
        CardInstance.countDocuments({}, callback);
      },
      card_instance_available_count: function (callback) {
        CardInstance.countDocuments({ status: "Available" }, callback);
      },
      element_type_count: function (callback) {
        Element_Type.countDocuments({}, callback);
      },
    },
    function (err, results) {
      res.render("index", {
        title: "Pokemon Index Home",
        error: err,
        data: results,
      });
    }
  );
};

// Display list of all cards.
exports.card_list = function (req, res, next) {
  Card.find({}, "title")
    .populate("title")
    .sort({ title: 1 })
    .exec(function (err, list_cards) {
      if (err) {
        return next(err);
      } else {
        // Successful, so render
        res.render("card_list", { title: "Card List", card_list: list_cards });
      }
    });
};

// Display detail page for a specific card.
exports.card_detail = function (req, res, next) {
  async.parallel(
    {
      card: function (callback) {
        Card.findById(req.params.id).populate("element_type").exec(callback);
      },
      card_instance: function (callback) {
        CardInstance.find({ card: req.params.id }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.card == null) {
        // No results.
        var err = new Error("Card not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      res.render("card_detail", {
        title: results.card.title,
        card: results.card,
        card_instances: results.card_instance,
      });
    }
  );
};

// Display card create form on GET.
exports.card_create_get = function (req, res, next) {
  // Get all authors and element_types, which we can use for adding to our card.
  async.parallel(
    {
      element_types: function (callback) {
        Element_Type.find(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      res.render("card_form", {
        title: "Create Card",
        element_types: results.element_types,
      });
    }
  );
};

// Handle card create on POST.
exports.card_create_post = [
  // Convert the element_type to an array.
  (req, res, next) => {
    if (!(req.body.element_type instanceof Array)) {
      if (typeof req.body.element_type === "undefined")
        req.body.element_type = [];
      else req.body.element_type = new Array(req.body.element_type);
    }
    next();
  },

  // Validate and sanitize fields.
  body("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("summary", "Summary must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("element_type.*").escape(),
  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Card object with escaped and trimmed data.
    var card = new Card({
      title: req.body.title,
      summary: req.body.summary,
      element_type: req.body.element_type,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all authors and element_types for form.
      async.parallel(
        {
          element_types: function (callback) {
            Element_Type.find(callback);
          },
        },
        function (err, results) {
          if (err) {
            return next(err);
          }

          // Mark our selected element_types as checked.
          for (let i = 0; i < results.element_types.length; i++) {
            if (card.element_type.indexOf(results.element_types[i]._id) > -1) {
              results.element_types[i].checked = "true";
            }
          }
          res.render("card_form", {
            title: "Create Card",
            element_types: results.element_types,
            card: card,
            errors: errors.array(),
          });
        }
      );
      return;
    } else {
      // Data from form is valid. Save card.
      card.save(function (err) {
        if (err) {
          return next(err);
        }
        // Successful - redirect to new card record.
        res.redirect(card.url);
      });
    }
  },
];

// Display card delete form on GET.
exports.card_delete_get = function (req, res, next) {
  async.parallel(
    {
      card: function (callback) {
        Card.findById(req.params.id).populate("element_type").exec(callback);
      },
      card_cardinstances: function (callback) {
        CardInstance.find({ card: req.params.id }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.card == null) {
        // No results.
        res.redirect("/catalog/cards");
      }
      // Successful, so render.
      res.render("card_delete", {
        title: "Delete Card",
        card: results.card,
        card_instances: results.card_cardinstances,
      });
    }
  );
};

// Handle card delete on POST.
exports.card_delete_post = function (req, res, next) {
  // Assume the post has valid id (ie no validation/sanitization).

  async.parallel(
    {
      card: function (callback) {
        Card.findById(req.body.id).populate("element_type").exec(callback);
      },
      card_cardinstances: function (callback) {
        CardInstance.find({ card: req.body.id }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      // Success
      if (results.card_cardinstances.length > 0) {
        // Card has card_instances. Render in same way as for GET route.
        res.render("card_delete", {
          title: "Delete Card",
          card: results.card,
          card_instances: results.card_cardinstances,
        });
        return;
      } else {
        // Card has no CardInstance objects. Delete object and redirect to the list of cards.
        Card.findByIdAndRemove(req.body.id, function deleteCard(err) {
          if (err) {
            return next(err);
          }
          // Success - got to cards list.
          res.redirect("/catalog/cards");
        });
      }
    }
  );
};

// Display card update form on GET.
exports.card_update_get = function (req, res, next) {
  // Get card, authors and element_types for form.
  async.parallel(
    {
      card: function (callback) {
        Card.findById(req.params.id).populate("element_type").exec(callback);
      },
      element_types: function (callback) {
        Element_Type.find(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.card == null) {
        // No results.
        var err = new Error("Card not found");
        err.status = 404;
        return next(err);
      }
      // Success.
      // Mark our selected element_types as checked.
      for (
        var all_g_iter = 0;
        all_g_iter < results.element_types.length;
        all_g_iter++
      ) {
        for (
          var card_g_iter = 0;
          card_g_iter < results.card.element_type.length;
          card_g_iter++
        ) {
          if (
            results.element_types[all_g_iter]._id.toString() ===
            results.card.element_type[card_g_iter]._id.toString()
          ) {
            results.element_types[all_g_iter].checked = "true";
          }
        }
      }
      res.render("card_form", {
        title: "Update Card",
        element_types: results.element_types,
        card: results.card,
      });
    }
  );
};

// Handle card update on POST.
exports.card_update_post = [
  // Convert the element_type to an array.
  (req, res, next) => {
    if (!(req.body.element_type instanceof Array)) {
      if (typeof req.body.element_type === "undefined")
        req.body.element_type = [];
      else req.body.element_type = new Array(req.body.element_type);
    }
    next();
  },

  // Validate and sanitize fields.
  body("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("summary", "Summary must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("element_type.*").escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Card object with escaped/trimmed data and old id.
    var card = new Card({
      title: req.body.title,
      summary: req.body.summary,
      element_type:
        typeof req.body.element_type === "undefined"
          ? []
          : req.body.element_type,
      _id: req.params.id, // This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all authors and element_types for form
      async.parallel(
        {
          element_types: function (callback) {
            Element_Type.find(callback);
          },
        },
        function (err, results) {
          if (err) {
            return next(err);
          }

          // Mark our selected element_types as checked.
          for (let i = 0; i < results.element_types.length; i++) {
            if (card.element_type.indexOf(results.element_types[i]._id) > -1) {
              results.element_types[i].checked = "true";
            }
          }
          res.render("card_form", {
            title: "Update Card",
            element_types: results.element_types,
            card: card,
            errors: errors.array(),
          });
        }
      );
      return;
    } else {
      // Data from form is valid. Update the record.
      Card.findByIdAndUpdate(req.params.id, card, {}, function (err, thecard) {
        if (err) {
          return next(err);
        }
        // Successful - redirect to card detail page.
        res.redirect(thecard.url);
      });
    }
  },
];

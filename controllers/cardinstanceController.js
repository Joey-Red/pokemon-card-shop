var CardInstance = require("../models/card_instance");
var Card = require("../models/card");
var async = require("async");

const { body, validationResult } = require("express-validator");

// Display list of all CardInstances.
exports.cardinstance_list = function (req, res, next) {
  CardInstance.find()
    .populate("card")
    .exec(function (err, list_cardinstances) {
      if (err) {
        return next(err);
      }
      // Successful, so render.
      res.render("cardinstance_list", {
        title: "Card Instance List",
        cardinstance_list: list_cardinstances,
      });
    });
};

// Display detail page for a specific CardInstance.
exports.cardinstance_detail = function (req, res, next) {
  CardInstance.findById(req.params.id)
    .populate("card")
    .exec(function (err, cardinstance) {
      if (err) {
        return next(err);
      }
      if (cardinstance == null) {
        // No results.
        var err = new Error("Card copy not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      res.render("cardinstance_detail", {
        title: "Card:",
        cardinstance: cardinstance,
      });
    });
};

// Display CardInstance create form on GET.
exports.cardinstance_create_get = function (req, res, next) {
  Card.find({}, "title").exec(function (err, cards) {
    if (err) {
      return next(err);
    }
    // Successful, so render.
    res.render("cardinstance_form", {
      title: "Create CardInstance",
      card_list: cards,
    });
  });
};

// Handle CardInstance create on POST.
exports.cardinstance_create_post = [
  // Validate and sanitize fields.
  body("card", "Card must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("status").escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a CardInstance object with escaped and trimmed data.
    var cardinstance = new CardInstance({
      card: req.body.card,
      status: req.body.status,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values and error messages.
      Card.find({}, "title").exec(function (err, cards) {
        if (err) {
          return next(err);
        }
        // Successful, so render.
        res.render("cardinstance_form", {
          title: "Create CardInstance",
          card_list: cards,
          selected_card: cardinstance.card._id,
          errors: errors.array(),
          cardinstance: cardinstance,
        });
      });
      return;
    } else {
      // Data from form is valid
      cardinstance.save(function (err) {
        if (err) {
          return next(err);
        }
        // Successful - redirect to new record.
        res.redirect(cardinstance.url);
      });
    }
  },
];

// Display CardInstance delete form on GET.
exports.cardinstance_delete_get = function (req, res, next) {
  CardInstance.findById(req.params.id)
    .populate("card")
    .exec(function (err, cardinstance) {
      if (err) {
        return next(err);
      }
      if (cardinstance == null) {
        // No results.
        res.redirect("/catalog/cardinstances");
      }
      // Successful, so render.
      res.render("cardinstance_delete", {
        title: "Delete CardInstance",
        cardinstance: cardinstance,
      });
    });
};

// Handle CardInstance delete on POST.
exports.cardinstance_delete_post = function (req, res, next) {
  // Assume valid CardInstance id in field.
  CardInstance.findByIdAndRemove(req.body.id, function deleteCardInstance(err) {
    if (err) {
      return next(err);
    }
    // Success, so redirect to list of CardInstance items.
    res.redirect("/catalog/cardinstances");
  });
};

// Display CardInstance update form on GET.
exports.cardinstance_update_get = function (req, res, next) {
  // Get card, authors and genres for form.
  async.parallel(
    {
      cardinstance: function (callback) {
        CardInstance.findById(req.params.id).populate("card").exec(callback);
      },
      cards: function (callback) {
        Card.find(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.cardinstance == null) {
        // No results.
        var err = new Error("Card copy not found");
        err.status = 404;
        return next(err);
      }
      // Success.
      res.render("cardinstance_form", {
        title: "Update  CardInstance",
        card_list: results.cards,
        selected_card: results.cardinstance.card._id,
        cardinstance: results.cardinstance,
      });
    }
  );
};

// Handle CardInstance update on POST.
exports.cardinstance_update_post = [
  // Validate and sanitize fields.
  body("card", "Card must be specified").trim().isLength({ min: 1 }).escape(),
  body("status").escape(),
  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a CardInstance object with escaped/trimmed data and current id.
    var cardinstance = new CardInstance({
      card: req.body.card,
      status: req.body.status,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      // There are errors so render the form again, passing sanitized values and errors.
      Card.find({}, "title").exec(function (err, cards) {
        if (err) {
          return next(err);
        }
        // Successful, so render.
        res.render("cardinstance_form", {
          title: "Update CardInstance",
          card_list: cards,
          selected_card: cardinstance.card._id,
          errors: errors.array(),
          cardinstance: cardinstance,
        });
      });
      return;
    } else {
      // Data from form is valid.
      CardInstance.findByIdAndUpdate(
        req.params.id,
        cardinstance,
        {},
        function (err, thecardinstance) {
          if (err) {
            return next(err);
          }
          // Successful - redirect to detail page.
          res.redirect(thecardinstance.url);
        }
      );
    }
  },
];

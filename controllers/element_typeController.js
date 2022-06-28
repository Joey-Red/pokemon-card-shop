var Element_Type = require("../models/element_type");
var Card = require("../models/card");
var async = require("async");

const { body, validationResult } = require("express-validator");

// Display list of all Element_Type.
exports.element_type_list = function (req, res, next) {
  Element_Type.find()
    .sort([["name", "ascending"]])
    .exec(function (err, list_element_types) {
      if (err) {
        return next(err);
      }
      // Successful, so render.
      res.render("element_type_list", {
        title: "Element Type List",
        list_element_types: list_element_types,
      });
    });
};

// Display detail page for a specific Element_Type.
exports.element_type_detail = function (req, res, next) {
  async.parallel(
    {
      element_type: function (callback) {
        Element_Type.findById(req.params.id).exec(callback);
      },

      element_type_cards: function (callback) {
        Card.find({ element_type: req.params.id }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.element_type == null) {
        // No results.
        var err = new Error("Element Type not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      res.render("element_type_detail", {
        title: "Element Type Detail",
        element_type: results.element_type,
        element_type_cards: results.element_type_cards,
      });
    }
  );
};

// Display Element_Type create form on GET.
exports.element_type_create_get = function (req, res, next) {
  res.render("element_type_form", { title: "Create Element Type" });
};

// Handle Element_Type create on POST.
exports.element_type_create_post = [
  // Validate and santise the name field.
  body("name", "Element_Type name must contain at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a element_type object with escaped and trimmed data.
    var element_type = new Element_Type({ name: req.body.name });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render("element_type_form", {
        title: "Create Element Type",
        element_type: element_type,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.
      // Check if Element_Type with same name already exists.
      Element_Type.findOne({ name: req.body.name }).exec(function (
        err,
        found_element_type
      ) {
        if (err) {
          return next(err);
        }

        if (found_element_type) {
          // Element_Type exists, redirect to its detail page.
          res.redirect(found_element_type.url);
        } else {
          element_type.save(function (err) {
            if (err) {
              return next(err);
            }
            // Element_Type saved. Redirect to element_type detail page.
            res.redirect(element_type.url);
          });
        }
      });
    }
  },
];

// Display Element_Type delete form on GET.
exports.element_type_delete_get = function (req, res, next) {
  async.parallel(
    {
      element_type: function (callback) {
        Element_Type.findById(req.params.id).exec(callback);
      },
      element_type_cards: function (callback) {
        Card.find({ element_type: req.params.id }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.element_type == null) {
        // No results.
        res.redirect("/catalog/elementtypes");
      }
      // Successful, so render.
      res.render("element_type_delete", {
        title: "Delete Element Type",
        element_type: results.element_type,
        element_type_cards: results.element_type_cards,
      });
    }
  );
};

// Handle Element_Type delete on POST.
exports.element_type_delete_post = function (req, res, next) {
  async.parallel(
    {
      element_type: function (callback) {
        Element_Type.findById(req.params.id).exec(callback);
      },
      element_type_cards: function (callback) {
        Card.find({ element_type: req.params.id }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      // Success
      if (results.element_type_cards.length > 0) {
        // Element_Type has cards. Render in same way as for GET route.
        res.render("element_type_delete", {
          title: "Delete Element Type",
          element_type: results.element_type,
          element_type_cards: results.element_type_cards,
        });
        return;
      } else {
        // Element_Type has no cards. Delete object and redirect to the list of element_types.
        Element_Type.findByIdAndRemove(
          req.body.id,
          function deleteElement_Type(err) {
            if (err) {
              return next(err);
            }
            // Success - go to element_types list.
            res.redirect("/catalog/elementtypes");
          }
        );
      }
    }
  );
};

// Display Element_Type update form on GET.
exports.element_type_update_get = function (req, res, next) {
  Element_Type.findById(req.params.id, function (err, element_type) {
    if (err) {
      return next(err);
    }
    if (element_type == null) {
      // No results.
      var err = new Error("Element_Type not found");
      err.status = 404;
      return next(err);
    }
    // Success.
    res.render("element_type_form", {
      title: "Update Element Type",
      element_type: element_type,
    });
  });
};

// Handle Element_Type update on POST.
exports.element_type_update_post = [
  // Validate and sanitze the name field.
  body("name", "Element Type name must contain at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request .
    const errors = validationResult(req);

    // Create a element_type object with escaped and trimmed data (and the old id!)
    var element_type = new Element_Type({
      name: req.body.name,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values and error messages.
      res.render("element_type_form", {
        title: "Update Element Type",
        element_type: element_type,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid. Update the record.
      Element_Type.findByIdAndUpdate(
        req.params.id,
        element_type,
        {},
        function (err, theelement_type) {
          if (err) {
            return next(err);
          }
          // Successful - redirect to element_type detail page.
          res.redirect(theelement_type.url);
        }
      );
    }
  },
];

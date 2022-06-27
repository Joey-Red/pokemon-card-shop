var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var Element_TypeSchema = new Schema({
  name: {
    type: Schema.Types.String,
    required: true,
    maxLength: 100,
    minLength: 3,
  },
});

// Virtual for Element_Type's URL
Element_TypeSchema.virtual("url").get(function () {
  return "/catalog/elementtype/" + this._id;
});

//Export model
module.exports = mongoose.model("Element_Type", Element_TypeSchema);

var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var CardSchema = new Schema({
  title: { type: String, required: true },
  summary: { type: String, required: true },
  element_type: [{ type: Schema.Types.ObjectId, ref: "Element_Type" }],
});

// Virtual for Card's URL
CardSchema.virtual("url").get(function () {
  return "/catalog/card/" + this._id;
});

//Export model
module.exports = mongoose.model("Card", CardSchema);

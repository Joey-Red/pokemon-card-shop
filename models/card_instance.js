var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var CardInstanceSchema = new Schema({
  card: { type: Schema.Types.ObjectId, ref: "Card", required: true }, //reference to the associated card
  card_price: { type: Number, required: true },
  status: {
    type: String,
    required: true,
    enum: ["Available", "Not Available"],
    default: "Available",
  },
});

// Virtual for cardinstance's URL
CardInstanceSchema.virtual("url").get(function () {
  return "/catalog/cardinstance/" + this._id;
});

//Export model
module.exports = mongoose.model("CardInstance", CardInstanceSchema);

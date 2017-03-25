var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ListSchema = new Schema({
  name: String,
  owner: String,
  coOwners: [{facebookId: String, accepted: Boolean}],
  items: [{name: String, picked: Boolean, quantity: Number}],
  uniqueItems: [String],
  createdAt: Date
});

module.exports = mongoose.model('List', ListSchema);

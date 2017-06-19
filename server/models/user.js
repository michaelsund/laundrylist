var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  firstName: {type: String, unique: false},
  lastName: {type: String, unique: false},
  pictureURL: {type: String},
  facebookId: {type: String, unique: true},
  pictureBlob: {data: Buffer, contentType: String}
});

module.exports = mongoose.model('User', UserSchema);

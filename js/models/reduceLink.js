var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var LinkSchema = new Schema({
  src: String,
  reduceLink: String,
  linkInfo: String,
  click: {
    type: Number,
    default: 0
  },
  tags: Array
});

module.exports = mongoose.model('Link', LinkSchema);

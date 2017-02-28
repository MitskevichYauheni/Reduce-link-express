var mongoose = require('mongoose');
var Link = require('./reduceLink');

var Schema = mongoose.Schema;

var userSchema = mongoose.Schema({
  name: String,
  password: String,
  links: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Link' }]
})

module.exports = mongoose.model('User', userSchema);

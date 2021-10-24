const mongoose = require('mongoose');
const reqString = {
    type: mongoose.SchemaTypes.String,
    required: true
}
const NoteSchema = new mongoose.Schema({
    notes: [String],
    userId: reqString,
    userName: reqString,
})

module.exports = mongoose.model('notes', NoteSchema);
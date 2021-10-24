const mongoose = require('mongoose');
const { Schema } = mongoose;

const reqString = {
    type: String,
    required: true,
}

const SpamSchema = new Schema({
    guildId: reqString,
    spammers: {
        type: Object,
        required: true,
    }
});


module.exports = mongoose.model('spammers', SpamSchema)
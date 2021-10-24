const mongoose = require('mongoose');
const { Schema } = mongoose;

const reqString = {
    type: String,
    required: true,
}

const WarnSchema = new Schema({
    guildId: reqString,
    userId: reqString,
    warnings: {
        type: [Object],
        required: true,
    }
});


module.exports = mongoose.model('warnings', WarnSchema)
const mongoose = require('mongoose');
const { Schema } = mongoose;

const reqString = {
    type: String,
    required: true,
}

const SettingsSchema = new Schema({
    guildId: reqString,
    ignoredChannels: { type: [String], default: [] },
    defaultPrefix: { type: String, default: "[]" },
    prefixes: { type: [String], default: [] },
    settings: { type: Object, default: {} },
    features: { type: Object, default: {} }
});


module.exports = mongoose.model('settings', SettingsSchema)
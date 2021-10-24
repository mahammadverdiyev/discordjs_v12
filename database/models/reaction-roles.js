const mongoose = require('mongoose');
const { Schema } = mongoose;

const reqString = {
    type: String,
    required: true,
}

const ReactionRolesSchema = new Schema({
    guildId: reqString,
    reactionRoles: Object,
});


module.exports = mongoose.model('reaction-roles', ReactionRolesSchema)
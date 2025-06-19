const mongoose = require('mongoose');

const hariniSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    harini: {
        type: Boolean,
        default: false
    },
    progress: {
        type: Number,
        default: 0
    },
    hariniborncheck: {
        type: Boolean,
        default: false
    },
    food: {
        type: Number,
        default: 3
    },
    name: {
        type: String,
        default: '하리니'
    },
    level: {
        type: Number,
        default: 1
    },
    exp: {
        type: Number,
        default: 0
    },
    itemLists: {
        type: { type: String },
        name: { type: String },
        code: { type: String },
        id: { type: Number }
    },
    evolved: {
        type: Boolean,
        default: false
    },
    randomLists: [{
        type: { type: String },
        name: { type: String },
        code: { type: String },
        id: { type: Number }
    }],
    shopLists: [{
        type: { type: String },
        name: { type: String },
        code: { type: String },
        id: { type: Number }
    }],
    hasLists: [{
    type: { type: String },
    name: { type: String },
    code: { type: String },
    id: { type: Number }
}],
requiredExp: {
    type: Number,
    default: 100
}
});


module.exports = mongoose.model('harini', hariniSchema);


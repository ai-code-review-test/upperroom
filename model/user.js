const mongoose = require('mongoose');
const moment = require('moment-timezone');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: String,
    ageRange: String,
    birth: String,
    phone: Number,
    password: String,
    name: String,
    userkeydi: {
        type: String,
        required: true,
    },
    userkeyci: {
        type: String,
    },
    klip: {
        type: String,
        default: "notklip"
    },
    marketingAgreement: {
        type: Boolean,
        default: false
    },
    attendanceAgreement: {
        type: Boolean,
        default: false
    },    
    challengeAgreement: {
        type: Boolean,
        default: false
    },    
    receiptAgreement: {
        type: Boolean,
        default: false
    },    
    gender: String,
    refererCode: String,
    recommender: String,
    points: {
        type: Number,
        default: 0
    },
    pushAlert: {
        type: Boolean,
        default: false
    },
    lastUploadTime: Date,
    consecutiveWeeks: {
        type: Number,
        default: 0
    },
    consecutiveUploads: {
        type: Number,
        default: 0
    },
    canPurchaseTime: String,
    ageRange: String,
    userID: {
        type: String,
    },
    bubbleUser: {
        type: Boolean,
        default: false
    },
    datedoc: {
        type: Date,
        default: () => new Date(Date.now()).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })
    },
    isDeleted: {
        type: String,
        default: "false"
    },
    deleteDate: {
        type: String,
        default: "아니오"
    },
    userID: {
        type: String,
        default: "notbubble"
    },
    playerID: {
        type: String,
        default: "notbubble"
    },
    onboarding: {
        type: Boolean,
        default: false
    },
    socialType: {
        type: String,
        default: "email"
    },
    gmoToken: {
        type: String,
    },
    klip: {
        type: String,
        default: "notklip"
    },
    adid: {
        type: String,
    },
    createdDate: {
        type: String,
        default: () => moment().tz('Asia/Seoul').format('YYYY MMM D, h:mm A')
        // default: () => new Date(Date.now()).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })
    },
    modifiedDate: {
        type: String,
        default: () => moment().tz('Asia/Seoul').format('YYYY MMM D, h:mm A')
        // default: () => new Date(Date.now()).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })
    }
});



module.exports = mongoose.model('User', userSchema);
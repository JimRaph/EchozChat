import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,

        trim: true
    },
    avatar: {
        type: String,
        default: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'
    },
    status:{
        type: String,
        default: ""
    },
    isOnline:{
        type: Boolean,
        default: false
    },
    Phone:{
        type: String,
        required: true,
        unique: true
    },
    countryCode:{
        type: String,
        required: true,
        default: '+1'
    },
    lastLogin:{
        type: Date,
        default: Date.now
    },
    verificationCode: String,
    isVerified: {
        type: Boolean,
        default: false
    },
    contacts: [{
        contact: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        firstname: String,
        lastname: String,
        lastMessage: {
            type: String
        },
        lastRead: {
            type: Date
        }
    }]
    },
    {timestamps: true}
)

export const User = mongoose.model('User', userSchema)
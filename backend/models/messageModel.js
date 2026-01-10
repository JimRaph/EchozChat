import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    chat:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat',
        required: true
    },
    sender:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    type:{
        type: String,
        required: true,
        enum:['text', 'image', 'video', 'audio', 'document', 'media']
    },
    content: {type: String,},
    media: [{
        url: { type: String, required: true },
        displayUrl: {type: String, required: true},
        originalExtension: {type: String, required: true},
        type: {type: String, required: true},
        format: { type: String, required: true },
        filename: {type: String, required: true}
    }],
    isRead: {
        type: Boolean,
        default: false
    },
    readBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    deliveredTo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    status: {
        type: String,
        enum: ['sending', 'sent', 'delivered', 'read', 'failed'],
        default: 'sending'
        },
    deliveredAt: {
    type: Date
    },
    starredBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
    readAt: {
    type: Date
    },
    clientMessageId: String, 
    isOptimistic: Boolean 
}, {timestamps: true});

export const Message = mongoose.model('Message', messageSchema);
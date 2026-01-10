import mongoose from "mongoose";

const statusSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,  
        trim: true
    },
    media: {
        type: String,  
    },
    caption: {
        type: String, 
        trim: true
    },
    type: {
        type: String,
        required: true,
        enum: ['image', 'video', 'text']
    },
    viewedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    viewsCount: {
        type: Number,
        default: 0  
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), 
        index: { expires: '24h' }
    }
}, { timestamps: true });

// Export the model
export const Status = mongoose.model('Status', statusSchema);

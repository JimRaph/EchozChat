import mongoose from "mongoose";

const callSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['audio', 'video'],
        index: true
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    avatar: {
        type: String,
        trim: true,
        default: null
        },
    caller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    startTime: {
        type: Date,
        required: true,
        default: Date.now
    },
    endTime: {
        type: Date,
        index: true
    },
    status: {
        type: String,
        enum: ['initiating', 'ringing', 'active', 'ended'],
        default: 'initiating',
        index: true
    },
    picked:{
        type: Boolean,
        default: false,
        index: true
    },
    isGroupCall: {
        type: Boolean,
        default: false,
        index: true
    },
    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat',
        index: true
    },
    connectionData: {
        offer: { type: mongoose.Schema.Types.Mixed },
        answer: { type: mongoose.Schema.Types.Mixed },
        iceCandidates: [mongoose.Schema.Types.Mixed]
    },
    // For call quality metrics
    qualityMetrics: {
        packetsLost: Number,
        jitter: Number,
        latency: Number
    }
}, { 
    timestamps: true,
    toJSON: { 
        virtuals: true,
        transform: function(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

// Indexes for faster queries
callSchema.index({ participants: 1, status: 1 });
callSchema.index({ caller: 1, status: 1 });
callSchema.index({ chatId: 1, status: 1 });


callSchema.virtual('duration').get(function () {
  if (!this.startTime || !this.endTime) return null;
  return Math.floor((this.endTime - this.startTime) / 1000);
});

// Virtual for call duration in minutes
callSchema.virtual('durationMinutes').get(function() {
    return this.duration ? Math.floor(this.duration / 60) : null;
});

// Pre-save hook to update duration
callSchema.pre('save', function(next) {
    if (this.isModified('endTime') && this.endTime) {
        this.duration = Math.floor((this.endTime - this.startTime) / 1000);
    }
    next();
});

export const Call = mongoose.model('Call', callSchema);
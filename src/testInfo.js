import mongoose from 'mongoose';
const { Schema } = mongoose;

const testInfoSchema = new Schema({
    gtid: {
        type: String,
        required: true
    },
    testDate: {
        type: Date,
        required: true
    },
    testResult: {
        type: Boolean,
        required: true
    },
    documentationPath: {
        type: String,
        required: true
    },
    approvedByHR: {
        type: Boolean,
        required: true
    }
}, {timestamps: true});

const testInfo = mongoose.model('testInfo', testInfoSchema);
export { testInfo };
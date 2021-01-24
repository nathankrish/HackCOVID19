import mongoose from 'mongoose';
const { Schema } = mongoose;

const userSchema = new Schema({
    gtid: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    }
}, {timestamps: true});

const user = mongoose.model('user', userSchema);
export { user };
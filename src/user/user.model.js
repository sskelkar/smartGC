import mongoose from 'mongoose';

let userSchema = mongoose.Schema({
    name: {type: String, required: true},
    phone: {type: String, required: true},
    role: {type: String, enum: ['RESIDENT', 'COLLECTOR'], required: true},
    karmaPoints: {type: Number, default: 0}
});
userSchema.virtual('id', () => this._id.toHexString());
userSchema.set('toJSON', {
    virtuals: true
});
const User = mongoose.model('User', userSchema);
export default User;
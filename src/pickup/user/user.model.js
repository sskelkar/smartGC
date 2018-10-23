import mongoose from 'mongoose';

let UserSchema = mongoose.Schema({
    id: {type: String},
    name: {type: String, required: true},
    phone: {type: String, required: true},
    role: {type: String, enum: ['RESIDENT', 'COLLECTOR'], required: true},
    karmaPoints: {type: Number, default: 0}
});

const User = mongoose.model('User', UserSchema);
export default User;
import mongoose from 'mongoose';

let GCRequestSchema = mongoose.Schema({
    latitude: {type: Number, required: true},
    longitude: {type: Number, required: true},
    pickUpTime: {type: Date, required: true} 
});

const GCRequest = mongoose.model('GCRequest', GCRequestSchema);
export default GCRequest;
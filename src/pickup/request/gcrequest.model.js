import mongoose from 'mongoose';

let GCRequestSchema = mongoose.Schema({
    latitude: {type: Number, required: true},
    longitude: {type: Number, required: true},
    locality: {type: String, required: true},
    date: {type: Date, required: true},
    shift: {type: String, required: true}

});

const GCRequest = mongoose.model('GCRequest', GCRequestSchema);
export default GCRequest;
import mongoose from 'mongoose';

let PickupRequestSchema = mongoose.Schema({
    latitude: {type: Number, required: true},
    longitude: {type: Number, required: true},
    locality: {type: String, required: true},
    date: {type: Date, required: true},
    shift: {type: String, required: true},
    residentId: {type: String, required: true}
});

const PickupRequest = mongoose.model('PickupRequest', PickupRequestSchema);
export default PickupRequest;
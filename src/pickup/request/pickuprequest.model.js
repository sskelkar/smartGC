import mongoose from 'mongoose';

export let PickupRequestSchema = mongoose.Schema({
    latitude: {type: Number, required: true},
    longitude: {type: Number, required: true},
    locality: {type: String, required: true},
    date: {type: Date, required: true},
    shift: {type: String, required: true},
    residentId: {type: String, required: true},
    status: {type: String, enum: ['PICKUP_PLANNED', 'PICKUP_DONE'], default: 'PICKUP_PLANNED'}
});

const PickupRequest = mongoose.model('PickupRequest', PickupRequestSchema);
export default PickupRequest;
import mongoose from 'mongoose';
import {PickupRequestSchema} from "../request/pickuprequest.model";

let tripSchema = mongoose.Schema({
    collectorId: {type: String, required: true},
    status: {type: String, enum: ['ACTIVE', 'COMPLETED'], required: true},
    pickups: {type: [PickupRequestSchema], default: [], required: true},
    depotLocation: {type: {latitude: Number, longitude: Number}, default: {latitude: 18.568875, longitude: 73.9109393}},
    collectorLocation: {type: {latitude: Number, longitude: Number}, default: {latitude: 18.568875, longitude: 73.9109393}},
});

tripSchema.virtual('id', () => this._id.toHexString());
tripSchema.set('toJSON', {
    virtuals: true
});

const Trip = mongoose.model('Trip', tripSchema);
export default Trip;
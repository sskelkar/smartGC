import {Shift} from "./shift.model";

const SHIFTS = [
    new Shift('MORNING', '06:00AM - 09:00AM'),
    new Shift('EVENING', '03:00PM - 06:00PM'),
];

export const getShifts = (req, res) => {
    res.send(SHIFTS);
};
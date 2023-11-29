import mongoose from "mongoose";
const { Schema } = mongoose

const bookingSchema = new Schema({
    adventureId: {
        type: Schema.Types.ObjectId,
        ref: 'Adventure',
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    entryFee: {
        type: Number,
        required: true
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    scheduledAt: {
        slotTime: { type: String },
        slotDate: { type: String }
    },
    categoryName:{
        type : String,
        required : true
    }

})

const Booking = mongoose.model('Booking', bookingSchema)
export default Booking
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
    scheduledAt: {
        slotTime: { type: String },
        slotDate: { type: String }
    },
    categoryName:{
        type : String,
        required : true
    },
    image: {
        type : String,
        default:
        "https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436178.jpg?w=740&t=st=1694511037~exp=1694511637~hmac=7afb019f7b279def27b7c8cff245f9ab0ecc12fadc50d085af0db00d777ee63b",

   },
   paymentMethod: {
      type: String,
      enum: ["online", "wallet"],
      default: "online",
    },
    bookingStatus: {
      type: String,
      enum: ["active", "expired"],
      default: "active",
    },
    status: {
      type: String,
      enum: [
        "completed",
        "cancelled",
        "notCompleted",

      ],
      default: "notCompleted",
    },

},
{
    timestamps: { createdAt: "created_at" },
  }
  )

const Booking = mongoose.model('Booking', bookingSchema)
export default Booking
import mongoose from "mongoose";
const { Schema, ObjectId } = mongoose

const PostSchema = new Schema({
    adventure: {
        type: Schema.Types.ObjectId,
        ref: "Adventure",
        required: true
    },
    category: {
        type: String,
        required: true
    },
    image: {
        type: Array
    },
    status: {
        type: Boolean,
        default: false
    }
})

const Posts = mongoose.model("Posts", PostSchema)
export default Posts
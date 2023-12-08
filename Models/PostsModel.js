import mongoose from "mongoose";
const { Schema, ObjectId } = mongoose

const PostSchema = new Schema({
    category: {
        type: String,
        required: true
    },
    image: {
        type: Array
    }
})

const Posts = mongoose.model("Posts", PostSchema)
export default Posts
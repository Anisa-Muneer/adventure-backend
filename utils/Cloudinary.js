import cloudinary from "cloudinary";
import { config } from "dotenv";
import * as fileType from "file-type";
import { createReadStream } from "fs";
import { promisify } from "util";
config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
    secure: true
});



const uploadToClodinary = async (path, folder) => {
    try {
        const data = await cloudinary.v2.uploader.upload(path, { folder })
        return { url: data.url, public_id: data.public_id }
    } catch (error) {
        console.log(error);
    }
}

const MultiUploadCloudinary = async (files, folder) => {
    try {
        const uploadedImages = [];
        for (const file of files) {
            const { path } = file;
            const result = await uploadToClodinary(path, folder);
            if (result.url) {
                uploadedImages.push(result.url);
            }
        }
        return uploadedImages;
    } catch (error) {
        console.log(error);
        throw error;
    }
};




const readFile = promisify(createReadStream);

export const validateImageFormat = async (path) => {
    try {
        const buffer = await readFile(path);
        const type = fileType(buffer);

        if (!type || !["image/jpeg", "image/png", "image/avif"].includes(type.mime)) {
            throw new Error("Invalid image format");
        }
    } catch (error) {
        throw error;
    }
};

export { uploadToClodinary, MultiUploadCloudinary }
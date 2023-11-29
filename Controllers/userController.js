import Adventure from "../Models/adventureModel.js";
import User from "../Models/userModel.js";
import uploadToClodinary from "../utils/Cloudinary.js";

export const getUser = async (req, res) => {
  try {
    const id = req.headers.userId
    console.log(id, 'in ')
    const data = await User.findById(id)
    if (data) {
      return res.status(200).json({ data: data })
    } else {
      return res.status(200).json({ message: 'Data not found' })
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export const updateImage = async (req, res, next) => {
  try {
    const id = req.headers.userId;
    const image = req.file.path;
    const uploadDp = await uploadToClodinary(image, "dp");
    console.log(uploadDp)
    const updated = await User.findByIdAndUpdate(
      { _id: id },
      { $set: { image: uploadDp.url } },
      { new: true }
    );
    console.log(updated)
    if (updated) {
      console.log("updated image");
      return res
        .status(200)
        .json({ data: updated, message: "Profile picture updated" });
    }
    return res.status(202).json({ message: "Upload failed" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

export const adventureFilter = async (req, res, next) => {
  try {
   
    const page = parseInt(req.query.page, 10)
    console.log(page);
    let query = { is_blocked: false, verified: true };
 

    const perPage = 4;
    const skip = (page -1) * perPage;

    const result = await Adventure.aggregate([
      {
        $match: query
      },
      {
        $unwind: "$category"
      },
      {
        $count: "total"
      }
    ]);
    
    const count = result.length > 0 ? result[0].total : 0;
    
  
  
   
    const adventure = await Adventure.aggregate([
      {
        $match: query
      },
      {
        $unwind: "$category"
      },
     
    ]).skip(skip).limit(perPage)

  
  if(adventure){
      return res.status(200).json({ data: adventure, count, pageSize: perPage, page, message: "data found" })
    } else {
      return res.status(200).json({ message: 'data not found' })
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}


export const advProfile = async(req,res,next)=>{
  try {
    const id = req.params.id
    const adventure = await Adventure.findById(id)
    if(adventure){
      return res.status(200).json({data : adventure, message : "Data found"})
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });

  }
}
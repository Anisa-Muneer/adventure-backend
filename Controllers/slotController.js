import mongoose from "mongoose";
import Adventure from "../Models/adventureModel.js";
import Slot from "../Models/slotModel.js";
import moment from 'moment'
import Stripe from "stripe";
import Booking from "../Models/bookingModel.js";
import User from "../Models/userModel.js";


export const addSlots = async(req,res,next)=>{
    try {
       const advId =  req.headers.adventureId;
       const {startTime, endTime, startDate, endDate, category} = req.body
   
       if(new Date(endDate) < new Date(startDate)){
        return res.status(400).json({message : 'End date must be greater than or equal to start date'})
       }
       const slotDuration = 30
       const createdSlots = []

       const currentDate = new Date(startDate)
       const endDateObj = new Date(endDate)

       while(currentDate <= endDateObj){
        const date = currentDate.toLocaleDateString()
        
        const findSlotExist = await Slot.findOne({
            adventure: advId,
            slotes: {
              $elemMatch: {
                slotDate: date,
                $or: [
                  {
                    slotTime: { $gte: startTime, $lt: endTime },
                  },
                  {
                    slotTime: { $lte: startTime },
                    endTime: { $gt: startTime },
                  },
                  {
                    slotTime: { $lt: endTime },
                    endTime: { $gte: endTime },
                  },
                ],
              },
            },
          });
          if (findSlotExist) {
            return res.status(409).json({ message: "Slot already exists" });
          }
    
          const createSlots = generateTimeSlots(
            startTime,
            endTime,
            slotDuration,
            date,
            category,
          );
          createdSlots.push({
            date: currentDate,
            slots: createSlots,
          });
    
          currentDate.setDate(currentDate.getDate() + 1);
       }
       const slotData = createdSlots.map((slotObj) => {
        return {
          adventure: advId,
          slotes: slotObj.slots,
        };
      });
   
  
      const savedSlots = await Slot.create(slotData);
  
      return res.status(200).json(savedSlots);

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

export const slotCategory = async(req,res,next)=>{    
  try {
    const id = req.headers.adventureId
    const data = await Adventure.findById(id)
    if(data){
        return res.status(200).json({ data : data})
    }else{
        return res.status(200).json({message : 'Data not found'})
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}


function generateTimeSlots(startTime, endTime, slotDuration, date ,category) {
  const slots = [];

  const end = new Date(`${date} ${endTime}`);
  const start = new Date(` ${date} ${startTime} `);

  while (start < end) {
    const slotTime = start.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const slotDoc = {
      slotTime: slotTime,
      slotDate: date,
      date: start,
      isBooked: false,
      category : category
    };

    slots.push(slotDoc);
    start.setMinutes(start.getMinutes() + slotDuration);
  }

  return slots;
}

export const getSlotDate = async(req,res,next)=>{
  try {
    
    const advId = req.headers.adventureId
    const result = await Slot.aggregate([
      {$match:{
        adventure : new mongoose.Types.ObjectId(advId)
      }
    },
    {$unwind : "$slotes"},
    {
      $group:{
      _id : "$slotes.slotDate",
      slotDates : {$addToSet : "$slotes.slotDate"}
    },
  },
    {$project:{
      _id : 0,
      slotDates : 1
    }}
    ])
    if(result){
      const slotArray = result.map((item)=>item.slotDates)
      const slotDates = slotArray.flat()
      return res.status(200).json({data : slotDates, message : "Success"})
    }else{
      return res.status(200).json({message : "No slots"})
    }

  } catch (error) {
    return res.status(500).json({ error: error.message });
    }
}

export const getSlots = async(req,res,next)=>{
  try {
   
    const {date} = req.query
    if(!date){
      return res.status(200).json({message : "Date is not found"})
    }
    const advId = req.headers.adventureId
    const data = await Adventure.findById(advId)
    const yesterday = moment().subtract( 1, "days").format("YYYY-MM-DD")
    await Slot.updateMany(
      {
        adventure: data._id,
        "slotes.slotDate": { $lte: yesterday },
      },
      {
        $pull: {
          slotes: {
            slotDate: { $lte: yesterday },
          },
        },
      }
    );

    const availableSlots = await Slot.find({
      adventure: data._id,
      "slotes.slotDate": { $eq: new Date(date) },
    }).exec();
    if (availableSlots) {
      return res.status(200).json({ data: availableSlots, message: "success" });
    } else {
      return res.status(200).json({ message: "slot not available" });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
    }
}

export const getSlotDateUser = async (req, res, next) => {
  try {
    const { adventureId,categoryName } = req.query;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate());
    const result = await Slot.aggregate([
      {
        $match: {
          adventure: new mongoose.Types.ObjectId(adventureId),
          "slotes.category": categoryName,
          // category : categoryName,
          "slotes.slotDate": { $gte: tomorrow },
        },
      },
      { $unwind: "$slotes" },
      {
        $group: {
          _id: "$slotes.slotDate",

          slotDates: { $addToSet: "$slotes.slotDate" },
        },
      },
      {
        $project: {
          _id: 0,
          slotDates: 1,
        },
      },
    ]);
    
    if (result) {
      const slotArray = result.map((item) => item.slotDates);
      const slotDates = slotArray.flat();

      return res.status(200).json({ data: slotDates, message: "success" });
    } else {
      return res.status(200).json({ message: "No slots" });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getSlotsUser = async(req,res,next)=>{
  try {
    const {date, adventureId, categoryName} = req.query
    if(!date){
      return res.status(200).json({message : "Please select a date"})
    }
    const availableSlots = await Slot.find({
      adventure : adventureId,
      category : categoryName,
      "slotes.slotDate" : new Date(date),
      "slotes.isBooked" : false
    }).exec()
    if(availableSlots){
      const mergedObject = availableSlots.reduce((result, slot) => {
        slot.slotes.forEach((slotInfo) => {
          if (slotInfo.slotDate) {
            if (!result[slotInfo.slotDate]) {
              result[slotInfo.slotDate] = [];
            }
            result[slotInfo.slotDate].push(slotInfo);
          }
        });
        return result;
      }, {});
      const mergedArray = [].concat(...Object.values(mergedObject));
   

      return res.status(200).json({ data: mergedArray, message: "success" });
    } else {
      return res.status(200).json({ message: "slote not avilble" });
    }
    
  } catch (error) {
    return res.status(500).json({ error: error.message });

  }
}

export const payment = async(req,res,next)=>{
  try {
    const stripe = new Stripe(
      "sk_test_51OF855SGN2zHCLENS0gaFeQhHc7oLPwx2DSd8IC4dKhtQJIYo4OxdlJ8oONQEVI118Ero5V9RQbGEjkITJqtHQxN00HN1rnb3k"
    )
    const adventure = await Adventure.findById(req.params.id)
      const data= adventure.category.filter(category => category.categoryName === req.params.category);
      const entryFee = data[0].entryFee
      const paymentintent = await stripe.paymentIntents.create({
        amount: entryFee * 100,
        currency: "inr",
        automatic_payment_methods: {
          enabled: true,
        },
      });
    return res.status(200).json({clientSecret : paymentintent.client_secret})


  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export const paymentSuccess = async(req,res,next)=>{
  try {
    const bookingDetails = req.body.bookdata
    const userId = req.headers.userId
    new Booking({
        adventureId : bookingDetails.advId,
        userId : userId,
        entryFee: bookingDetails.entryFee,
        categoryName : bookingDetails.categoryName,
        scheduledAt:{
          slotTime : bookingDetails.slotTime,
          slotDate : bookingDetails.slotDate
        }

    }).save()

    await Slot.findOneAndUpdate(
      {
        adventure: bookingDetails.advId,
        slotes: {
          $elemMatch: { _id: bookingDetails.slotId },
        },
      },
      { $set: { "slotes.$.isBooked": true } }
    );
    return res.status(200).json({success:true})
  } catch (error) {
    return res.status(500).json({ error: error.message });

  }
}

export const userBooking = async(req,res,next)=>{
  try {
    const booking = await Booking.find().populate("userId")
    return res.status(200).json({data : booking})
  } catch (error) {
    return res.status(500).json({ error: error.message });

  }
}


export const bookingDetails = async(req,res,next)=>{
   const id = req.headers.userId
  try {
    const booking = await Booking.find({userId:id})
     .populate({
        path: "adventureId",
        select: "name location",
      })
      .exec();
    return res.status(200).json({data : booking})
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export const slotDelete = async(req,res,next)=>{
  try {
    const slotId = req.params.slotId
    const id = req.params.id
     const deletedSlot = await Slot.
     updateOne(
  { _id: slotId },
  { $pull: { slotes: { _id: id } } }
);
    if (!deletedSlot) {
      return res.status(404).json({ message: 'Slot not found' });
    }

    return res.json({ success: true, message: 'Slot deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}


export const cancelBooking = async (req, res, next) => {
  try {
    const userId = req.headers.userId;
    const id = req.body.id;
    const booking = await Booking.findOne({ _id: id }, { entryFee: 1 }).populate(
      "adventureId"
    );
    const adventureId = booking.adventureId._id;
    const entryFee = booking.entryFee;
    let scheduledDate = new Date(booking.scheduledAt.slotDate);
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    const formattedScheduledDate = scheduledDate.toLocaleString();
    const formattedCurrentDate = currentDate.toLocaleString();
   
    if (formattedScheduledDate > formattedCurrentDate) {
      const updated = await Booking.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            status: "cancelled",
          },
        }
      );

      if (updated) {
       
        await User.findByIdAndUpdate(
          { _id: userId },
          { $inc: { wallet: entryFee } }
        );
       
        return res
          .status(200)
          .json({ updated: true, message: "your booking is canceled" });
      } else {
        return res.status(200).json({
          updated: false,
          message: "somthing went wrong please try later",
        });
      }
    } else {
      return res
        .status(200)
        .json({ message: "You Cant Cancel todays booking" });
    }
  } catch (error) {
    console.log(error.message);
  }
};


export const walletPayment = async(req,res,next)=>{
  try {
      const { advId, slotId, slotDate, slotTime, fee, categoryName } = req.body.bookingId.bookdata;
      // const slot = req.body.bookingId.bookdata.slotId;
      // const adId = req.body.bookingId.bookdata.advId;
      // const catName = req.body.bookingId.bookdata.categoryName;
      const usrId = req.headers.userId
      // const specificSlot = await Slot.findOne({ "slotes._id": slot }, { "slotes.$": 1 });
      // console.log(specificSlot, 'Specific slot');
      // if (!specificSlot) {
      //   return res.status(404).json({ message: 'Slot not found' });
      // }
      // const { category } = specificSlot.slotes[0];
      // const adventureData = await Adventure.findOne({ 'category.categoryName': category });
      // if (!adventureData) {
      //   return res.status(404).json({ message: 'Adventure not found' });
      // }
      // const matchedCategory = adventureData.category.find(cat => cat.categoryName === category);

      // if (matchedCategory) {
      // const entryFee = matchedCategory.entryFee;
  
      const userData = await User.findOne({ _id: usrId });
      console.log(userData.wallet,fee);
      if (userData.wallet <= 0 || userData.wallet < fee) {
        console.log('rrrrrrrrrrrrrr');
        return res.status(200).json({status : false, message: 'Insufficient wallet amount' });
      }
     
     const bookingSave =  new Booking({
        adventureId : advId,
        userId : usrId,
        entryFee: fee,
        categoryName : categoryName,
        paymentMethod : 'wallet',
        scheduledAt:{
          slotTime : slotTime,
          slotDate : slotDate
        }

    })
    let bookingdata = await bookingSave.save()

    
await Slot.updateOne(
  {
    adventure: advId,
    slotes: {
      $elemMatch: { _id: slotId},
    },
  },
  { $set: { "slotes.$.isBooked": true } }
);
   
    
      
     const v = await User.updateOne({_id:usrId},{$inc:{wallet : - bookingdata.entryFee}})
      return res.status(200).json({ status: true, message: "update completed" })
     

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}


export const walletHistory = async(req,res,next)=>{
  try {
     const userId = req.headers.userId;
    const walletBookings = await Booking.find({ userId, paymentMethod: 'wallet' }).populate("userId").populate("adventureId")
    if(walletBookings){
      return res.json({ data : walletBookings });
    }
    
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
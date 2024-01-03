import mongoose from "mongoose";
import Adventure from "../Models/adventureModel.js";
import Slot from "../Models/slotModel.js";
import moment from 'moment'
import Stripe from "stripe";
import Booking from "../Models/bookingModel.js";
import User from "../Models/userModel.js";


export const addSlots = async (req, res, next) => {
  try {
    const advId = req.headers.adventureId;
    const { startTime, endTime, startDate, endDate, category, NoofSlots } = req.body
    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({ message: 'End date must be greater than or equal to start date' })
    }
    const slotDuration = 30
    const createdSlots = []

    const currentDate = new Date(startDate)
    const endDateObj = new Date(endDate)

    while (currentDate <= endDateObj) {
      const date = currentDate.toLocaleDateString()

      const findSlotExist = await Slot.findOne({
        adventure: advId,
        slotes: {
          $elemMatch: {
            slotDate: date,
            category: category,
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
        return res.status(200).json({ message: "Slot already exists" });
      }

      const createSlots = generateTimeSlots(
        startTime,
        endTime,
        slotDuration,
        date,
        category,
        NoofSlots
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


export const slotCategory = async (req, res, next) => {
  try {
    const id = req.headers.adventureId
    const data = await Adventure.findById(id)
    if (data) {
      return res.status(200).json({ data: data })
    } else {
      return res.status(200).json({ message: 'Data not found' })
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}


function generateTimeSlots(startTime, endTime, slotDuration, date, category, NoofSlots) {
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
      category: category,
      NoofSlots: NoofSlots
    };

    slots.push(slotDoc);
    start.setMinutes(start.getMinutes() + slotDuration);
  }

  return slots;
}

export const getSlotDate = async (req, res, next) => {
  try {

    const advId = req.headers.adventureId
    const result = await Slot.aggregate([
      {
        $match: {
          adventure: new mongoose.Types.ObjectId(advId)
        }
      },
      { $unwind: "$slotes" },
      {
        $group: {
          _id: "$slotes.slotDate",
          slotDates: { $addToSet: "$slotes.slotDate" }
        },
      },
      {
        $project: {
          _id: 0,
          slotDates: 1
        }
      }
    ])
    if (result) {
      const slotArray = result.map((item) => item.slotDates)
      const slotDates = slotArray.flat()
      return res.status(200).json({ data: slotDates, message: "Success" })
    } else {
      return res.status(200).json({ message: "No slots" })
    }

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export const getSlots = async (req, res, next) => {
  try {

    const { date } = req.query
    if (!date) {
      return res.status(200).json({ message: "Date is not found" })
    }
    const advId = req.headers.adventureId
    const data = await Adventure.findById(advId)
    const yesterday = moment().subtract(1, "days").format("YYYY-MM-DD")
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
    const { adventureId, categoryName } = req.query;
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

export const getSlotsUser = async (req, res, next) => {
  try {
    const { date, adventureId, categoryName } = req.query
    if (!date) {
      return res.status(200).json({ message: "Please select a date" })
    }
    console.log(categoryName, 's')
    const availableSlots = await Slot.find({
      adventure: adventureId,
      "slotes.category": categoryName,
      "slotes.slotDate": new Date(date),
      // "slotes.isBooked": false
    }).exec()
    if (availableSlots) {
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

export const payment = async (req, res, next) => {
  try {
    const stripe = new Stripe(
      "sk_test_51OF855SGN2zHCLENS0gaFeQhHc7oLPwx2DSd8IC4dKhtQJIYo4OxdlJ8oONQEVI118Ero5V9RQbGEjkITJqtHQxN00HN1rnb3k"
    )
    const adventure = await Adventure.findById(req.params.id)
    const data = adventure.category.filter(category => category.categoryName === req.params.category);
    const entryFee = data[0].entryFee
    const paymentintent = await stripe.paymentIntents.create({
      amount: entryFee * 100,
      currency: "inr",
      automatic_payment_methods: {
        enabled: true,
      },
    });
    return res.status(200).json({ clientSecret: paymentintent.client_secret })


  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export const paymentSuccess = async (req, res, next) => {
  try {
    // const bookingDetails = req.body.bookdata


    const {
      advId,
      booking: { time, date, fee, NoofSlots },
      slotDate,
      categoryName,
      slotId,
      status,
    } = req.body.bookdata;

    console.log(slotDate, 'booking details is here');
    const userId = req.headers.userId

    const arr = time.map((timedata) => ({
      slotId: new mongoose.Types.ObjectId(timedata.id),
      time: timedata.time,
    }));


    const onlineBooking = new Booking({
      adventureId: advId,
      userId: userId,
      entryFee: fee,
      categoryName: categoryName,
      scheduledAt: arr,
      bookingDate: date,
      noOfSlots: NoofSlots,
      status: 'success',
      date: new Date()

    })
    let onlineData = await onlineBooking.save()

    const slotIds = arr.map((item) => item.slotId);

    await Slot.updateMany(
      {
        adventure: advId,
        "slotes._id": { $in: slotIds },
      },
      { $set: { "slotes.$[elem].isBooked": true } },
      { arrayFilters: [{ "elem._id": { $in: slotIds } }] }
    );
    return res.status(200).json({ success: true })
  } catch (error) {
    return res.status(500).json({ error: error.message });

  }
}


// export const userBooking = async (req, res, next) => {
//   try {
//     const booking = await Booking.find({ "scheduledAt.isBooked": true }).populate("userId")
//     return res.status(200).json({ data: booking })
//   } catch (error) {
//     return res.status(500).json({ error: error.message });

//   }
// }

export const userBooking = async (req, res, next) => {
  try {
    const booking = await Booking.aggregate([
      { $match: { "scheduledAt.isBooked": true } },
      { $unwind: "$scheduledAt" },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },

    ])
    console.log(booking, 'booking is a here');
    return res.status(200).json({ data: booking });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


export const bookingDetails = async (req, res, next) => {
  const id = req.headers.userId
  try {
    const booking = await Booking.find({ userId: id })
      .populate({
        path: "adventureId"
      })
      .populate({
        path: "scheduledAt",

        select: "slotes.slotTime"
      });

    return res.status(200).json({ data: booking })
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export const slotDelete = async (req, res, next) => {
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
    const slotId = req.body.slotId
    const booking = await Booking.findOne({ _id: id }, { entryFee: 1 }).populate(
      "adventureId"
    );
    const adventureId = booking.adventureId._id;
    const entryFee = booking.entryFee;
    let scheduledDate = new Date(booking.bookingDate);
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const formattedScheduledDate = scheduledDate.toLocaleString();
    const formattedCurrentDate = currentDate.toLocaleString();

    if (formattedScheduledDate > formattedCurrentDate) {
      const updated = await Booking.updateOne(
        { _id: id, "scheduledAt.slotId": slotId },
        {
          $set: { "scheduledAt.$.isBooked": false, status: 'cancel' },
        }
      );

      if (updated) {
        const slotupdate = await Slot.updateOne(
          {
            adventure: adventureId,
            'slotes._id': slotId,

          },
          {
            $set: {
              'slotes.$.isBooked': false,
            },
          }
        );

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


// export const walletPayment = async (req, res, next) => {
//   try {

//     const {
//       bookingId: {
//         bookdata: { advId, totalAmount, categoryName },
//         booking: { time, date, fee, NoofSlots }
//       }
//     } = req.body;
//     console.log(req.body, 'kkkkkkkkkkkkkk');

//     const usrId = req.headers.userId

//     const userData = await User.findOne({ _id: usrId });
//     if (userData.wallet <= 0 || userData.wallet < totalAmount) {
//       return res.status(200).json({ status: false, message: 'Insufficient wallet amount' });
//     }
//     const arr = []
//     time.forEach((timedata) => {
//       const obj = {
//         slotId: new mongoose.Types.ObjectId(timedata.id),
//         time: timedata.time
//       }
//       arr.push(obj)
//     })
//     console.log(arr, 'array is here');

//     const bookingSave = new Booking({
//       adventureId: advId,
//       userId: usrId,
//       entryFee: totalAmount,
//       categoryName: categoryName,
//       paymentMethod: 'wallet',
//       scheduledAt: arr,
//       bookingDate: date,
//       noOfSlots: NoofSlots
//     })
//     let bookingdata = await bookingSave.save()



//     const saveSlot = await Slot.updateMany(
//       {
//         adventure: advId,
//         "slotes._id": { $in: time },
//       },
//       { $set: { "slotes.$[elem].isBooked": true } },
//       { arrayFilters: [{ "elem._id": { $in: time } }] }
//     );



//     console.log(saveSlot, 'save')


//     const v = await User.updateOne({ _id: usrId }, { $inc: { wallet: - bookingdata.entryFee } })
//     return res.status(200).json({ status: true, message: "update completed" })


//   } catch (error) {
//     console.log(error.message)
//     return res.status(500).json({ error: error.message });
//   }
// }

export const walletPayment = async (req, res, next) => {
  try {
    const {
      bookingId: {
        bookdata: { advId, totalAmount, categoryName },
        booking: { time, date, fee, NoofSlots },
      },
    } = req.body;
    const usrId = req.headers.userId;

    const userData = await User.findOne({ _id: usrId });
    if (userData.wallet <= 0 || userData.wallet < totalAmount) {
      return res.status(200).json({ status: false, message: 'Insufficient wallet amount' });
    }

    const arr = time.map((timedata) => ({
      slotId: new mongoose.Types.ObjectId(timedata.id),
      time: timedata.time,
    }));

    const bookingSave = new Booking({
      adventureId: advId,
      userId: usrId,
      entryFee: totalAmount,
      categoryName: categoryName,
      paymentMethod: 'wallet',
      scheduledAt: arr,
      bookingDate: date,
      noOfSlots: NoofSlots,
      status: 'success',
      date: new Date()
    });
    let bookingdata = await bookingSave.save();

    const slotIds = arr.map((item) => item.slotId);

    const saveSlot = await Slot.updateMany(
      {
        adventure: advId,
        "slotes._id": { $in: slotIds },
      },
      { $set: { "slotes.$[elem].isBooked": true } },
      { arrayFilters: [{ "elem._id": { $in: slotIds } }] }
    );

    const v = await User.updateOne({ _id: usrId }, { $inc: { wallet: -bookingdata.entryFee } });
    return res.status(200).json({ status: true, message: 'Update completed' });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ error: error.message });
  }
};



export const walletHistory = async (req, res, next) => {
  try {
    const userId = req.headers.userId;
    const walletBookings = await Booking.find({ userId, paymentMethod: 'wallet' }).populate("userId").populate("adventureId")
    if (walletBookings) {
      return res.json({ data: walletBookings });
    }

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
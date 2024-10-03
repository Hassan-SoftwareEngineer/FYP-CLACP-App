const User = require('../model/UserDetails'); // Adjust the path based on your project structure

const express = require('express');
const router = express.Router();
const Lawyer = require('../model/lawyer');
const ScheduleLawyer = require('../model/scheduleModel')
const BookAppointment = require('../model/BookAppointment');
const TimeSlot = require('../model/TimeSlot');
const Feedback = require('../model/Feedback');

// Route to add lawyer details
router.post('/lawyer/add-details', async (req, res) => {
    try {
        const { userId, lawyerCategory, courtLevel, degree, experience, address, consultationFee, description } = req.body;

        const lawyer = new Lawyer({
            userId,
            lawyerCategory,
            courtLevel,
            degree,
            experience,
            address,
            consultationFee,
            description,
        });

        await lawyer.save();
        res.status(201).json({ message: 'Lawyer details added successfully' });
    } catch (error) {
        console.error('Error adding lawyer details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to update lawyer details
router.put('/lawyer/update-details', async (req, res) => {

    try {
        const { userId, lawyerCategory, courtLevel, degree, experience, address, consultationFee , description } = req.body;

        console.log('Request Body:', req.body);

        let lawyer = await Lawyer.findOne({ userId });

        console.log('lawyer:', lawyer);

        if (!lawyer) {
            console.log('Lawyer not found');
            return res.status(404).json({ status: "error", message: "Lawyer details not found" });
        }

        lawyer.lawyerCategory = lawyerCategory || lawyer.lawyerCategory;
        lawyer.courtLevel = courtLevel || lawyer.courtLevel;
        lawyer.degree = degree || lawyer.degree;
        lawyer.experience = experience || lawyer.experience;
        lawyer.address = address || lawyer.address;
        lawyer.consultationFee = consultationFee || lawyer.consultationFee;
        lawyer.description = description || lawyer.description;

        lawyer = await lawyer.save();

        console.log('Updated Lawyer:', lawyer);

        res.status(200).json({ status: "ok", lawyer });
    } catch (error) {
        console.error('Error updating lawyer details:', error);
        res.status(500).json({ status: "error", message: "Failed to update lawyer details. Please try again." });
    }
});


// Route to get lawyer details by user ID
router.get('/lawyer/details/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const lawyer = await Lawyer.findOne({ userId });

        if (!lawyer) {
            return res.status(404).json({ status: "error", message: "Lawyer details not found" });
        }

        res.status(200).json({ status: "ok", lawyer });
    } catch (error) {
        console.error('Error fetching lawyer details:', error);
        res.status(500).json({ status: "error", message: "Failed to fetch lawyer details. Please try again." });
    }
});


// POST route to add new schedule or update existing schedule
router.post('/save-or-update-schedule', async (req, res) => {
    try {
      const { userId, schedule } = req.body;
      let existingSchedule = await ScheduleLawyer.findOne({ userId: userId });
  
      if (!existingSchedule) {
        // If no existing schedule, create a new one
        existingSchedule = new ScheduleLawyer({ userId: userId, schedule: schedule });
      } else {
        // If existing schedule, update it
        existingSchedule.schedule = schedule;
      }
  
      // Save the schedule
      await existingSchedule.save();
      res.status(200).send('Schedule saved successfully');
    } catch (error) {
      console.error('Error saving or updating schedule:', error);
      res.status(500).send('Error saving or updating schedule');
    }
  });  
  

  // GET route to retrieve existing schedule
router.get('/get-schedule/:userId', async (req, res) => {
    try {
      const userId = req.params.userId;
      const existingSchedule = await ScheduleLawyer.findOne({ userId: userId });
      res.status(200).json(existingSchedule);
    } catch (error) {
      console.error('Error retrieving schedule:', error);
      res.status(500).send('Error retrieving schedule');
    }
  });

// Route to fetch lawyer data with associated user details and filter by category
router.get('/lawyers-with-users/:type', async (req, res) => {
  const { type } = req.params; // Get the type parameter from the request URL
  try {
    let lawyersWithUsers; // Define a variable to store the aggregation result

    // Check if the type is "All"
    if (type === 'All') {
      // If type is "All", perform the aggregation without filtering by category
      lawyersWithUsers = await Lawyer.aggregate([
        {
          $lookup: {
            from: 'Users', // Name of the users collection
            localField: 'userId',
            foreignField: '_id',
            as: 'userData' // New field to store user data
          }
        }
      ]);
    } else {
      // If type is not "All", perform the aggregation with type filtering
      let matchQuery = {};

      if (type === 'lawyerCategory') {
        matchQuery = { lawyerCategory: req.query.lawyerCategory };
      } else if (type === 'Location') {
        matchQuery = { address: req.query.location };
      } else if (type === 'Specialty') {
        matchQuery = { lawyerCategory: req.query.specialty };
      }

      lawyersWithUsers = await Lawyer.aggregate([
        {
          $match: matchQuery // Filter lawyers by category, location, or specialty
        },
        {
          $lookup: {
            from: 'Users', // Name of the users collection
            localField: 'userId',
            foreignField: '_id',
            as: 'userData' // New field to store user data
          }
        }
      ]);
    }

    res.status(200).json(lawyersWithUsers);
  } catch (error) {
    console.error('Error fetching lawyers with users:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch lawyers with users' });
  }
});

router.get('/:userId/schedule', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    console.log(userId);
    // Find the schedule for the specified lawyer ID
    const schedule = await ScheduleLawyer.findOne({ userId: userId });
    
    console.log(schedule)
    // If schedule is found, send it as a JSON response
    if (schedule) {
      res.status(200).json(schedule);
    } else {
      // If schedule is not found, send an empty schedule as a response
      res.status(200).json({ message: 'No schedule available yet', schedule: [] });
    }
  } catch (error) {
    // If an error occurs, send a 500 Internal Server Error response
    console.error('Error fetching schedule:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// // Endpoint to book appointments
// router.post('/:userId/book-appointment', async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const appointmentsData = req.body;

//     console.log('Appointments Data:', appointmentsData);

//     if (!appointmentsData || !Array.isArray(appointmentsData) || appointmentsData.length === 0) {
//       throw new Error('Invalid or missing appointment data.');
//     }

//     const firstAppointment = appointmentsData[0];
//     const { lawyerId } = firstAppointment;

//     if (!lawyerId) {
//       throw new Error('Invalid or missing lawyerId in the appointment data.');
//     }

//     // Find if there is an existing schedule for the user
//     let existingSchedule = await BookAppointment.findOne({ userId, lawyerId });

//     // If no existing schedule found, create a new one
//     if (!existingSchedule) {
//       existingSchedule = new BookAppointment({
//         userId,
//         lawyerId,
//         schedule: appointmentsData.map(({ date, dayName, selectedTimeSlots }) => ({
//           date,
//           dayName,
//           selectedTimeSlots,
//         })),
//       });
//     }

//     // Replace existing appointments with new ones
//     existingSchedule.schedule = appointmentsData.map(({ date, dayName, selectedTimeSlots }) => ({
//       date,
//       dayName,
//       selectedTimeSlots,
//     }));

//     // Save the updated schedule
//     await existingSchedule.save();

//     res.status(200).json({ message: 'Appointments booked successfully' });
//   } catch (error) {
//     console.error('Error booking appointments:', error);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// });

router.get('/book-appointments', async (req, res) => {
  try {
    const appointments = await BookAppointment.find({});
    res.status(200).json({ appointments });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


router.post('/:userId/book-appointment', async (req, res) => {
  try {
    const { userId } = req.params;
    const appointmentsData = req.body;

    console.log('Appointments Data:', appointmentsData);

    if (!appointmentsData || !Array.isArray(appointmentsData) || appointmentsData.length === 0) {
      throw new Error('Invalid or missing appointment data.');
    }

    // Validate each appointment object in the array
    appointmentsData.forEach(appointment => {
      const { lawyerId, date, dayName, selectedTimeSlot } = appointment;
      if (!lawyerId || !date || !dayName || !selectedTimeSlot) {
        throw new Error('Invalid appointment data.');
      }
    });

    // Map and process each appointment separately
    const newAppointments = [];

    for (const appointment of appointmentsData) {
      const { lawyerId, date, dayName, selectedTimeSlot } = appointment;

      // Check if an appointment with the same date and time slot already exists
      const existingAppointment = await BookAppointment.findOne({
        userId,
        lawyerId,
        'schedule.date': new Date(date),
        'schedule.selectedTimeSlots': selectedTimeSlot
      });

      if (existingAppointment) {
        // Update the existing appointment
        existingAppointment.schedule = [{
          date: new Date(date),
          dayName,
          selectedTimeSlots: [selectedTimeSlot],
        }];
        existingAppointment.status = 'upcoming';
        await existingAppointment.save();
      } else {
        // Create a new appointment
        newAppointments.push({
          userId,
          lawyerId,
          schedule: [{
            date: new Date(date),
            dayName,
            selectedTimeSlots: [selectedTimeSlot],
          }],
          status: 'upcoming',
        });
      }
    }

    // Save the new appointments to the BookAppointment collection
    if (newAppointments.length > 0) {
      await BookAppointment.insertMany(newAppointments);
    }

    res.status(200).json({ message: 'Appointments booked successfully' });
  } catch (error) {
    console.error('Error booking appointments:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// // Check existing appointments
// router.post('/:userId/check-appointments', async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const appointmentsToCheck = req.body;

//     // Fetch existing appointments for the user
//     const existingAppointments = await BookAppointment.find({ userId });
 
//     // Check if there are existing appointments for the user on the selected dates
//     const conflictingAppointment = existingAppointments.find(existingAppointment => {
//       return appointmentsToCheck.some(appointmentToCheck => {
//         // Check if both userId and lawyerId match
//         return (
//           existingAppointment.userId === userId &&
//           existingAppointment.lawyerId === appointmentToCheck.lawyerId &&
//           existingAppointment.date === appointmentToCheck.date &&
//           existingAppointment.selectedTimeSlots.some(slot => appointmentToCheck.selectedTimeSlots.includes(slot))
//         );
//       });
//     });

//     if (conflictingAppointment) {
//       console.log('Conflicting Appointment:', conflictingAppointment);
//       res.status(200).json({ existingAppointment: conflictingAppointment });
//     } else {
//       console.log('No conflicting appointment found.');
//       res.status(200).json({ message: 'No conflicting appointment found.' });
//     }
//   } catch (error) {
//     console.error('Error checking existing appointments:', error);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// });


// Retrieve appointments for a specific user
router.get('/:userId/retrieve-appointments', async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch existing appointments for the user
    const appointments = await BookAppointment.find({ userId });

    console.log('Appointments:', appointments);
    if (appointments.length > 0) {
      // Extract lawyerIds from appointments
      const lawyerId = appointments.map(appointment => appointment.lawyerId);

      console.log('Lawyer IDs:', lawyerId);
      // Retrieve corresponding details from the users collection
      const correspondingUsers = await User.find({ _id: { $in: lawyerId } });

      // Combine appointments with corresponding user details
      const appointmentsWithUsers = appointments.map(appointment => {
        const correspondingUser = correspondingUsers.find(user => user._id.toString() === appointment.lawyerId.toString());
        return {
          ...appointment._doc,
          lawyerDetails: correspondingUser // Assuming you want to add lawyer details to each appointment
        };
      });

      console.log('Appointments retrieved successfully:', appointmentsWithUsers);
      res.status(200).json({ appointments: appointmentsWithUsers });
    } else {
      console.log('No appointments found for the user.');
      res.status(200).json({ message: 'No appointments found for the user.' });
    }
  } catch (error) {
    console.error('Error retrieving appointments:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Retrieve appointments for a specific user
router.get('/:userId/retrieve-appointments-lawyers', async (req, res) => {
  try {
    const { userId } = req.params;

    const lawyerId = userId;

    // Fetch existing appointments for the user
    const appointments = await BookAppointment.find({ lawyerId });

    console.log('Appointments:', appointments);
    if (appointments.length > 0) {
      // Extract lawyerIds from appointments
      const userId = appointments.map(appointment => appointment.userId);

      console.log('User Ids:', userId);
      // Retrieve corresponding details from the users collection
      const correspondingUsers = await User.find({ _id: { $in: userId } });

      // Combine appointments with corresponding user details
      const appointmentsWithUsers = appointments.map(appointment => {
        const correspondingUser = correspondingUsers.find(user => user._id.toString() === appointment.userId.toString());
        return {
          ...appointment._doc,
          userDetails: correspondingUser // Assuming you want to add lawyer details to each appointment
        };
      });

      console.log('Appointments retrieved successfully:', appointmentsWithUsers);
      res.status(200).json({ appointments: appointmentsWithUsers });
    } else {
      console.log('No appointments found for the user.');
      res.status(200).json({ message: 'No appointments found for the user.' });
    }
  } catch (error) {
    console.error('Error retrieving appointments:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Endpoint to update the status of an appointment
router.put('/appointments/:_id/status', async (req, res) => {
  const { _id } = req.params;
  const { status } = req.body;

  try {
    const appointment = await BookAppointment.findById(_id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    appointment.status = status;
    await appointment.save();

    return res.status(200).json({ message: 'Appointment status updated successfully' });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get feedbacks for a specific lawyer
router.get('/feedback/:lawyerId', async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ lawyerId: req.params.lawyerId });
    res.json({ feedbacks });
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/feedback', async (req, res) => {
  const { userId, userName, lawyerId, feedback } = req.body;

  try {
    const newFeedback = new Feedback({
      userId,
      userName,
      lawyerId,
      feedback,
    });

    await newFeedback.save();

    res.status(201).json(newFeedback);
  } catch (error) {
    console.error('Error saving feedback:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// // Route to fetch lawyer data with associated user details and filter by category
// router.get('/lawyers-with-users/:type', async (req, res) => {
//   const { type } = req.params; // Get the type parameter from the request URL
//   try {
//     let lawyersWithUsers; // Define a variable to store the aggregation result

//     // Check if the type is "All"
//     if (type === 'All') {
//       // If type is "All", perform the aggregation without filtering by category
//       lawyersWithUsers = await Lawyer.aggregate([
//         {
//           $lookup: {
//             from: 'Users', // Name of the users collection
//             localField: 'userId',
//             foreignField: '_id',
//             as: 'userData' // New field to store user data
//           }
//         }
//       ]);
//     } else {
//       // If type is not "All", perform the aggregation with type filtering
//       let matchQuery = {};

//       if (type === 'lawyerCategory') {
//         matchQuery = { lawyerCategory: req.query.lawyerCategory };
//       } else if (type === 'Location') {
//         matchQuery = { address: req.query.location };
//       } else if (type === 'Specialty') {
//         matchQuery = { lawyerCategory: req.query.specialty };
//       }

//       lawyersWithUsers = await Lawyer.aggregate([
//         {
//           $match: matchQuery // Filter lawyers by category, location, or specialty
//         },
//         {
//           $lookup: {
//             from: 'Users', // Name of the users collection
//             localField: 'userId',
//             foreignField: '_id',
//             as: 'userData' // New field to store user data
//           }
//         }
//       ]);
//     }

//     // Check if lawyersWithUsers is empty, if so, return the "All" response
//     if (lawyersWithUsers.length === 0) {
//       const allLawyers = await Lawyer.aggregate([
//         {
//           $lookup: {
//             from: 'Users', // Name of the users collection
//             localField: 'userId',
//             foreignField: '_id',
//             as: 'userData' // New field to store user data
//           }
//         }
//       ]);
//       return res.status(200).json(allLawyers);
//     }

//     res.status(200).json(lawyersWithUsers);
//   } catch (error) {
//     console.error('Error fetching lawyers with users:', error);
//     res.status(500).json({ status: 'error', message: 'Failed to fetch lawyers with users' });
//   }
// });

// // Route to fetch lawyer data with associated user details
// router.get('/lawyers-with-users', async (req, res) => {
//   try {
//     // Perform a join between the Lawyers and Users collections
//     const lawyersWithUsers = await Lawyer.aggregate([
//       {
//         $lookup: {
//           from: 'Users', // Name of the users collection
//           localField: 'userId',
//           foreignField: '_id',
//           as: 'userData' // New field to store user data
//         }
//       }
//     ]);

//     res.status(200).json(lawyersWithUsers);
//   } catch (error) {
//     console.error('Error fetching lawyers with users:', error);
//     res.status(500).json({ status: 'error', message: 'Failed to fetch lawyers with users' });
//   }
// });



module.exports = router;

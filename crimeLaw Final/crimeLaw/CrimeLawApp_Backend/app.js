require('dotenv').config(); // Load environment variables from .env file

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const NotificationSettings = require('./NotificationSetting');
const usersRouter = require('./routes/users');
const lawyerRoutes = require('./routes/lawyerRoutes');
const authMiddleware = require('./authMiddleware');

const app = express();
const port = process.env.PORT || 5001; // Use the port from environment variable or default to 5001

const { v4: uuidv4 } = require('uuid');



// Global variable to store verification codes
const verificationCodes = {};


// Function to generate a four-digit verification code
function generateVerificationCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Function to check if an email already exists in the database
async function checkEmailExist(email) {
  try {
    // Query the database to find a user with the provided email
    const user = await UserInfo.findOne({ email });
    
    // If a user with the provided email exists, return true
    // Otherwise, return false
    return !!user;
  } catch (error) {
    // Handle errors
    console.error("Error checking if email exists:", error);
    return false; // Return false in case of any error
  }
}



// MongoDB connection
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

const UserInfo = require('./model/UserDetails');

app.use(express.json());

// Routes
app.use('/api', lawyerRoutes);

app.get("/", (req, res) => {
  res.send({ status: "started" });
});

// Register endpoint
app.post('/register', async (req, res) => {
  const { name, email, mobile, cnic, type, password } = req.body;

  try {
    // Check if the user already exists
    const oldUser = await UserInfo.findOne({ email });
    if (oldUser) {
      return res.status(409).json({
        status: "user_exists",
        message: "User already exists"
      });
    }

    // Create a new user instance
    const newUser = new UserInfo({
      name,
      email,
      mobile,
      cnic,
      type,
      password, // Assign the plaintext password directly
    });

    // Save the new user to the database
    await newUser.save();

    // Respond with success message
    res.status(201).json({ status: "ok", message: "User Created" });
  } catch (error) {
    // Handle errors
    console.error("Error in registration:", error);
    res.status(500).json({ status: "error", message: "Failed to register user" });
  }
});

/// Login endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body;


  try {
    const user = await UserInfo.findOne({ email });

    if (!user) {
      return res.status(401).json({ status: "error", message: "Invalid email or password" });
    }

    // Correctly compare the entered plaintext password with the stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ status: "error", message: "Invalid email or password" });
    }

    // Generate JWT token using the secret key from environment variable
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({ status: "ok", token , type: user.type});
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Route to update userLogged status
app.post('/update-user-logged', authMiddleware, async (req, res) => {
  try {
    const { userLogged } = req.body;

    // Extract user ID from the token payload
    const userId = req.userId;

    // Update the userLogged status for the user with the given ID
    await UserInfo.findByIdAndUpdate(userId, { userLogged });

    res.status(200).json({ success: true, message: 'UserLogged status updated successfully' });
  } catch (error) {
    console.error('Update UserLogged Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update UserLogged status' });
  }
});

// Route to update userLogged status
app.post('/update-user-logged/logout', async (req, res) => {
  try {
    const { userLogged, userId } = req.body; // Extract userId from request body

    // Update the userLogged status for the user with the given ID
    await UserInfo.findByIdAndUpdate(userId, { userLogged });

    res.status(200).json({ success: true, message: 'UserLogged status updated successfully' });
  } catch (error) {
    console.error('Update UserLogged Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update UserLogged status' });
  }
});


app.post('/verify-register', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    console.log('Debug: Email is required.');
    return res.status(400).json({ error: 'Email is required.' });
  }

  try {
    const userExists = await checkEmailExist(email);

    if (userExists) {
      console.log('Debug: This email is already associated with an account. Please use a different email.');
      return res.status(500).json({ error: 'This email is already associated with an account. Please use a different email.' });
    }

    const verificationCode = generateVerificationCode();
    verificationCodes[email] = verificationCode;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'ahmedclacp@gmail.com',
        pass: 'qgkz zbgi ofox ulze',
      },
    });

    const mailOptions = {
      from: 'ahmedclacp@gmail.com',
      to: email,
      subject: 'Password Reset',
      text: `Your verification code is ${verificationCode}.`,
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.error('Error sending email:', error);
        console.log('Debug: Failed to send verification code email.');
        return res.status(500).json({ error: 'Failed to send verification code email.' });
      } else {
        console.log('Debug: Verification email sent.');
        return res.status(200).json({ message: 'Verification email sent.', verificationCode });
      }
    });
  } catch (error) {
    console.error('Error in verifying code:', error);
    console.log('Debug: Failed to verify Code. Please try again later.');
    return res.status(500).json({ error: 'Failed to verify Code. Please try again later.' });
  }
});




// Endpoint for password reset
app.post('/reset-password', async (req, res) => {
  const { email } = req.body;

  console.log("email", email)
  // Check if the email is provided
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  try {
    // Check if the email exists in the database
    const userExists = await checkEmailExist(email);

    // If the user does not exist, return an error response
    if (!userExists) {
      return res.status(400).json({ error: 'This email is not associated with any account. Please register first.' });
    }

    // Generate unique token for password reset link
    const token = uuidv4();

    // Generate four-digit verification code
    const verificationCode = generateVerificationCode();

    // Store the verification code for the email
    verificationCodes[email] = verificationCode;

    // Send email with verification code
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'ahmedclacp@gmail.com', // Replace with your email
        pass: 'qgkz zbgi ofox ulze', // Replace with your password
      },
    });

    const mailOptions = {
      from: 'ahmedclacp@gmail.com',
      to: email,
      subject: 'Password Reset',
      text: `Your verification code is ${verificationCode}.`,
    };
    console.log(verificationCode)
    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send password reset email.' });
      } else {
        res.status(200).json({ message: 'Password reset email sent.', verificationCode });
      }
    });
  } catch (error) {
    console.error('Error in password reset:', error);
    res.status(500).json({ error: 'Failed to reset password. Please try again later.' });
  }
});

// Endpoint for verifying password reset code
app.post('/verify-register-code', async (req, res) => {
  const { email, verificationCode } = req.body;

  try {
    
    // Check if the verification code matches
    if (verificationCodes[email] !== verificationCode) {
      return res.status(400).json({ error: 'Invalid verification code.' });
    }

    // Respond with success message
    // Respond with success message and status
res.status(200).json({ status: 'verified', message: 'Verification successful.' });

  } catch (error) {
    console.error('Error verifying code:', error);
    res.status(500).json({ error: 'Failed to verify code.' });
  }
});

// Endpoint for verifying password reset code
app.post('/verify-reset-code', async (req, res) => {
  const { email, verificationCode } = req.body;

  // Check if the email and verification code are provided
  if (!email || !verificationCode) {
    return res.status(400).json({ error: 'Email and verification code are required.' });
  }

  try {
    // Check if the email exists in the database
    const userExists = await checkEmailExist(email);

    // If the user does not exist, return an error response
    if (!userExists) {
      return res.status(400).json({ error: 'No account associated with this email. Please sign up.' });
    }

    // Retrieve user by email
    const user = await UserInfo.findOne({ email });

    // Check if the verification code matches
    if (verificationCodes[email] !== verificationCode) {
      return res.status(400).json({ error: 'Invalid verification code.' });
    }

    // Respond with success message
    // Respond with success message and status
res.status(200).json({ status: 'verified', message: 'Verification successful.' });

  } catch (error) {
    console.error('Error verifying code:', error);
    res.status(500).json({ error: 'Failed to verify code.' });
  }
});

// Assuming you are using Express.js for your backend

app.put('/update-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // Check if email and newPassword are provided
    if (!email || !newPassword) {
      return res.status(400).json({ status: "error", message: "Email and new password are required" });
    }

    // Find the user by email
    let user = await UserInfo.findOne({ email });

    // Check if user exists
    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }

    // Update user's password
    user.password = newPassword;

    // Save updated user data
    await user.save();

    // Return success response
    res.status(200).json({ status: "ok", message: "Password updated successfully" });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ status: "error", message: "Failed to update password. Please try again." });
  }
});




// Endpoint to retrieve user data using JWT token
app.get('/user/profile', authMiddleware, async (req, res) => {
  try {
    // Get user ID from JWT payload
    const userId = req.userId;

    // Log the userId for debugging
    console.log('User ID:', userId);

    // Retrieve user data based on user ID
    const user = await UserInfo.findById(userId);

    // Log the retrieved user for debugging
    console.log('Retrieved User:', user);

    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }
    // Return user data
    res.status(200).json({ status: "ok", user });
  } catch (error) {
    // Log any errors for debugging
    console.error('Error fetching user profile:', error.message);
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Endpoint to update user details
app.put('/user/update', authMiddleware, async (req, res) => {
  try {
    // Get user ID from JWT payload
    const userId = req.userId;

    // Retrieve user data based on user ID
    let user = await UserInfo.findById(userId);

    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }

    // Update user details
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.mobile = req.body.mobile || user.mobile;
    user.cnic = req.body.cnic || user.cnic;

    // Update profile image if provided
    if (req.body.profileImage) {
      user.profileImage = req.body.profileImage;
    }

    // Save updated user data
    user = await user.save();

    // Return updated user data
    res.status(200).json({ status: "ok", user });
  } catch (error) {
    console.error('Error updating user details:', error.message);
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Parse JSON bodies
app.use(bodyParser.json());

const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: 'ahmedclacp@gmail.com',
    pass: 'qgkz zbgi ofox ulze'
  },
});

app.post('/send-email', (req, res) => {
  const { userName, userSubject, clientEmail, message } = req.body;

  const mailOptions = {
    from: clientEmail,
    to: 'ahmedclacp@gmail.com',
    subject: userSubject,
    text: `📩 *Name:* ${userName}\n✉️ *Email:* ${clientEmail}\n📝 *Message:* ${message}`
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.error('❌ Failed to send email:', error);
      res.status(500).send('❌ Failed to send email');
    } else {
      console.log('✅ Email sent successfully:', info.response);
      res.status(200).send('✅ Email sent successfully');
    }
  });
});

app.post('/send-email/contact', (req, res) => {
  const { userName, userEmail, message } = req.body;

  const mailOptions = {
    from: userEmail,
    to: 'ahmedclacp@gmail.com',
    text: ` *Name: ${userName}\n *Email: ${userEmail}\n📝 *Message: ${message}`
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.error('❌ Failed to send email:', error);
      res.status(500).send('❌ Failed to send email');
    } else {
      console.log('✅ Email sent successfully:', info.response);
      res.status(200).send('✅ Email sent successfully');
    }
  });
});

app.post('/api/notification/settings', async (req, res) => {
  const { _id, notificationsEnabled, soundEnabled, vibrationEnabled } = req.body;

  try {
    // Check if notification settings already exist for the user
    let settings = await NotificationSettings.findOne({ userId: _id }); // Use userId instead of _id

    if (settings) {
      // If settings exist, update them
      settings.notificationsEnabled = notificationsEnabled;
      settings.soundEnabled = soundEnabled;
      settings.vibrationEnabled = vibrationEnabled;
    } else {
      // If settings don't exist, create a new document
      settings = new NotificationSettings({
        userId: _id, // Save _id as userId
        notificationsEnabled,
        soundEnabled,
        vibrationEnabled,
      });
    }

    // Save the settings to the database
    await settings.save();

    res.status(200).json({ status: 'ok', message: 'Notification settings saved successfully' });
  } catch (error) {
    console.error('Error saving notification settings:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

app.put('/user/updatePassword', async (req, res) => {
  try {
    const { userId, oldPassword, newPassword, confirmPassword } = req.body;

    console.log(userId)

    if (!userId) {
      return res.status(400).json({ status: "error", message: "User ID is required" });
    }

    // Retrieve user data based on user ID
    let user = await UserInfo.findById(userId);

    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }

    // Validate password change
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ status: "error", message: "All fields are required" });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ status: "error", message: "New password and confirm password do not match" });
    }

    // Check if the provided old password matches the user's current password
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ status: "error", message: "Old password is incorrect" });
    }

    // Update user's password
    user.password = newPassword;

    // Save updated user data
    await user.save();

    // Return success response
    res.status(200).json({ status: "ok", message: "Password updated successfully" });
  } catch (error) {
    console.error('Error updating user password:', error);
    res.status(500).json({ status: "error", message: "Failed to update password. Please try again." });
  }
});

// Parse JSON bodies
app.use(bodyParser.json());

// Mount the user router
app.use('/users', usersRouter);

app.listen(port, () => {
  console.log(`Node Js Server started on port ${port}`);
});

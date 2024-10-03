const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true
    },
    cnic: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['citizen', 'lawyer','admin'], 
        default: 'citizen'
    },
    password: {
        type: String,
        required: true
    },
    profileImage: {
        type: String 
    },
    userLogged: {
        type: Boolean,
        default: false // Default value is false
    }
},
{
    collection: 'Users' 
});

// Hash the password before saving
UserSchema.pre('save', async function(next) {
    const user = this;
    if (!user.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        user.password = hashedPassword;
        next();
    } catch (error) {
        return next(error);
    }
});

// Define and export the model
const User = mongoose.model('User', UserSchema);
module.exports = User;

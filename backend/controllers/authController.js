import { User } from "../models/userModel.js";
import { sendVerificationCode, verifyCode } from "../utils/regAuth.js";
import { tokenGenerator } from "../utils/token.js";
// import admin from "../utils/firebase.js";



export const register = async (req, res) => {
  try {
    const { Phone } = req.body;

    if (!Phone) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    const phoneRegex = /^\+?\d+$/;
    if (!phoneRegex.test(Phone)) {
      return res
        .status(400)
        .json({ message: "Phone number must contain only digits" });
    }

    let user = await User.findOne({ Phone });

    // Generate OTP
    const response = await sendVerificationCode(Phone)
    if (!response.success) {
      return res
        .status(500)
        .json({ message: "Error generating verification code" });
    }

    if (user) {
      user.verificationCode = response.otp;
      user.verificationCodeExpiresAt = Date.now() + 5 * 60 * 1000;
      await user.save();
    } else {
      user = await User.create({
        Phone,
        verificationCode: response.otp,
        verificationCodeExpiresAt: Date.now() + 5 * 60 * 1000,
      });
    }

    // return OTP to frontend for simulation
    return res.status(201).json({
      message: "OTP generated",
      success: true,
      otp: response.otp, 
      userId: user._id,
    });
  } catch (error) {
    console.error("Error registering user:", error);
    return res
      .status(500)
      .json({ message: "Error registering user", error: error.message });
  }
};

export const verifyPhone = async (req, res) => {
  try {
 
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: "Phone and OTP are required" });
    }

    // finds user by phone
    const user = await User.findOne({ Phone: phone });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // checks if user has a verification request ID
    if (!user.verificationCode) {
      return res
        .status(400)
        .json({ message: "No pending verification request" });
    }

    // Check Expiry
    if (
      user.verificationCodeExpiresAt &&
      user.verificationCodeExpiresAt < Date.now()
    ) {
      return res
        .status(400)
        .json({ message: "OTP has expired. Please request a new one." });
    }

    const isValid = await verifyCode(user.verificationCode, otp);

    if (!isValid) {
      return res.status(401).json({ message: "Incorrect OTP" });
    }

    // updates user status
    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpiresAt = undefined;
    await user.save();

    // generates jwt token
    const token = tokenGenerator(user._id);

    return res.status(200).json({
      message: "User verified successfully",
      success: true,
      token,
      user: user,
    });
  } catch (error) {
    console.error("Error verifying user:", error);
    return res
      .status(500)
      .json({ message: "Error verifying user", error: error.message });
  }
};

/* 
export const verifyPhoneFirebase = async (req, res) => {
  try {
    const { idToken, phone } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: "ID Token is required" });
    }

    // Verify Firebase Token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const phoneNumber = decodedToken.phone_number || phone; 

    if (!phoneNumber) {
         return res.status(400).json({ message: "Could not identify phone number from token" });
    }

    // Find or Create User
    let user = await User.findOne({ Phone: phoneNumber });

    if (!user) {
        user = await User.create({
            Phone: phoneNumber,
            isVerified: true
        });
    } else {
        // Ensure verified if they logged in successfully with Firebase
        if(!user.isVerified) {
            user.isVerified = true;
            await user.save();
        }
    }

    // Generate internal JWT
    const token = tokenGenerator(user._id);

    return res.status(200).json({
      message: "User verified successfully",
      success: true,
      token,
      user: user
    });

  } catch (error) {
    console.error("Error verifying user:", error);
    return res.status(401).json({ message: "Invalid Token or Verification Failed", error: error.message });
  }
};
*/

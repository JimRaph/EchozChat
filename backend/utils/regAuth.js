function generateOTP(length = 6) {
  const characters = "0123456789";

  let otp = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    otp += characters[randomIndex];
  }
  return otp;
}

export const sendVerificationCode = async (phone) => {
  const otp = generateOTP();

  // return the OTP.

  console.log(`OTP sent. To: ${phone}, Code: ${otp}`);

  return { success: true, otp: otp, phone: phone };
};

export const verifyCode = async (otpD, otp) => {
  return otpD == otp;
};

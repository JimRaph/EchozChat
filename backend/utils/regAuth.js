import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

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

  const testNumbers = ["1234", "2233", "5678"];
  if (testNumbers.includes(phone)) {
    return { success: true, otp: otp, phone: phone };
  }

  try {

    const snsClient = new SNSClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });


    const params = {
      Message: `Your verification code is ${otp}`,
      PhoneNumber: phone,
      MessageAttributes: {
        "AWS.SNS.SMS.SMSType": {
          DataType: "String",
          StringValue: "Transactional", 
        },
      },
    };

    const command = new PublishCommand(params);
    await snsClient.send(command);

    return { success: true, phone: phone, otp: otp };
  } catch (error) {
    console.error("Error sending SMS via AWS SNS:", error);
    return { success: false, error: error.message };
  }
};

export const verifyCode = async (otpD, otp) => {
  return otpD == otp;
};

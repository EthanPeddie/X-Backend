import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { error } from "console";
import dotenv from "dotenv";

dotenv.config();

const ses = new SESClient({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY || "",
    secretAccessKey: process.env.AWS_SECRET_KEY || "",
  },
});

interface EmailMessage {
  toAddress: string;
  fromAddress: string;
  message: string;
}

function createSendEmailCommand({
  toAddress,
  fromAddress,
  message,
}: EmailMessage) {
  return new SendEmailCommand({
    Destination: {
      ToAddresses: [toAddress],
    },
    Source: fromAddress,
    Message: {
      Subject: {
        Charset: "UTF-8",
        Data: "Your one-time password",
      },
      Body: {
        Text: {
          Charset: "UTF-8",
          Data: message,
        },
      },
    },
  });
}

export async function sendEmailToken(email: string, token: string) {
  console.log("email: ", email);

  const message = `Your one time password: ${token}`;
  const command = createSendEmailCommand({
    toAddress: email,
    fromAddress: "kaungmyatthu2620@gmail.com",
    message: message,
  });

  try {
    return await ses.send(command);
  } catch (e) {
    console.log("Error sending email", e);
    return error;
  }
}

sendEmailToken("kmyatthu2620@gmail.com", "123");

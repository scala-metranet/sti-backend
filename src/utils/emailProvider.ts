import { MAILTRAP_HOST, MAILTRAP_PASSWORD, MAILTRAP_USER } from "@/config";

const nodemailer = require("nodemailer");

export class NodeMailerProvier {
  async send(param: any) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.NODE_ENV != 'production'?'smtp.ethereal.email':MAILTRAP_HOST,
        port: 587,
        auth: {
          user: process.env.NODE_ENV != 'production'?'brain.thiel@ethereal.email':MAILTRAP_USER,
          pass: process.env.NODE_ENV != 'production'?'krkFhphMaTjYkQJeSz':MAILTRAP_PASSWORD,
        },
      });

      const info = await transporter.sendMail({
        from: `"Level Up" <info@level-up.id`, // sender address
        to: param.email, // list of receivers
        subject: param.subject, // Subject line
        html: param.content, // html body
      });
      console.log("Message sent: %s", info.messageId);
      // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

      // Preview only available when sending through an Ethereal account
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    } catch (error) {
      console.log("Error: %s", error);
    }
  }
}

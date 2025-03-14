// //import { SendMailClient } from "zeptomail";
// const { SendMailClient } = require("zeptomail");

// const url = "api.zeptomail.com/";
// const token =
//   "Zoho-enczapikey wSsVR61zqxWjBqd/nGb8J+48kVoEBwnzHB5+3AOjuCT+HPyT9cc8kUWcVgCiGfceQDM6EzoTpu58mhkHhDEN3tV+zV0AWSiF9mqRe1U4J3x17qnvhDzJWWxUkRKLLYoOwglimGJhEs0g+g==";

// export class ZeptomailProvider {
//   async send(to: string): Promise<void> {
//     const client = new SendMailClient({ url, token });
//     client
//       .sendMail({
//         bounce_address: "false",
//         from: {
//           address: "noreply@undefined",
//           name: "noreply",
//         },
//         to: [
//           {
//             email_address: {
//               address: to,
//               name: "Ikrom Aulia Fahdi",
//             },
//           },
//         ],
//         subject: "Test Email",
//         htmlbody: "<div><b> Test email sent successfully.</b></div>",
//       })
//       .then(resp => console.log(resp))
//       .catch(error => console.log(error));
//   }
// }

import { join } from "path";
import { ModelOtpVerification } from "@/models/otp_verification.model";
import { generateId } from "@/utils/util";
import moment from "moment";
import { HttpException } from "@/exceptions/HttpException";
import { NodeMailerProvier } from "@/utils/emailProvider";

class OtpService {
	public async sendOtp(param:any): Promise<unknown> {
		const expiredDate = moment().add(10,'minutes').format('YYYY-MM-DD HH:mm');

    const otp = await this.generateOtp();
    //delete otp if exist
    const checkOtp = await ModelOtpVerification.query().where('user_id',param.user_id).first();
    if(checkOtp){
      const deleteOtp = await ModelOtpVerification.query().delete().where('user_id',param.user_id);
      if (!deleteOtp) throw new HttpException(500, "Error delete");
    }

		const insertOtp = await ModelOtpVerification.query().insert({
			id: generateId(),
      user_id: param.user_id,
      otp_code: otp,
      expired: moment(expiredDate).format('YYYY-MM-DD HH:mm')
		}).into(ModelOtpVerification.tableName)
    if (!insertOtp) throw new HttpException(500, "Error input");

    const emailProvider = new NodeMailerProvier();
    const fs = require("fs");
    const handlebars = require("handlebars");
    let pathview = join(process.cwd(), "/src/views/otp.html");
    const source = fs.readFileSync(pathview, "utf-8").toString();
    const template = handlebars.compile(source);
    const replacements = {
      name: param.name,
      email: param.email,
      otp_code: otp
    };

    emailProvider.send({
      email: param.email,
      subject: `Verifikasi Kode OTP`,
      content: template(replacements),
    });

		return insertOtp;
	}

  public async generateOtp(){
    var digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < 6; i++ ) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
  }
}

export default OtpService;

import fs from "fs";
import path from "path";
import { Token } from "@interfaces/token.interface";
import { Tokens } from "@models/tokens.model";
import { User } from "@interfaces/users.interface";
import { importPKCS8, SignJWT } from "jose";
import { randomBytes } from "crypto";
import xid from "xid-js";
import { sub } from "date-fns";

class TokenService {
	public async removeOldToken(): Promise<unknown> {
		const expiredDate = sub(new Date(), { days: 1 });
		return await Tokens.query().where("created_at", "<", expiredDate).del();
	}
	public async saveToken(
		userId: string,
		accessKey: string,
		refreshKey: string,
	): Promise<Token> {
		return await Tokens.query()
			.insert({
				id: xid.next(),
				access_key: accessKey,
				refresh_key: refreshKey,
				user_id: userId,
			})
			.into(Tokens.tableName);
	}

	public async generateTokens(
		data: User,
		accessKey: string,
		refreshKey: string,
	): Promise<{ accessToken: string; refreshToken: string }> {
		const JWT_ISSUER = "levelup";
		const JWT_AUDIENCE = "levelup";
		const keyPath = path.join(__dirname, "../../keys/eddsa-private.pem");
		const privateKey = fs.readFileSync(keyPath, "utf8");
		const userId = data.id;
		// rome-ignore lint/performance/noDelete: <explanation>
		delete data.id;
		const accessPayload = {
			iss: JWT_ISSUER, // who created this token
			sub: userId, // whom the token refers to
			aud: JWT_AUDIENCE, //who or what token is indented for
			exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * Number(7),
			nbf: Math.floor(Date.now() / 1000), // not valid before
			jti: randomBytes(8).toString("hex"), // unique ID for this token
			prm: accessKey,
			data,
		};
		const refreshPayload = {
			iss: JWT_ISSUER, // who created this token
			sub: userId, // whom the token refers to
			aud: JWT_AUDIENCE, //who or what token is indented for
			exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * Number(30),
			nbf: Math.floor(Date.now() / 1000), // not valid before
			jti: randomBytes(8).toString("hex"), // unique ID for this token
			prm: refreshKey,
			data,
		};
		const importedPrivateKey = await importPKCS8(privateKey, "EdDSA");
		const accessToken = await new SignJWT(accessPayload)
			.setProtectedHeader({ alg: "EdDSA" })
			.sign(importedPrivateKey);
		const refreshToken = await new SignJWT(refreshPayload)
			.setProtectedHeader({ alg: "EdDSA" })
			.sign(importedPrivateKey);
		return { accessToken, refreshToken };
	}

	public async findByUserId(userId: string): Promise<Token> {
		return await Tokens.query().where("user_id", userId).first();
	}

	public async removeByUserId(userId: string): Promise<unknown> {
		return await Tokens.query().where("user_id", userId).del();
	}

	public async findByKey(key: string): Promise<Token[]> {
		return await Tokens.query()
			.where("access_key", key)
			.orWhere("refresh_key", key);
	}
}

export default TokenService;

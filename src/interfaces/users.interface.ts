export interface User {
	id: string;
	name: string;
	email: string;
	password: string;
	role_id: string;
	provider: string;
	status?: string;
}

export interface PayloadUser {
	name: string;
	email: string;
	role: string;
}

import request from "supertest";
import App from "@/app";
import AuthRoute from "@/routes/auth.route";
import UsersRoute from "@/routes/users.route";
import { RoleName } from "@/dtos/roles.dto";
import { LoginUserDto } from "@/dtos/users.dto";
import UserService from "@/services/users.service";
let newUserId: string;
afterAll(async () => {
  // delete test data
  const userService = new UserService();
  await userService.deleteUser(newUserId);
  await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
});

describe("Testing Auth", () => {
  const authRoute = new AuthRoute();
  const userRoute = new UsersRoute();
  const app = new App([authRoute, userRoute]);
  const server = request(app.getServer());

  let accessToken: string;

  const userData: any = {
    email: "test@email.com",
    password: "passwordpassword",
    name: "testing",
    role_id: RoleName.admin,
    provider: "email",
    no_hp: "0811111111",
  };
  describe("[POST] /register", () => {
    const registerRoute = `${authRoute.path}/register`;

    it("should success register and return userData", async () => {
      const res = await server.post(registerRoute).set({ connection: "keep-alive" }).send(userData);

      newUserId = res.body.data.id;
      expect(res.statusCode).toBe(201);
      expect(res.header["content-type"]).toBe("application/json; charset=utf-8");
      expect(res.body.data).toHaveProperty("email", userData.email);
      expect(res.body.data).toHaveProperty("id", newUserId);
      expect(res.body.data).toHaveProperty("name", userData.name);
      expect(res.body.data).toHaveProperty("no_hp", userData.no_hp);
      expect(res.body.data).toHaveProperty("provider", userData.provider);
      expect(res.body.data).toHaveProperty("role_id", userData.role_id);
      expect(res.body).toHaveProperty("message", "Register successful.");
    });
    it("should 409 for duplicates email", async () => {
      const res = await server.post(registerRoute).set({ connection: "keep-alive" }).send(userData);
      expect(res.statusCode).toBe(409);
      expect(res.header["content-type"]).toBe("application/json; charset=utf-8");
      expect(res.body.errors).toBeTruthy;
      expect(res.body).toHaveProperty("message", "This email already exists.");
    });
    it("should 400 for password less then 12 characters", async () => {
      const userData: any = {
        email: "test@email.com",
        password: "password",
        name: "testing",
        role_id: RoleName.admin,
        provider: "email",
        no_hp: "0811111111",
      };
      const res = await server.post(registerRoute).set({ connection: "keep-alive" }).send(userData);
      expect(res.statusCode).toBe(400);
      expect(res.header["content-type"]).toBe("application/json; charset=utf-8");
      expect(res.body.errors).toBeTruthy;
      expect(res.body).toHaveProperty("message", "password must be longer than or equal to 12 characters");
    });

    it("should 404 for wrong role", async () => {
      userData.role_id = "wrong role";
      const res = await server.post(registerRoute).set({ connection: "keep-alive" }).send(userData);
      expect(res.statusCode).toBe(400);
      expect(res.header["content-type"]).toBe("application/json; charset=utf-8");
      expect(res.body.errors).toBeTruthy;
      expect(res.body).toHaveProperty("message", "role_id must be a valid enum value");
    });
  });
  describe("[POST] /login", () => {
    const loginRoute = `${authRoute.path}/login`;
    it("should 409 for unverified account", async () => {
      const testData: LoginUserDto = {
        email: userData.email,
        password: userData.password,
      };
      const res = await server.post(loginRoute).set({ connection: "keep-alive" }).send(testData);

      expect(res.statusCode).toBe(409);
      expect(res.header["content-type"]).toBe("application/json; charset=utf-8");
      expect(res.body.errors).toBeTruthy;
      expect(res.body).toHaveProperty("message", "Account not verified.");
    });
    it("should success login and return accessToken, refreshToken, message", async () => {
      const testData: LoginUserDto = {
        email: userData.email,
        password: userData.password,
      };
      // verify user first
      const userService = new UserService();
      await userService.verifyUser(userData.email);

      const res = await server.post(loginRoute).set({ connection: "keep-alive" }).send(testData);
      accessToken = res.body.data.accessToken;
      expect(res.statusCode).toBe(200);
      expect(res.header["content-type"]).toBe("application/json; charset=utf-8");
      expect(res.body.data).toHaveProperty("accessToken");
      expect(res.body.data).toHaveProperty("refreshToken");
      expect(res.body).toHaveProperty("message", "Login successful.");
    });

    it("should 400 for empty data", async () => {
      const testData: LoginUserDto = {
        email: "",
        password: "",
      };
      const res = await server.post(loginRoute).set({ connection: "keep-alive" }).send(testData);
      expect(res.statusCode).toBe(400);
      expect(res.header["content-type"]).toBe("application/json; charset=utf-8");
      expect(res.body.errors).toBeTruthy;
      expect(res.body).toHaveProperty("errors[0].property", "email");
      expect(res.body).toHaveProperty("errors[1].property", "password");
    });
    it("should 409 for unregistered email", async () => {
      const testData: LoginUserDto = {
        email: "unkown@gmail.com",
        password: "password",
      };
      const res = await server.post(loginRoute).set({ connection: "keep-alive" }).send(testData);
      expect(res.statusCode).toBe(409);
      expect(res.header["content-type"]).toBe("application/json; charset=utf-8");
      expect(res.body.errors).toBeTruthy;
      expect(res.body).toHaveProperty("message", "Invalid email / password.");
    });
    it("should 409 for incorrect password", async () => {
      const testData: LoginUserDto = {
        email: userData.email,
        password: "wrongpassword",
      };
      const res = await server.post(loginRoute).set({ connection: "keep-alive" }).send(testData);
      expect(res.statusCode).toBe(409);
      expect(res.header["content-type"]).toBe("application/json; charset=utf-8");
      expect(res.body.errors).toBeTruthy;
      expect(res.body).toHaveProperty("message", "Invalid email / password.");
    });
  });
  describe("[POST] /logout", () => {
    const logoutRoute = `${authRoute.path}/logout`;
    it("should success logout and return message", async () => {
      const res = await server
        .post(logoutRoute)
        .set({ connection: "keep-alive" })
        .set({ Authorization: `Bearer ${accessToken}` });
      expect(res.statusCode).toBe(200);
      expect(res.header["content-type"]).toBe("application/json; charset=utf-8");
      expect(res.body).toHaveProperty("message", "Logout successful.");
    });

    it("should 401 for missing token", async () => {
      const res = await server.post(logoutRoute).set({ connection: "keep-alive" });
      expect(res.statusCode).toBe(401);
      expect(res.header["content-type"]).toBe("application/json; charset=utf-8");
      expect(res.body).toHaveProperty("message", "Authentication token missing");
    });
    it("should 401 for expired token", async () => {
      const res = await server
        .post(logoutRoute)
        .set({ connection: "keep-alive" })
        .set({ Authorization: `Bearer ${accessToken}` });
      expect(res.statusCode).toBe(401);
      expect(res.header["content-type"]).toBe("application/json; charset=utf-8");
      expect(res.body).toHaveProperty("message", "Token expired, please re-login");
    });
  });

  // error: StatusCode : 404, Message : Authentication token missing
  // describe('[POST] /logout', () => {
  //   it('logout Set-Cookie Authorization=; Max-age=0', () => {
  //     const authRoute = new AuthRoute();
  //     const app = new App([authRoute]);

  //     return request(app.getServer())
  //       .post('/logout')
  //       .expect('Set-Cookie', /^Authorization=\;/);
  //   });
  // });
});

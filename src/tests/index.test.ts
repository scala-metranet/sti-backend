import request from "supertest";
import App from "@/app";
import IndexRoute from "@routes/index.route";

describe("Testing Index", () => {
	describe("[GET] /", () => {
		const indexRoute = new IndexRoute();
		const app = new App([indexRoute]);
		const server = request(app.getServer());

		it("should response statusCode 200", async () => {
			const route = indexRoute.path;
			console.log(route);
			const res = await server.get(route).set({ connection: "keep-alive" });
			expect(res.statusCode).toBe(200);
			expect(res.header["content-type"]).toBe("text/plain; charset=utf-8");
		});
	});
});

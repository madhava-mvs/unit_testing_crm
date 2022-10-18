const handler = require("./handler");
describe("login api test", () => {
  test("Request without username and with password", async () => {
    const event = {
      body: {
        username: "",
        password: "test@123",
      },
    };
    const res = await handler.login1(event);
    expect(res.body).toBe('{"status":"error","Message":"username missing"}');
  });
  test("Request without username and with password", async () => {
    const event = {
      body: {
        username: "abc@123",
        password: "",
      },
    };
    const res = await handler.login1(event);
    expect(res.body).toBe('{"status":"error","Message":"password missing"}');
  });
});

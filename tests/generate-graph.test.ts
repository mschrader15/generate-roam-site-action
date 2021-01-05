import run from "../src/generate-graph";
import dotenv from "dotenv";
// import path from 'path';
// import fs from 'fs';
dotenv.config();

test("Run Action", async (done) => {
  jest.setTimeout(600000); // 10 min
  await run()
    .then(done)
    .catch(({ message }) => fail(message));
});

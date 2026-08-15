import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { UserRepository } from "./repositories/userRepository";
import { v4 as uuid } from "uuid";

async function test() {
  try {
    const user = await UserRepository.create({
      name: "Test User",
      email: `test-${uuid()}@example.com`,
      passwordHash: "dummyhash",
      role: "citizen"
    });
    console.log("Success:", user);
  } catch (err) {
    console.error("Error creating user:", err);
  }
}

test();

import { defineApp } from "convex/server";
import { auth } from "./auth";

// The "app" entry point, where your custom API routes live.
// Every file in the `functions/` directory is automatically added here.
export default defineApp({ auth });

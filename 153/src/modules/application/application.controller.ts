import { Hono } from "hono";

export class ApplicationController {
  public routes(): Hono {
    return new Hono();
  }
}

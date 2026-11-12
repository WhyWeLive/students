import { Hono } from "hono";
import { ApplicationController } from "./application.controller";

export class ApplicationModule {
  private readonly controller: ApplicationController;

  constructor() {
    this.controller = new ApplicationController();
  }

  public init(): ApplicationModule {
    return this;
  }

  public start(): Hono {
    return new Hono().route("/application/", this.controller.routes());
  }
}

import { ApplicationModule } from "./modules/application.module";

// CHANGED
const application = new ApplicationModule().init().start();

export default {
    fetch: application.fetch,
    port: 8082
};
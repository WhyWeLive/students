import { ApplicationModule } from "./modules/application.module";

const application = new ApplicationModule().init().server();

export default {
    fetch: application.fetch,
    port: 8082
};
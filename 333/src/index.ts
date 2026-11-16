import { ApplicationModule } from "./modules/application.module";

const application = new ApplicationModule().init().start();

export default {
    fetch: application.fetch,
    port: 8082,
};

// https://github.com/WhyWeLive/students
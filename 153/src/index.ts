import { ApplicationModule } from "./modules/application/application.module";

const application = new ApplicationModule()
    .init()
    .start();


export default {
    fetch: application.fetch,
    port: 3000
}
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const platform_ws_1 = require("@nestjs/platform-ws");
const norest_module_1 = require("./norest.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(norest_module_1.NoRestModule);
    app.useWebSocketAdapter(new platform_ws_1.WsAdapter(app));
    await app.listen(3030);
}
bootstrap();
//# sourceMappingURL=main.js.map
import app from "./app.js";
import { env } from "./config/env.js";

// 0.0.0.0: Render necesita que la API escuche en todas las interfaces
app.listen(env.port, "0.0.0.0", () => {
    console.log(`API escuchando en el puerto ${env.port} (${env.nodeEnv}, TZ=${env.timeZone})`);
});

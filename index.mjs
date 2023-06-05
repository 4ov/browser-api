//@ts-check
import { serve } from "@hono/node-server";
import { Hono } from "hono/tiny";
import { process } from "./main.js";
const app = new Hono();

app.use(async (c, next) => {
    const url = new URL(c.req.url);
    if (url.pathname.endsWith("/") && url.pathname.length !== 1) {
        url.pathname = url.pathname.slice(0, -1);
        return c.redirect(url.toString());
    }
    await next();
});

app.get("/", c=>{
    return c.text("_")
});

const api = app.basePath("/api/v1");

api.get("/get", async (c) => {
    const processUrl = c.req.query().url;
    if (!processUrl) {
        return c.jsonT(
            {
                error: "no url provided",
            },
            400
        );
    }
    return c.json(await process(processUrl));
});

serve(app, (o) => {
    console.log("started", o.port);
});

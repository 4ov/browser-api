//@ts-check
import { JSDOM } from "jsdom";
import { fetch } from "undici";
import { $URL, withProtocol } from "ufo";

const PROD = false;

globalThis.rich = true;



/**
 * 
 * @param  {Parameters<console['log']>} args 
 */
function debug(...args){
    if(PROD){
        console.log(...args);
    }
}


/**
 *
 * @param {string | URL} _url
 */
export function process(_url) {
    return new Promise(async (resolve, reject) => {
        let url = new $URL(_url.toString());
        url = url.protocol ? url : new $URL(withProtocol(_url.toString(), "http://"))
        if (
            (/\d+\.\d+\.\d+\.\d+/.test(url.hostname) ||
                url.hostname.startsWith("localhost")) &&
            PROD
        ) {
            throw new Error("Invalid URL");
        }

        const result = await fetch(url, {
            redirect: "follow",
            headers: {
                "user-agent":
                    "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36",
            },
        });

        const { window } = new JSDOM(
            await result.text(),
            // fs.readFileSync("./index.html", { encoding: "utf-8" }),
            {
                url: result.url,
                runScripts: "dangerously",
                resources: "usable",
            }
        );
        const { document } = window;

        window.scrollTo = function () {};

        window.document.addEventListener("DOMContentLoaded", () => {
            setImmediate(() => {
                const title = document.title;
                const description =
                    document
                        .querySelector('meta[name="description"]')
                        ?.getAttribute("content") ||
                    document
                        .querySelector('meta[name="og:description"]')
                        ?.getAttribute("content") ||
                    null;
                const fav_url = new URL("https://www.google.com/s2/favicons");
                fav_url.searchParams.set("domain", url.hostname);
                fav_url.searchParams.set("sz", "128");
                resolve({
                    title,
                    description,
                    fav_url: fav_url.toString(),
                    url: result.url
                })
                debug(title, description, fav_url.toString());
                window.close();
            });
        });
    });

    // console.log(document.body.textContent);

    // for (const i of document.images) {
    //     console.log(new URL(i.src, result.url).toString());
    // }
}

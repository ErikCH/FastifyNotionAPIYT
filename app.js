import Fastify from "fastify";
import dotenv from "dotenv";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
dotenv.config();

import Client from "@notionhq/client";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fastify = Fastify({ logger: true });
export default async function (fastify, opts) {
  fastify.register(import("fastify-static"), {
    root: join(__dirname, "public"),
    prefix: "/public/" // optional: default '/'
  });

  const notion = new Client.Client({
    auth: process.env.NOTION_TOKEN
  });

  fastify.get("/", async function (request, reply) {
    return reply.sendFile("index.html"); // serving path.join(__dirname, 'public', 'myHtml.html') directly
  });

  fastify.get("/api", async function (request, reply) {
    const quotes = await notion.databases.query({
      database_id: process.env.DB
    });

    const map = quotes.results.map((val) => {
      return { title: val.properties.Name.title[0].text.content };
    });

    return map;
  });

  fastify.get("/api/random", async function (request, reply) {
    //   const listUsersResponse = await notion.users.list();
    //   console.log(listUsersResponse);
    const quotes = await notion.databases.query({
      database_id: process.env.DB
    });
    const length = quotes.results.length;
    const random = Math.floor(Math.random() * (length - 0));
    console.log(random);
    return quotes.results[random].properties.Name.title[0].text.content;
    //   return quotes;
  });

  fastify.post("/api", async function (request, reply) {
    const { title } = request.body;

    const create = await notion.pages.create({
      parent: {
        database_id: process.env.DB
      },
      properties: {
        title: [
          {
            text: {
              content: title
            }
          }
        ]
      }
    });
    console.log("create", create);

    return create;
  });

  fastify.listen(process.env.PORT || 4000, () => {
    console.log("running on port " + process.env.PORT);
  });
}

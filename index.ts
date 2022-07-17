import { ApolloServer } from "apollo-server";
import "reflect-metadata";
import * as TypeGraphQL from "type-graphql";
import * as TypeORM from "typeorm";
import { Container } from "typeorm-typedi-extensions";

import { Rate } from "./entities/rate";
import { Recipe } from "./entities/recipe";
import { User } from "./entities/user";
import { seedDatabase } from "./helpers";
import { RateResolver } from "./resolvers/rate-resolver";
import { RecipeResolver } from "./resolvers/recipe-resolver";

export interface Context {
  user: User;
}

// register 3rd party IOC container
TypeORM.useContainer(Container, {});

async function bootstrap() {
  try {
    // create TypeORM connection
    await TypeORM.createConnection({
      type: "postgres",
      database: "postgres",
      username: "oluwasetemi", // fill this with your username
      password: "", // and password
      port: 5432, // and port
      host: "localhost", // and host
      entities: [Recipe, Rate, User],
      synchronize: true,
      logger: "advanced-console",
      logging: "all",
      dropSchema: true,
      cache: true,
    });

    // seed database with some data
    const { defaultUser } = await seedDatabase();

    // build TypeGraphQL executable schema
    const schema = await TypeGraphQL.buildSchema({
      resolvers: [RecipeResolver, RateResolver],
      container: Container,
      emitSchemaFile: true,
    });

    // create mocked context
    const context: Context = { user: defaultUser };

    // Create GraphQL server
    const server = new ApolloServer({ schema, context });

    // Start the server
    const { url } = await server.listen(4000);
    console.log(`Server is running, GraphQL Playground available at ${url}`);
  } catch (err) {
    console.error(err);
  }
}

bootstrap();

import "reflect-metadata";
import {Container} from "typedi";
import {useContainer as useTypeGraphQLContainer} from "type-graphql";
import {useContainer as useClassValidatorContainer} from 'class-validator';
import {useContainer as useRoutingControllersContainer } from "routing-controllers";
import ApplicationServer from "./application";
import settings from "../config/settings";

Container.set("settings", settings);

useTypeGraphQLContainer(Container);
useClassValidatorContainer(Container);
useRoutingControllersContainer(Container);

(async () => {
  const server = Container.get(ApplicationServer);

  return server.run();
})();

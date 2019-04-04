import {Query, Resolver} from "type-graphql";
import {SystemInfo} from "./model";

@Resolver()
export default class SystemResolver {
  @Query((returns) => SystemInfo)
  getSystemInfo() {
    return new SystemInfo("OK");
  }
}

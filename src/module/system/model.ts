import {Field, ObjectType} from "type-graphql";

@ObjectType()
export class SystemInfo {
  constructor(status: string) {
    this.status = status;
  }

  @Field()
  status: string;
}

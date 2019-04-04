import {Field, ID, ObjectType} from "type-graphql";
import {Entity, PrimaryColumn} from "typeorm";

@Entity("user_roles")
@ObjectType()
export class UserRole {
  @Field((type) => ID)
  @PrimaryColumn()
  value: string;
}

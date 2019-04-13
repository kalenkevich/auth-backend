import {Field, InputType} from "type-graphql";

@InputType()
export class UserSignInInput {
  @Field()
  public email: string;

  @Field()
  public password: string;
}

@InputType()
export class UserSignUpInput {
  @Field()
  public name: string;

  @Field()
  public email: string;

  @Field()
  public password: string;
}

@InputType()
export class SocialUserData {
  @Field()
  public name: string;

  @Field()
  public email: string;

  @Field()
  public avatarUrl: string;

  @Field()
  public token: string;

  @Field()
  public providerUserId: string;
}

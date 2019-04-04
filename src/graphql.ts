import UserResolver from './module/user/resolver';
import AuthorizationResolver from './module/authorization/resolver';
import SystemResolver from './module/system/resolver';

export const resolvers = [
  UserResolver,
  AuthorizationResolver,
  SystemResolver,
];

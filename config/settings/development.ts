const AuthFrontendUrl = "http://development.auth.kalenkevich.com";

export default {
  AllowedClientOrigins: [
    'https://development.auth.kalenkevich.com',
    'http://development.auth.kalenkevich.com',
    'https://development.blog.kalenkevich.com',
    'http://development.blog.kalenkevich.com',
    'https://blog-backend-development.herokuapp.com',
    'http://blog-backend-development.herokuapp.com',
    'https://development.holiday.kalenkevich.com',
    'http://development.holiday.kalenkevich.com',
    'http://localhost:8080',
    'http://localhost:8081',
    'http://localhost:8082',
    'http://localhost:8083',
    'http://localhost:8084',
    'http://localhost:8085',
  ],
  AuthFrontendUrl,
  Database: {
    host: "ec2-54-228-243-238.eu-west-1.compute.amazonaws.com",
    port: 5432,
    username: "kuizlibxgtooiy",
    password: "87a5a22507623f927cccd866340ec4858553e18873162c3b72a1f552d08d73c1",
    database: "dcn0jvgag6vfep",
  },
  TwitterAppRedirectUrl: `${AuthFrontendUrl}/social/twitter/callback`,
  FacebookAppRedirectUrl: `${AuthFrontendUrl}/social/facebook/callback`,
  LinkedInAppRedirectUrl: `${AuthFrontendUrl}/social/linkedin/callback`,
  VkAppRedirectUrl: `${AuthFrontendUrl}/social/vk/callback`,
  InstagramAppRedirectUrl: `${AuthFrontendUrl}/social/instagram/callback`,
  GoogleAppRedirectUrl: `${AuthFrontendUrl}/social/google/callback`,
}

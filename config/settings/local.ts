const AuthFrontendUrl = "http://localhost:8082";

export default {
  AllowedClientOrigins: ['http://localhost:8080', 'http://localhost:8081', 'http://localhost:8082'],
  Database: {
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "Sonyxperia!2",
    database: "auth",
  },
  AuthFrontendUrl,
  TwitterAppRedirectUrl: `${AuthFrontendUrl}/social/twitter/callback`,
  FacebookAppRedirectUrl: `${AuthFrontendUrl}/social/facebook/callback`,
  LinkedInAppRedirectUrl: `${AuthFrontendUrl}/social/linkedin/callback`,
  VkAppRedirectUrl: `${AuthFrontendUrl}/social/vk/callback`,
  InstagramAppRedirectUrl: `${AuthFrontendUrl}/social/instagram/callback`,
  GoogleAppRedirectUrl: `${AuthFrontendUrl}/social/google/callback`,
}

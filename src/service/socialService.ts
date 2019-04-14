import qs from 'qs';
import axios from 'axios';
import { Inject, Service } from "typedi";
import { SocialProvider } from "../module/user/model";
import {SocialUserData} from "../module/authorization/model";

@Service()
export default class SocialService {
  @Inject("settings")
  settings: any;

  signInWith(provider: string, code: string): Promise<SocialUserData> {
    switch (provider) {
      case SocialProvider.TWITTER: return this.signInWithTwitter(code);
      case SocialProvider.FACEBOOK: return this.signInWithFacebook(code);
      case SocialProvider.LINKEDIN: return this.signInWithLinkedIn(code);
      case SocialProvider.VK: return this.signInWithVK(code);
      case SocialProvider.INSTAGRAM: return this.signInWithInstagram(code);
      case SocialProvider.GOOGLE: return this.signInWithGoogle(code);
    }
  }

  signInWithTwitter(code: string): Promise<SocialUserData> {
    return Promise.resolve({} as SocialUserData);
  }

  async signInWithFacebook(code: string): Promise<SocialUserData> {
    const safeUrl = encodeURIComponent(this.settings.FacebookAppRedirectUrl);
    const { data: { access_token } } = await axios.post(`https://graph.facebook.com/v3.2/oauth/access_token?client_id=${this.settings.FacebookAppId}&redirect_uri=${safeUrl}&client_secret=${this.settings.FacebookAppSecret}&code=${code}`);
    const { data: userData } = await axios.get(`https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${access_token}`);

    return {
      providerUserId: userData.id,
      name: userData.name,
      email: userData.email,
      avatarUrl: userData.picture.data.url,
      token: access_token,
    };
  }

  async signInWithLinkedIn(code: string): Promise<SocialUserData> {
    const { data: { access_token } } = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', qs.stringify({
      grant_type: 'authorization_code',
      redirect_uri: this.settings.LinkedInAppRedirectUrl,
      client_id: this.settings.LinkedInAppId,
      client_secret: this.settings.LinkedInAppSecret,
      code,
    }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
    const { data: userData } = await axios.get('https://api.linkedin.com/v2/me', { headers: { 'Authorization': `Bearer ${access_token}`} });
    const { data: { elements } } = await axios.get('https://api.linkedin.com/v2/clientAwareMemberHandles?q=members&projection=(elements*(primary,type,handle~))', { headers: { 'Authorization': `Bearer ${access_token}`} });
    const email = elements[0]['handle~'].emailAddress;
    const lastName = userData.lastName.localized[`${userData.lastName.preferredLocale.language}_${userData.lastName.preferredLocale.country}`];
    const firstName = userData.firstName.localized[`${userData.firstName.preferredLocale.language}_${userData.firstName.preferredLocale.country}`];

    return {
      providerUserId: userData.id,
      name: `${firstName} ${lastName}`,
      email,
      avatarUrl: userData.profilePicture.displayImage,
      token: access_token,
    };
  }

  async signInWithVK(code: string): Promise<SocialUserData> {
    const safeUrl = encodeURIComponent(this.settings.VkAppRedirectUrl);
    const { data: { access_token, user_id, email } } = await axios.get(`https://oauth.vk.com/access_token?client_id=${this.settings.VkAppId}&client_secret=${this.settings.VkAppSecret}&redirect_uri=${safeUrl}&code=${code}`);
    const { data: { response: [userData,] } } = await axios.get(`https://api.vk.com/method/users.get?user_ids=${user_id}&fields=photo_200_orig&access_token=${access_token}&v=5.95`);

    return {
      providerUserId: userData.id,
      name: `${userData.first_name} ${userData.last_name}`,
      email,
      avatarUrl: userData.photo_200_orig,
      token: access_token,
    }
  }

  async signInWithInstagram(code: string): Promise<SocialUserData> {
    const { data: { access_token, user: userData } } = await axios.post('https://api.instagram.com/oauth/access_token', qs.stringify({
      client_id: this.settings.InstagramAppId,
      client_secret: this.settings.InstagramAppSecret,
      grant_type: 'authorization_code',
      redirect_uri: this.settings.InstagramAppRedirectUrl,
      code,
    }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

    return {
      providerUserId: userData.id,
      name: userData.full_name,
      email: userData.username,
      avatarUrl: userData.profile_picture,
      token: access_token,
    };
  }

  async signInWithGoogle(code: string): Promise<SocialUserData> {
    const { data: { access_token } } = await axios.post('https://www.googleapis.com/oauth2/v4/token', qs.stringify({
      client_id: this.settings.GoogleAppId,
      client_secret: this.settings.GoogleAppSecret,
      grant_type: 'authorization_code',
      redirect_uri: this.settings.GoogleAppRedirectUrl,
      code,
    }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
    const { data: userData } = await axios.get(`https://www.googleapis.com/plus/v1/people/me?fields=emails,id,image,name&key=${this.settings.GoogleAppId}`, { headers: { 'Authorization': `Bearer ${access_token}`} });

    return {
      providerUserId: userData.id,
      name: `${userData.name.givenName} ${userData.name.familyName}`,
      email: userData.emails[0].value,
      avatarUrl: userData.image.url,
      token: access_token,
    };
  }
}

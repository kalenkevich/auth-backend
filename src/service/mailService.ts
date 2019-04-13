import sgMail from '@sendgrid/mail';
import {Inject, Service} from "typedi";

@Service()
export default class EmailService {
  sgMail: any;

  constructor(@Inject("settings") settings: any) {
    sgMail.setApiKey(settings.SendGridAPIKey);

    this.sgMail = sgMail;
  }

  sendMail(mail: any) {
    mail.from = 'auth@zenvoteam.com';

    return this.sgMail.send(mail);
  }
}

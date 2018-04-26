import { google } from 'googleapis';
const OAuth2 = google.auth.OAuth2;
export const oauth2Client = new OAuth2(
  process.env['G_OAUTH_CLIENT_ID'],
  process.env['G_OAUTH_CLIENT_SECRET'],
  process.env['G_OAUTH_CALLBACK']
);

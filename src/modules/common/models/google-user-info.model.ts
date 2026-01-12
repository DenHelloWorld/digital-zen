/**
 * Google user info model
 * Represents the user profile information returned by Google OAuth
 *
 * @see https://developers.google.com/identity/protocols/oauth2/openid-connect#an-id-tokens-payload
 */
export interface IGoogleUserInfo {
  /** Subject - Unique Google user identifier */
  sub: string;
  /** Full name */
  name: string;
  /** First name */
  given_name: string;
  /** Last name */
  family_name: string;
  /** Profile picture URL */
  picture: string;
  /** Email address */
  email: string;
  /** Whether email is verified */
  email_verified: boolean;
}

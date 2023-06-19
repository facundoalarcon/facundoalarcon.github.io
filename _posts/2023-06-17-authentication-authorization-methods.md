---
layout: post
title:  "Authentication and Authorization Methods"
date:   2023-06-17 13:00:02 -0300
categories: authentication authorization
---

In the netxt posts, I am not going to delve too deeply into these topics, since I consider that there is a lot of documentation on the matter in different identity providers and RFCs. I want to explain what is necessary and go directly to the implementation part, logically I am going to leave reference links

There are a set of open specifications and protocols that specify how to design an authentication and authorization system. 

## Identity industry standards

- [Open Authorization 2 (OAuth 2)](https://oauth.net/2/): The second verison of this standard, that allows a user to grant limited access to their resources on one site to another site, without having to expose their credentials. This framework enables a third-party application to obtain limited access to an HTTP service, either on behalf of a resource owner by orchestrating an approval interaction between the resource owner and the HTTP service, or by allowing the third-party application to obtain access on its own behalf.

- [OpenID Connect (OIDC)](https://openid.net/developers/how-connect-works/): an identity layer that sits on top of OAuth 2 and allows for easy verification of the user's identity, as well as the ability to get basic profile information from the identity provider. OAuth 2 and OIDC are related but serve different purposes in the realm of identity and access management. OAuth 2 is an authorization framework used for delegated access to resources, while OIDC is an authentication layer built on top of OAuth 2 that adds identity-related features. To learn more about this visit this [link](https://developer.okta.com/docs/concepts/oauth-openid/).

- [Security Assertion Markup Language (SAML)](https://www.cloudflare.com/learning/access-management/what-is-saml/): an open-standard, XML-based data format that allows businesses to communicate user authentication and authorization information to partner companies and enterprise applications their employees may use. For more information about differences between OAuth 2, OIDC and SAML, visit [this](https://www.okta.com/identity-101/whats-the-difference-between-oauth-openid-connect-and-saml/) site.

- [Lightweight Directory Access Protocol (LDAP)](https://learn.microsoft.com/en-us/previous-versions/windows/desktop/ldap/lightweight-directory-access-protocol-ldap-api): an application protocol used for accessing and maintaining distributed directory information services over an IP network. The function of LDAP is to enable access to an existing directory like Active Directory (AD). 

- [JSON Web Tokens (JWTs)](https://jwt.io/introduction): an open standard that defines a compact and self-contained way for securely transmitting information between parties as a JSON object.


## OAuth 2 Flows

Flow are ways of retrieving an Access Token. Deciding which one is suited for your use case depends mostly on your application type, but other parameters weigh in as well, like the level of trust for the client, or the experience you want your users to have. 
The OAuth framework specifies several [grant types](https://oauth.net/2/grant-types/) for different use cases, as well as a framework for creating new grant types:
- **Authorization Code:** After the user returns to the client via the redirect URL, the application will get the authorization code from the URL and use it to request an access token.
- **Proof Key for Code Exchange (PKCE):** is an extension to the Authorization Code flow to prevent CSRF and authorization code injection attacks. Usually its used with distributed applications such as CLI app or mobile apps.
- **Client Credentials:** The Client Credentials grant is used when applications request an access token to access their own resources, not on behalf of a user.
- **Device Code:** The Device Code grant type is used by browserless or input-constrained devices in the device flow to exchange a previously obtained device code for an access token.
- **Refresh Token:** The Refresh Token grant type is used by clients to exchange a refresh token for an access token when the access token has expired.

Legacy flows includes:
- **Implicit Grant:** The Implicit flow was a simplified OAuth flow previously recommended for native apps and JavaScript apps where the access token was returned immediately without an extra authorization code exchange step. It is not recommended to use the implicit flow (and some servers prohibit this flow entirely) due to the inherent risks of returning access tokens in an HTTP redirect without any confirmation that it has been received by the client.
- **Password Grant:** The client application has to collect the user's password and send it to the authorization server, it is not recommended that this grant be used at all anymore. This flow provides no mechanism for things like multifactor authentication or delegated accounts, so is quite limiting in practice. If you need to use this flow, try to use only internally.

To learn more about the authentication and authorization flows you can visit this [link](https://auth0.com/docs/get-started/authentication-and-authorization-flow), and you can learn more about grant types form this [link](https://auth0.com/docs/get-started/authentication-and-authorization-flow/which-oauth-2-0-flow-should-i-use).

We are particularly interested in PKCE for future posts.
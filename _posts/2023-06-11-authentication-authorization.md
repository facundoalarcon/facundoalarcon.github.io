---
layout: post
title:  "Authentication and Authorization"
date:   2023-06-14 19:05:09 -0300
categories: authentication
---
Always we talk about authentication and authorization but they are a lot of things to explore in each one, after all they are a fundamental piece of an system.

# Authentication
Authentication is the process of verifying the identity of a user or entity, ensuring that they are who they *claim* to be. This is the first step in any security process. You can complete an authentication process with: Passwords, One-time pins, Authentication apps, biometrics. Sometimes you need more than one factor before granting access, this is colled multi-factor authentication.

**Multi-Factor Authentication (MFA)** is an method in which a user is granted access after successfully presenting two or more pieces of evidence (or factors) to an authentication mechanism.

| Factor     | Concept                       | Example                                                 |
| ---------- | ----------------------------- |-------------------------------------------------------- |
| Knowledge  | something only the user knows | password, passphrase                                    |
| Possession | something only the user has   | USB security token, NFC key                             |
| Inherence  | something only the user is    | biometrics, fingerprint, face, voice, iris recognition  |

# Authorization
Authorization is the process of verifying what they have access to. This term is often used interchangeably with access control or client privilege. In secure environments, authorization must always follow authentication.

Despite the similar-sounding terms, authentication and authorization are separate steps in the login process. Understanding the difference between the two is key to successfully implementing an IAM solution.

|                               | Authentication       | Authorization                                                                              |
| ----------------------------- | -------------------- |--------------------------------------------------------------------------------------------|
| What does it do?              | validate credentials | Grants or denies permissions                                                               |
| How does it work?             | Through passwords, biometrics, one-time pins, or apps |  through policies and rules (maintained by security teams)|
| Is it visible to the user?    | Yes  | No  |
| It is changeable by the user? | Partially | No |
| How does data transmission?   | Through ID tokens | Through access tokens |
| What is the most common framework?  | OpenID (OIDC) | OAuth2.0 |
| When is placed? | Usually done before authorization | Usually done after successful authentication |
| Example | Employees in a company are required to authenticate through the network whit their domain credentials before accessing their company email | After an employee successfully authenticates, the system determines what information the employees are allowed to access |

# What's next?

In the nexts posts I'll want to talk about jason web tokens(JWT), Authorizations code flows, and how to apply this concepts in a kubernetes clusters and how to setup an external Identity Provider for authentication and Authorization via RBAC.

# References
- [Auth0: authentication and authorization](https://auth0.com/docs/get-started/identity-fundamentals/authentication-and-authorization)
- [okta: authentication vs authorization](https://www.okta.com/identity-101/authentication-vs-authorization/)









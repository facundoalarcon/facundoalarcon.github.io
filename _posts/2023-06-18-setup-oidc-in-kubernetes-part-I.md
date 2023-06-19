---
layout: post
title:  "Setup OIDC in Kubernetes clusters - Part I"
date:   2023-06-18 17:00:02 -0300
categories: kubernetes authentication authorization
---
In [previous post]({{ site.baseurl }}{% link _posts/2023-06-17-authentication-authorization-methods.md %}) we discuss about authentication and authorization. In this opportunity we will talk about this concepts in kubernetes.

In this post we explains how to authenticate to a Kubernetes cluster using [Open ID Connect (OIDC)](https://auth0.com/docs/security/tokens/json-web-tokens/create-namespaced-custom-claims) with a [Proof Key for Code Exchange (PKCE)](https://auth0.com/docs/authorization/flows/authorization-code-flow-with-proof-key-for-code-exchange-pkce) authentication flow using [Auth0](https://auth0.com/docs/get-started/auth0-overview) as the authentication provider and the [kubelogin](https://github.com/int128/kubelogin) plugin for kubectl. This tool allows for an authentication scheme that is platform-agnostic, regardless of where the cluster is located. Additionally, PKCE is chosen to [avoid distributing the application secret value in Auth0 to clients](https://developer.okta.com/blog/2019/08/22/okta-authjs-pkce), which would otherwise need to be loaded to complete the authentication process, and it helps prevent attacks such as [man-in-the-middle](https://datatracker.ietf.org/doc/html/rfc7636).

The first part of this post describes how to configure the OIDC provider (in this case, Auth0). Then, it proceeds to specify how to configure the Kubernetes cluster in various providers, followed by instructions on how to configure kubelogin on the client side. Finally, it addresses possible issues, errors, and additional configurations.

## OIDC Provider Configuration

Auth0 is the chosen authentication and authorization platform in this case to manage access to the Kubernetes cluster.

## Installation of the Auth0 OIDC Client

To authenticate with Auth0 using [LDAP](https://auth0.com/docs/connections/enterprise/active-directory-ldap), we need to install the Auth0 client on AD. It is also possible to configure it with [Azure AD](https://auth0.com/docs/connections/enterprise/azure-active-directory/v2), as well as other [connectors](https://auth0.com/docs/connections).

## Configuration of the Application in Auth0

We need to create an [application](https://auth0.com/docs/get-started/create-apps) in Auth0. In this case, we create a Machine to Machine application.
Firstly, we need to ensure that the Token Endpoint Authentication Method is set to None. This ensures that the client does not authenticate using the secret, thus avoiding the distribution of this information to all clients.

![auth0-config-1](/assets/images/23-06-18-auth0-config-1.png)

In the Application URIs section, fill in the fields Allowed Callback URLs, Allowed Logout URLs, and Allowed Web Origins with http://localhost:4040 and http://localhost:14040, as those are the ports used by Kubelogin. The remaining parameters can be filled in according to your preference. It is important to note that you can configure other ports as well. The three mentioned fields should be completed as follows. The default port in kubelogin is 8000 but we recommend use a distinct one. However, if you want to use 8000 you could skip the line referring to port 4040 later, just don't write it in the terminal and set up this port in Auth0 application callbacks URLs.

**Allowed Callbacks URLs (in Auth0)**
```config
http://localhost:4040,
http://localhost:14040
```

Before moving on to the next section, we need to save some parameters related to the basic configuration of the application that we will need later: *Domain, Client ID, and Client Secret*.

## Auth0 Rules Configuration

We need to create a [rule](https://auth0.com/docs/rules/create-rules) in Auth0 to retrieve additional information from the JWT that is not returned by default, such as the user's nickname or the groups they belong to in AD. Although Auth0 captures this information, it won't be returned unless specified in the rule. To view all the information collected from AD by Auth0, you can check the [Raw JSON](https://auth0.com/docs/users/view-user-details) after a user authenticates.

Create a rule specifying the Application ID, or else the rule will affect all connections.

Additionally, a [namespace](https://auth0.com/docs/security/tokens/json-web-tokens/create-namespaced-custom-claims) must be defined for the custom claim. It has some restrictions, such as starting with *http://* or *https://*. In this case, we will use *http://localhost/*, but it can have any name.

In this case, it will retrieve the groups from the JWT and display them as *http://localhost/ad_groups*, and the AD user's nickname as *http://localhost/ad_username*. This is especially important in the Kubernetes OIDC configuration.

All the data that Kubelogin brings with the JWT extracted from Auth0 using this configuration can be seen in this part of the document.

```js
function (user, context, callback) {
    // list of allowed clients ID for add custom claims to the jwt response
    allowedClientIDs = ['APP_CLIENT_ID1', 'APP_CLIENT_ID2'];
    
    if allowedClientIDs.includes(context.clientID) {
        var namespace = 'http://localhost/';
        
        if (user.groups) {
            context.idToken[namespace + 'ad_groups'] = user.groups;
            context.idToken[namespace + 'ad_username'] = user.nickname;
        }
    }

    callback(null, user, context);
}
```

## Kubelogin Installation

Kubelogin can be installed in different ways depending on the operating system. This section outlines how to install the tool using package managers for kubectl. For more information, you can visit the project's code [repository](https://github.com/int128/kubelogin). It supports the following configuration [options](https://github.com/int128/kubelogin/blob/master/docs/usage.md).
Package Managers
Kubelogin can be installed using [Homebrew](https://brew.sh/), [Krew](https://github.com/kubernetes-sigs/krew), [Chocolatey](https://chocolatey.org/packages/kubelogin), or [GitHub Releases](https://github.com/int128/kubelogin/releases).
```bash
# Homebrew (macOS and Linux)
brew install int128/kubelogin/kubelogin

# Krew (macOS, Linux, Windows and ARM)
kubectl krew install oidc-login

# Chocolatey (Windows)
choco install kubelogin
```

If you choose to install it using Krew, you need to follow the quickstart guide on the official website. You may need to set it as an environment variable.

```bash
export PATH="${KREW_ROOT:-$HOME/.krew}/bin:$PATH"
```

Regardless of the installation method, you will need to configure the following OIDC provider data, in this case, Auth0. You can define them as environment variables.

```bash
export ISSUER_URL=https://domain.auth0.com/
export CLIENT_ID=APP_CLIENT_ID
```

## Kubernetes OIDC in Minikube
For testing purposes on bare metal, authentication can be performed through Minikube. The main configurations are done in the Kubernetes API Server, which is configured during Minikube launch.

Additionally, audit logs are configured.

```bash
minikube start  --extra-config=apiserver.authorization-mode=RBAC,Node \
--extra-config=apiserver.oidc-issuer-url=$ISSUER_URL \
--extra-config=apiserver.oidc-client-id=$CLIENT_ID \
--extra-config=apiserver.oidc-username-claim="http://localhost/ad_username" \
--extra-config=apiserver.oidc-groups-claim="http://localhost/ad_groups" \
--extra-config=apiserver.audit-policy-file=/etc/ssl/certs/audit-policy.yaml \
--extra-config=apiserver.audit-log-path=-
```
To view audit logs in Minikube, execute:
```bash
kubectl logs kube-apiserver-minikube -n kube-system
```

## Permissions in the Cluster

Permissions can be defined in the cluster using [Role-Based Access Control (RBAC)](https://kubernetes.io/docs/reference/access-authn-authz/rbac/), granting specific privileges to groups that users belong to. These groups are obtained from AD (Active Directory). You can lear more about RBAC in this [link](https://kubernetes.io/docs/reference/access-authn-authz/rbac/).

Examples of permissions:
```bash
kubectl create clusterrolebinding oidc-cluster-admin --clusterrole=cluster-admin --group=AD_GROUP
```
Alternatively, the same permissions can be defined in an *oidc-cluster-admin-by-group.yaml* file.
```yaml
kind: ClusterRoleBinding
apiVersion: rbac.authorization.k8s.io/v1
metadata:
 name: oidc-cluster-admin
roleRef:
 apiGroup: rbac.authorization.k8s.io
 kind: ClusterRole
 name: cluster-admin
subjects:
- kind: Group
 name: AD_GROUP
```
## Connecting to the Cluster via OIDC
Once the Kubernetes API Server is configured with OIDC, Kubelogin is installed, and permissions are assigned to groups in the cluster, a user can connect to the cluster using their AD user. To do this, we need to authenticate with this tool using the following commands.
```bash
kubectl oidc-login setup \
--oidc-issuer-url=$ISSUER_URL \
--oidc-client-id=$CLIENT_ID \
--oidc-use-pkce \
--listen-address=localhost:4040
```
Once authenticated through our OIDC provider, we need to execute the following commands to configure the **$HOME/.kube/config** file with the necessary parameters so that the defined user is granted the appropriate authorization in the cluster.
```bash
kubectl config set-credentials USERNAME \
        --exec-api-version=client.authentication.k8s.io/v1beta1 \
        --exec-command=kubectl \
        --exec-arg=oidc-login \
        --exec-arg=get-token \
        --exec-arg=--oidc-issuer-url=$ISSUER_URL \
        --exec-arg=--oidc-client-id=$CLIENT_ID \
        --exec-arg=--oidc-use-pkce \
        --exec-arg=--listen-address=localhost:4040

```
It is also possible to use the [Resource Owned Passwords flow](https://github.com/int128/kubelogin/blob/master/docs/usage.md#resource-owner-password-credentials-grant-flow), which allows authentication without displaying the browser prompt. However, it is important to note that this method is not considered secure enough for most use cases. It is recommended to use other authentication flows, such as the Authorization Code flow or PKCE, which provide better security and protection against potential threats.

### Additional Notes
In the **USERNAME** field, you can specify any name, but it will only be the user we use with kubectl, as the permissions will be granted based on the user we authenticate with in the OIDC provider.

## Command Execution
After completing all the previous steps, we can execute kubectl commands based on the permissions assigned to the group or user in the cluster. Depending on the permissions, we may or may not receive a response. For example:
```bash
kubectl get nodes --user=USERNAME
```
To avoid specifying the user in each command, we can change the execution context to our user's context.
```bash
kubectl config set-context --current --user=USERNAME
```

# What's next?

In the following posts, I will show how to configure OIDC in AWS and GCP. For now, I want to make sure the idea is clear.
---
layout: post
title:  "Setup OIDC in Kubernetes clusters - Minikube"
date:   2023-06-18 17:00:02 -0300
categories: kubernetes authentication authorization
---
The first part of this post describes how to configure the OIDC provider on Minikube. Then, it proceeds to specify how to configure the Kubernetes cluster in various providers, followed by instructions on how to configure kubelogin on the client side. Finally, it addresses possible issues, errors, and additional configurations.

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
export ISSUER_URL=YOUR_ISSUER_URL
export CLIENT_ID=APP_CLIENT_ID
```

## Kubernetes OIDC in Minikube
For testing purposes on bare metal, authentication can be performed through Minikube. The main configurations are done in the Kubernetes API Server, which is configured during Minikube launch.

Additionally, audit logs are configured.

```bash
minikube start  --extra-config=apiserver.authorization-mode=RBAC,Node \
--extra-config=apiserver.oidc-issuer-url=$ISSUER_URL \
--extra-config=apiserver.oidc-client-id=$CLIENT_ID \
--extra-config=apiserver.oidc-username-claim=$YOUR_USERNAME_CLAIM \
--extra-config=apiserver.oidc-groups-claim=$YOUR_GROUP_CLAIM \
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
 name: oidc-cluster-reader
roleRef:
 apiGroup: rbac.authorization.k8s.io
 kind: ClusterRole
 name: read-only
subjects:
- kind: Group
 name: AD_GROUP
```
In [previous post]({{ site.baseurl }}{% link _posts/2023-06-17-authentication-authorization-methods.md %}) we discuss about authentication and authorization. In this opportunity we will talk about this concepts in kubernetes. All this actions modify your kubeconfig file.

## Connecting to the Cluster via OIDC
Once the Kubernetes API Server is configured with OIDC, Kubelogin is installed, and permissions are assigned to groups in the cluster, a user can connect to the cluster using their AD user. To do this, we need to authenticate with this tool using the following commands.
```bash
kubectl oidc-login setup \
--oidc-issuer-url=$ISSUER_URL \
--oidc-client-id=$CLIENT_ID \
--oidc-use-pkce \
--listen-address=YOUR_SERVER:YOUR_PORT
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
        --exec-arg=--listen-address=YOUR_SERVER:YOUR_PORT

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
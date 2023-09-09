---
layout: post
title:  "Setup OIDC in Kubernetes clusters - EKS"
date:   2023-06-19 18:34:00 -0300
categories: kubernetes authentication authorization eks
---
In [previous post]({{ site.baseurl }}{% link _posts/2023-06-18-setup-oidc-in-minikube.md %}) we discuss about authentication and authorization with an external provider and minikube, now I want to explain how to use this mechanism but on AWS.

## Requirements

You will need configure a external IdP provider.

This works even if the cluster is private (which is recommended). You only need access to the VPC where the cluster resides, and you can even access it via VPN.

Ensure that your security group configurations allow connections on port 443 (HTTPS) and have the source set to the IP range you are using to reach the cluster. This will enable secure communication to the cluster.

## OIDC with eksctl in EKS cluster

AWS uses the [EKS](https://aws.amazon.com/eks/?nc1=h_ls) service for Kubernetes. [OIDC in EKS](https://docs.aws.amazon.com/eks/latest/userguide/authenticate-oidc-identity-provider.html) can be configured through the console or the command line.
We can create the *associate-identity-provider.yaml* file.
```yaml
---
apiVersion: eksctl.io/v1alpha5
kind: ClusterConfig

metadata:
 name: clustername
 region: us-east-1

identityProviders:
 - name: CUSTOM_NAME
   type: oidc
   issuerUrl: ISSUER_URL
   clientId: CLIENT_ID
   usernameClaim: YOUR_USERNAME_CLAIM
   groupsClaim: YOUR_GROUP_CLAIM
```
then execute
```bash
eksctl associate identityprovider -f associate-identity-provider.yaml
```
The application of these changes may take a considerable amount of time.

## OIDC EKS with terraform files

You can use the terraform registry for [AWS EKS](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/eks_cluster) to setup the cluster.

Setup the variables as:
```js
variable "cluster_name" {
  type        = string
  description = "EKS Cluster Name"
}

variable "client_id" {
  type        = string
  description = "Client ID for the OpenID Connect identity provider"
}

variable "identity_provider_config_name" {
  type        = string
  description = "The name of the identity provider config"
}

variable "issuer_url" {
  type        = string
  description = "Issuer URL for the OpenID Connect identity provider"
}

variable "username_claim" {
  type        = string
  description = "The JWT claim that the provider will use as the username"
}

variable "groups_claim" {
  type        = string
  description = "The JWT claim that the provider will use to return groups"
}
```
after that, you can define the variable values on *tfvars* file.

Setup the OIDC provider
```js
resource "aws_eks_identity_provider_config" "oidc" {
  cluster_name = var.cluster_name
  oidc {
    client_id                     = var.client_id
    identity_provider_config_name = var.identity_provider_config_name
    issuer_url                    = var.issuer_url
    username_claim                = var.username_claim
    groups_claim                  = var.groups_claim
  }
  timeouts {
    create = "1h"
    delete = "1h"
  }
}
```

## Kubernetes RBAC configuration

Permissions example:

```js
resource "kubernetes_cluster_role_binding" "my_role_binding" {
  metadata {
    name = "readrolebinding"
  }
  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "ClusterRole"
    name      = "read-only"
  }
  subject {
    kind = "Group"
    name = "YOUR_DOMAIN_GROUP"
  }
}
```

You can lear more about RBAC in this [link](https://kubernetes.io/docs/reference/access-authn-authz/rbac/). Additionally, you can lear more about authorization in this [link](https://kubernetes.io/docs/reference/access-authn-authz/rbac/).

# Cluster connection via OIDC
You can use some tools like [kubelogin](https://github.com/int128/kubelogin) explained in the [post of minikube]({{ site.baseurl }}{% link _posts/2023-06-18-setup-oidc-in-minikube.md %}).

# What’s next?

In the next and last part of configuring OIDC in kubernetes we will quickly show how you can configure it in GCP for GKE.
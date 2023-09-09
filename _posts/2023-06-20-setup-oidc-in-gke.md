---
layout: post
title:  "Setup OIDC in Kubernetes clusters - GKE"
date:   2023-06-20 20:43:00 -0300
categories: kubernetes authentication authorization gke
---
In this post we will discuss how to setup OIDC in GKE clusters, in previous post we discuss about [Kubernetes OIDC]({{ site.baseurl }}{% link _posts/2023-06-19-setup-oidc-in-eks.md %}) and the configuration on [EKS]({{ site.baseurl }}{% link _posts/2023-06-19-setup-oidc-in-eks.md %}).


## OIDC in GKE

GCP uses the [GKE](https://cloud.google.com/kubernetes-engine?utm_source=google&utm_medium=cpc&utm_campaign=latam-AR-all-es-dr-BKWS-all-all-trial-b-dr-1605194-LUAC0020050&utm_content=text-ad-none-any-DEV_c-CRE_649255871171-ADGP_Hybrid%20%7C%20BKWS%20-%20BRO%20%7C%20Txt%20~%20Containers_Kubernetes-KWID_43700075321154573-kwd-336266607510&utm_term=KW_google%20kubernetes%20engine-ST_google%20kubernetes%20engine&gclid=Cj0KCQjw1rqkBhCTARIsAAHz7K10ipu1znNMlga_NTMGgnlDLZ0Jxsff3Ki6rIUALkW2EXHF_fJeEGsaAo9TEALw_wcB&gclsrc=aw.ds) service for Kubernetes. 

You can use the [terraform registry](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/container_cluster) for GKE to setup the cluster.

After starting:
* At this moment, this configuration does not have a specific resource in the official registry for GKE.
* This configuration generates a new ingress for authentication.
* Enabled the Google Kubernetes Engine API. You can follow this [steps](https://cloud.google.com/kubernetes-engine/docs/deploy-app-cluster).

## Associate an OIDC identity provider

Before you start, make sure you have enabled the Google Kubernetes Engine API.
You can enable the Identity Service for GKE on a new cluster with:
```bash
gcloud container clusters create CLUSTER_NAME \
--enable-identity-service
```
Replace CLUSTER_NAME with the name of your new cluster.

Enable Identity Service for GKE on an existing cluster:
```bash
gcloud container clusters update CLUSTER_NAME \
--enable-identity-service
```
Replace CLUSTER_NAME with the name of your new cluster.

These changes may take a significant amount of time to apply.

## Configure Identity Service for GKE
1. Download the default ClientConfig from your cluster:
```bash
kubectl get clientconfig default -n kube-public -o yaml > client-config.yaml
```
2. Update the spec.authentication section with your preferred settings:
```yaml
apiVersion: authentication.gke.io/v2alpha1
  kind: ClientConfig
  metadata:
    name: default
    namespace: kube-public
  spec:
      clientID: APP_CLIENT_ID
      cloudConsoleRedirectURI: https://console.cloud.google.com/kubernetes/oidc
      groupsClaim: YOUR_GROUPS_CLAIM
      issuerURI: YOUR_ISSUER_URI
      kubectlRedirectURI: YOUR_REDIRECT_URL
      scopes: offline_access,email,profile,groups
      userClaim: YOUT_USER_CLAIM
```

Visit this [link](https://cloud.google.com/kubernetes-engine/docs/how-to/oidc#configuring_on_a_cluster) for more details related to the configuration.

3. Apply the updated configuration:
```bash
kubectl apply -f client-config.yaml
```
After you apply this configuration, Identity Service for GKE runs inside your cluster and serves requests behind the gke-oidc-envoy load balancer. The IP address in the spec.server field must be the IP address of the load balancer. If you change the spec.server field, kubectl commands might fail.
4. Make a copy of the client-config.yaml configuration file:
```bash
cp client-config.yaml login-config.yaml
```

## Log in and authenticate to the cluster
You can use the google cloud CLI or [kubelogin]({{ site.baseurl }}{% link _posts/2023-06-18-setup-oidc-in-minikube.md %}).

1. Download the login-config.yaml file provided by your administrator.

2. Install the Google Cloud CLI SDK, which offers a separate OIDC component. You can install this by running the following command:
```bash
gcloud components install kubectl-oidc
```
3. Authenticate into your cluster:
```bash
kubectl oidc login --cluster=CLUSTER_NAME --login-config=login-config.yaml
```
4. After you are authenticated, you can run kubectl commands, for example:
```bash
kubectl --user=oidc get nodes
```

The connection mechanism is the same as discussed in Part I and Part II. You'll need to configure RBAC too.

# What's next?

In future posts, we may be able to use the Kubernetes API with OIDC authentication for querying purposes. But for now, that's all, folks!
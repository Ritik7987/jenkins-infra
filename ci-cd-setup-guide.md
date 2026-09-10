# Jenkins CI/CD Pipeline Guide

This guide explains the standard Continuous Integration (CI) and Continuous Deployment (CD) setup used across our projects using Jenkins Shared Libraries.

## 1. Architecture Overview

We use a **Jenkins Shared Library** (`jenkins-infra`) to centralize our pipeline logic. This ensures all projects follow the exact same build, push, and deployment standards without duplicating code.

Our pipeline is split into two completely separate flows:
*   **CI Pipeline (Automatic):** Triggered automatically when code is pushed or a Pull Request is updated. It runs tests, builds a Docker image, tags it with the Git commit hash, and pushes it to DockerHub.
*   **CD Pipeline (Manual PR Trigger):** Triggered manually by a developer commenting **`DEPLOY`** on a Pull Request. It skips the CI build steps and directly deploys the recently built Docker image to Kubernetes using Helm.

---

## 2. Onboarding a New Project

To onboard a new application to this CI/CD setup, you must meet three requirements in your repository:

1.  **Dockerfile:** Your app must have a valid `Dockerfile`.
2.  **Helm Chart:** Your app must have a Helm chart located at `<app_path>/helm/<app_name>` (e.g., `frontend/helm/frontend`).
3.  **Jenkinsfile:** You must create a file named `Jenkinsfile.infra` at the root of your repository.

### Example `Jenkinsfile.infra`

```groovy
@Library('jenkins-infra') _

// Global Pipeline Configuration
def pipelineConfig = [
    domainWith: "subdomain"
]

// Application Specific Configuration
def pipelineApps = [
    [
        reactJs: [
            path: "frontend",       // The folder containing the app & Dockerfile
            node_version: "24",     // Node version for CI build
            namespace: "default"    // Kubernetes namespace for deployment
        ]
    ]
]

// Determine if this is a CD deployment triggered by a PR comment
def causesString = currentBuild.buildCauses.toString()
def isCdTrigger = env.CHANGE_ID && causesString.contains('"commentBody":"DEPLOY"')

if (isCdTrigger) {
    echo "✅ CD Trigger Detected! Running CD Pipeline..."
    cdPipeline(
        config: pipelineConfig,
        apps: pipelineApps
    )
} else {
    echo "🚀 Standard Trigger Detected. Running CI Pipeline..."
    multipleFolderBuild(
        config: pipelineConfig,
        apps: pipelineApps
    )
}
```

---

## 3. How to Trigger Deployments (CD)

Once your Pull Request is open, Jenkins will automatically run the **CI Pipeline** to build your Docker image. 

To deploy this image to the Kubernetes cluster to test your changes:
1. Go to your Pull Request on GitHub.
2. Leave a comment containing exactly the word: **`DEPLOY`**
3. Jenkins will instantly detect the comment, read the Git Commit hash of the PR, locate your previously built Docker image, and deploy it to Kubernetes using your Helm chart.

---

## 4. Administrator Setup Guide

If you are setting up this Jenkins server from scratch, you will need to configure the following plugins and credentials.

### Required Jenkins Plugins
*   **Pipeline** & **Multibranch Pipeline:** Core pipeline execution.
*   **Docker Pipeline:** Allows Jenkins to run steps inside Docker containers (e.g., `withDockerContainer`).
*   **GitHub Branch Source Plugin:** Connects Jenkins to GitHub Organizations and Repositories.
*   **GitHub PR Comment Build Plugin:** (Allows Jenkins to listen for the `DEPLOY` comment on Pull Requests).

### Required Credentials
Navigate to **Manage Jenkins -> Credentials -> System -> Global credentials** and add the following:

1.  **`dockerhub-credentials`** (Type: Username with password)
    *   Used to push images to the Docker registry.
2.  **`kubeconfig-k8s`** (Type: Secret file)
    *   Your cluster's `kubeconfig` file.
    *   **Crucial Note for Local Clusters (Docker Desktop/Kind):** If Jenkins is running inside a Docker container on your local machine, it cannot use `127.0.0.1` to connect to your local Kubernetes cluster. You must copy your `kubeconfig`, delete the `certificate-authority-data` line, add `insecure-skip-tls-verify: true`, and change the server URL to the internal Docker network name (e.g., `server: https://kind-cluster-control-plane:6443`). Upload this modified copy to Jenkins.

### Pipeline Dependencies (Docker Images)
Jenkins relies on these public Docker images to run pipeline steps. Ensure Jenkins has internet access to pull them:
*   `node:<version>-slim` (Used for CI building)
*   `dtzar/helm-kubectl:3.16.0` (Used for CD Helm deployment)

### GitHub PR Comment Trigger Job Setup
To ensure Jenkins listens for the `DEPLOY` comment, configure your Jenkins Job (Multibranch Pipeline or Organization Folder) as follows:

1. **Install Plugin:** Ensure the **GitHub PR Comment Build** plugin is installed in Manage Jenkins.
2. **Job Configuration:** Go to your Multibranch Pipeline and click **Configure**.
3. **Build Strategies:** Scroll down to the **Build Strategies** section under your Branch Sources.
4. **Add Strategy:** Click **Add** and select the strategy for matching PR comments (usually labeled **Comment Pattern** or **Regular expressions for pull request comments**).
5. **Set Regex:** Enter `^DEPLOY$` (or simply `DEPLOY`) as the regular expression to match.
6. **GitHub Webhooks:** Ensure your GitHub repository or organization webhook is configured to send **Issue comments** events to Jenkins, otherwise Jenkins will never receive the comment notifications!

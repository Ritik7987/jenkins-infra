def call(Map args = [:]) {

    def config = args.config ?: [:]
    def path = config.path ?: '.'
    def tag = config.tag
    if (!tag) {
        try {
            tag = sh(script: 'git rev-parse HEAD', returnStdout: true).trim()
        } catch (Exception e) {
            tag = env.BUILD_NUMBER
        }
    }

    def jobTokens = env.JOB_NAME.tokenize('/')
    def rawRepoName = jobTokens.size() > 1 ? jobTokens[-2] : jobTokens[0]
    def repositoryName = rawRepoName.toLowerCase().replaceAll(/[^a-z0-9-_]/, '-')

    if (!repositoryName) {
        error "Unable to determine repository name from JOB_NAME"
    }

    def applicationName = path == '.'
        ? repositoryName
        : path.tokenize('/').last()

    // Defaulting to the structure you specified: <app_path>/helm/<app_name>
    def helmChartPath = config.helmChartPath ?: (path == '.' ? "helm/${applicationName}" : "${path}/helm/${applicationName}")
    
    def imageName = "${repositoryName}-${applicationName}"
    def imageRepository = "ritikkumawat123/${imageName}"
    
    def releaseName = "${applicationName}"
    def namespace = config.namespace ?: "default"

    stage("Deploy Helm Canary - ${applicationName}") {

        echo "========================================"
        echo "Deploying Helm Canary"
        echo "========================================"
        echo "Repository: ${repositoryName}"
        echo "Application: ${applicationName}"
        echo "Chart Path: ${helmChartPath}"
        echo "Image: ${imageRepository}:${tag}"
        echo "Release Name: ${releaseName}"
        echo "Namespace: ${namespace}"
        echo "========================================"

        // Using kubeconfig credentials (to be created manually as 'kubeconfig-k8s')
        withCredentials([file(credentialsId: 'kubeconfig-k8s', variable: 'KUBECONFIG')]) {
            sh """
                helm upgrade --install ${releaseName} ${helmChartPath} \
                    --namespace ${namespace} \
                    --set image.repository=${imageRepository} \
                    --set image.tag=${tag}
            """
        }
    }
}

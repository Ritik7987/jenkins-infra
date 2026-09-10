def call(Map args = [:]) {

    def config = args.config ?: [:]
    def path = config.path ?: '.'
    def tag = config.tag ?: (env.GIT_COMMIT ?: env.BUILD_NUMBER)

    def repositoryName = env.JOB_NAME.tokenize('/')[1] ?: env.JOB_NAME

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

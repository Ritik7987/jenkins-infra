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

    def imageName = "${repositoryName}-${applicationName}"
    def fullImage = "ritikkumawat123/${imageName}:${tag}"

    stage("Docker Build - ${applicationName}") {

        echo "========================================"
        echo "Docker Build"
        echo "========================================"
        echo "Repository: ${repositoryName}"
        echo "Path: ${path}"
        echo "Image: ${fullImage}"
        echo "========================================"

        dir(path) {

            sh """
                docker build \
                    -t ${fullImage} \
                    .
            """
        }
    }

    stage("Docker Push - ${applicationName}") {

        echo "========================================"
        echo "Docker Push"
        echo "========================================"
        echo "Image: ${fullImage}"
        echo "========================================"

        withCredentials([
            usernamePassword(
                credentialsId: 'dockerhub-credentials',
                usernameVariable: 'DOCKER_USERNAME',
                passwordVariable: 'DOCKER_PASSWORD'
            )
        ]) {

            sh '''
                echo "$DOCKER_PASSWORD" | docker login \
                    --username "$DOCKER_USERNAME" \
                    --password-stdin
            '''

            sh """
                docker push ${fullImage}
            """

            sh 'docker logout'
        }
    }
}
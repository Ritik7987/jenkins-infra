def call(Map args = [:]) {

    def config = args.config ?: [:]

    def path = config.path ?: '.'
    def tag = config.tag ?: (env.GIT_COMMIT ?: env.BUILD_NUMBER)

    def repositoryName = env.JOB_NAME.tokenize('/')[1]

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
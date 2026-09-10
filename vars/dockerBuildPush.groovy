def call(Map args = [:]) {

    def config = args.config ?: [:]

    def path = config.path ?: '.'
    def imageName = config.image ?: 'app'
    def tag = config.tag ?: env.BUILD_NUMBER

    def fullImage = "ritikkumawat123/${imageName}:${tag}"

    stage("Docker Build - ${path}") {

        echo "========================================"
        echo "Docker Build"
        echo "========================================"
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

    stage("Docker Push") {

        echo "========================================"
        echo "Docker Push"
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
                    -u "$DOCKER_USERNAME" \
                    --password-stdin
            '''

            sh """
                docker push ${fullImage}
            """

            sh 'docker logout'
        }
    }
}
def call(Map args = [:]) {

def config = args.config ?: [:]

def path = config.path ?: '.'
def nodeVersion = config.node_version ?: '24'

stage("React - ${path}") {

    echo "========================================"
    echo "React Application"
    echo "========================================"
    echo "Path: ${path}"
    echo "Node version: ${nodeVersion}"
    echo "========================================"

    dir(path) {

        docker.image("node:${nodeVersion}-slim").inside {

            echo "Node version:"
            sh 'node --version'

            echo "NPM version:"
            sh 'npm --version'

            echo "Installing dependencies..."

            sh '''
                npm ci
            '''

            echo "Building React application..."

            sh '''
                npm run build
            '''
        }
    }
}

}

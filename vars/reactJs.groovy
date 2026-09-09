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

        dir(path) {

            echo "Installing dependencies..."

            sh '''
                node --version
                npm --version
                npm install
            '''

            echo "Building React application..."

            sh '''
                npm run build
            '''
        }
    }
}
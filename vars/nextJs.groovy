def call(Map args = [:]) {

    def config = args.config ?: [:]

    def path = config.path ?: '.'
    def nodeVersion = config.node_version ?: '24'

    stage("Next.js - ${path}") {

        echo "========================================"
        echo "Next.js Application"
        echo "========================================"
        echo "Path: ${path}"
        echo "Node version: ${nodeVersion}"
        echo "========================================"

        dir(path) {

            docker.image("node:${nodeVersion}-slim").inside {

                withEnv([]) {

                    echo "Node version:"
                    sh 'node --version'

                    echo "NPM version:"
                    sh 'npm --version'

                    echo "Installing dependencies..."

                    sh '''
                        npm install
                    '''

                    echo "Building Next.js application..."

                    sh '''
                        npm run build
                    '''
                }
            }
        }
    }
}

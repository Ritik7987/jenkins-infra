def call(Map args = [:]) {

    def config = args.config ?: [:]

    def path = config.path ?: '.'
    def nodeVersion = config.node_version ?: '24'
    def nodeOptions = config.node_options ?: '--max-old-space-size=4096'

    stage("React - ${path}") {

        echo "========================================"
        echo "React Application"
        echo "========================================"
        echo "Path: ${path}"
        echo "Node version: ${nodeVersion}"
        echo "Node options: ${nodeOptions}"
        echo "========================================"

        dir(path) {

            docker.image("node:${nodeVersion}-slim").inside {

                withEnv([
                    "NODE_OPTIONS=${nodeOptions}"
                ]) {

                    echo "Node version:"
                    sh 'node --version'

                    echo "NPM version:"
                    sh 'npm --version'

                    echo "Node memory configuration:"
                    sh 'node -e "console.log(require(\'v8\').getHeapStatistics().heap_size_limit / 1024 / 1024 + \' MB\')"'

                    echo "Installing dependencies..."

                    sh '''
                        npm install
                    '''

                    echo "Building React application..."

                    sh '''
                        npm run build
                    '''
                }
            }
        }
    }
}
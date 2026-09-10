def call(Map args = [:]) {

```
def config = args.config ?: [:]

def path = config.path ?: '.'
def nodeVersion = config.node_version ?: '24'
def unitTest = config.containsKey('unitTest') ? config.unitTest : true

stage("Node.js - ${path}") {

    echo "========================================"
    echo "Node.js Application"
    echo "========================================"
    echo "Path: ${path}"
    echo "Node version: ${nodeVersion}"
    echo "Unit tests: ${unitTest}"
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

            if (unitTest) {

                echo "Running unit tests..."

                sh '''
                    npm test
                '''
            }

            echo "Building Node.js application..."

            sh '''
                npm run build
            '''
        }
    }
}
```

}

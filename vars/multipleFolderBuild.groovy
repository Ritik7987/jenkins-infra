def call(Map args = [:]) {

    def config = args.config ?: [:]
    def apps   = args.apps ?: []

    node {

        echo "========================================"
        echo "Starting CI Pipeline"
        echo "========================================"

        echo "Domain: ${config.domainWith ?: 'not configured'}"
        echo "API Path: ${config.apiPath ?: 'not configured'}"

        echo "PR: ${env.CHANGE_ID ?: 'Not a PR'}"
        echo "Source Branch: ${env.CHANGE_BRANCH ?: 'Not available'}"
        echo "Target Branch: ${env.CHANGE_TARGET ?: 'Not available'}"

        stage('Checkout') {

            echo "Checking out application source code..."

            checkout scm

            echo "Workspace contents:"
            sh '''
                pwd
                ls -la
            '''
        }

        stage('CI') {

            apps.each { app ->

                if (app.nodeJs) {

                    nodeJs(
                        config: app.nodeJs
                    )
                }

                if (app.reactJs) {

                    reactJs(
                        config: app.reactJs
                    )
                }
            }
        }

        echo "========================================"
        echo "CI Pipeline Completed"
        echo "========================================"
    }
}
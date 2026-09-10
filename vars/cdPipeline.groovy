def call(Map args = [:]) {

    def config = args.config ?: [:]
    def apps = args.apps ?: []

    node {

        echo "========================================"
        echo "Starting CD Pipeline"
        echo "========================================"

        echo "Domain: ${config.domainWith ?: 'not configured'}"
        echo "API Path: ${config.apiPath ?: 'not configured'}"

        stage('Checkout') {

            echo "Checking out application source code..."

            checkout scm

            sh '''
                pwd
                ls -la
            '''
        }

        stage('CD (Helm Chart Deploy)') {

            apps.each { app ->

                // Ensure we pass the appropriate config map
                def appConfig = app.nodeJs ?: app.reactJs ?: app.nextJs
                if (appConfig) {
                    deployHelmCanary(
                        config: appConfig
                    )
                }
            }
        }

        echo "========================================"
        echo "CD Pipeline Completed"
        echo "========================================"
    }
}

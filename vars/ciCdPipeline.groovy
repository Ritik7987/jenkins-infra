def call(Map args = [:]) {

    def config = args.config ?: [:]
    def apps = args.apps ?: []

    def deployComment =
        env.GITHUB_COMMENT?.trim() == 'DEPLOY'

    if (deployComment) {

        echo "🚀 DEPLOY comment detected"

        cdPipeline(
            config: config,
            apps: apps
        )

    } else {

        echo "🔵 Normal CI trigger"

        multipleFolderBuild(
            config: config,
            apps: apps
        )
    }
}
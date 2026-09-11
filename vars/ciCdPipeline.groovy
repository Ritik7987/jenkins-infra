def call(Map args = [:]) {

    def config = args.config ?: [:]
    def apps = args.apps ?: []

    def causesString = currentBuild?.buildCauses?.toString() ?: ""

    def deployComment = 
        (env.CHANGE_ID && causesString.contains('"commentBody":"DEPLOY"')) ||
        (env.GITHUB_COMMENT?.trim() == 'DEPLOY') ||
        (env.ghprbCommentBody?.trim() == 'DEPLOY') ||
        (env.GITHUB_PR_COMMENT_BODY?.trim() == 'DEPLOY')

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
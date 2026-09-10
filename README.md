# Jenkins Infra Global Library

Reusable Jenkins Shared Library for standardizing CI/CD pipelines across applications.

The application repository only defines the application configuration, while the build/deployment logic is maintained centrally in this library.

---

## 1. Usage

Add the library to the Jenkinsfile:

```groovy
@Library('jenkins-infra')_

multipleFolderBuild(

    config: [
        domainWith: "subdomain",
    ],

    apps: [
        [
            reactJs: [
                path: "web",
                node_version: "24"
            ]
        ]
    ]
)
```

The application repository should contain configuration only. Build logic should remain inside this Global Library.

---

## 2. Supported Applications

Currently supported:

* React.js
* Node.js

More application types can be added as reusable library steps.

---

## 3. React.js

Configuration:

```groovy
reactJs: [
    path: "web",
    node_version: "24"
]
```

The library performs:

```text
Node.js environment
      ↓
npm ci
      ↓
npm run build
```

The Node.js version is selected from:

```groovy
node_version: "24"
```

For local Jenkins, the library currently runs the build using:

```text
node:24-slim
```

This keeps Node.js out of the Jenkins controller itself.

---

## 4. Node.js

Configuration:

```groovy
nodeJs: [
    path: "api",
    node_version: "24",
    unitTest: true
]
```

The library performs:

```text
Node.js environment
      ↓
npm ci
      ↓
npm test
      ↓
npm run build
```

`unitTest` is optional and defaults to:

```text
true
```

To disable tests:

```groovy
unitTest: false
```

---

## 5. Configuration

| Property       | Description            | Default |
| -------------- | ---------------------- | ------- |
| `path`         | Application directory  | `.`     |
| `node_version` | Node.js version        | `24`    |
| `unitTest`     | Run Node.js unit tests | `true`  |

---

## 6. Global Library Structure

```text
jenkins-infra/
├── vars/
│   ├── multipleFolderBuild.groovy
│   ├── reactJs.groovy
│   └── nodeJs.groovy
├── src/
└── README.md
```

Files under `vars/` are exposed as reusable Jenkins Pipeline steps.

For example:

```text
vars/reactJs.groovy
        ↓
reactJs(...)
```

---

# Production Usage

The **local Jenkins setup and production Jenkins setup are different**.

### Local

For local development, Jenkins uses Docker to create the Node.js build environment:

```text
Jenkins
   ↓
Docker
   ↓
node:24-slim
   ↓
npm ci / npm test / npm run build
```

This requires local Jenkins to have access to Docker.

### Production

Production Jenkins should **not depend on the local Docker socket setup**.

Instead, Jenkins should run builds on properly configured Jenkins agents/build agents.

For example:

```text
                    Jenkins Controller
                           |
                           v
                    Jenkins Agent
                           |
                           v
                 Node.js build environment
                           |
              +------------+------------+
              |                         |
           npm ci                    npm test
              |                         |
              +------------+------------+
                           |
                      npm run build
```

The production agent can provide Node.js through either:

1. A preconfigured Jenkins agent image containing Node.js.
2. A dedicated Node.js build agent.
3. A containerized Jenkins agent/pod, such as a Kubernetes-based agent.

The Global Library should remain independent of how the production agent is provisioned.

---

## Local vs Production

|                           | Local                                  | Production                    |
| ------------------------- | -------------------------------------- | ----------------------------- |
| Jenkins                   | Docker container                       | Jenkins infrastructure        |
| Build environment         | `node:<version>-slim` Docker container | Jenkins build agent/container |
| Docker socket             | Used locally                           | Not required by the library   |
| Node.js                   | Provided by build container            | Provided by build agent       |
| Global Library            | Same                                   | Same                          |
| Application configuration | Same                                   | Same                          |

The important design principle is:

> **The Global Library defines what needs to happen; the Jenkins agent infrastructure defines where/how it runs.**

Therefore, application repositories do not need different Jenkinsfiles for local and production. The same library configuration can be used in both environments.

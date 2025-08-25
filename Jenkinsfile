pipeline {
    agent any

    environment {
        REPOSITORY_USER = credentials('repository-user')
        REPOSITORY_NAME = 'sti-backend'
        DOCKER_CREDENTIALS_ID = 'docker-credentials'
        DISCORD_WEBHOOK = credentials('discord-webhook')
        WORKFLOW_FILE = 'Jenkinsfile'
        SSH_USERNAME = credentials('ssh-username-secret')
    }

    stages {
        stage('Init Variables') { 
            steps {
                script {
                    env.GIT_REPOSITORY = "${REPOSITORY_USER}/${REPOSITORY_NAME}"
                    env.GIT_REF = sh(script: 'git rev-parse --abbrev-ref HEAD', returnStdout: true).trim()
                    env.EVENT = 'PUSH'
                    env.COMMIT_SHA = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
                    env.COMMIT_MESSAGE = sh(script: 'git log -1 --pretty=format:%s', returnStdout: true).trim()
                    env.TRIGGERED_BY = sh(script: 'git log -1 --pretty=format:%an', returnStdout: true).trim()
                    env.DATE = sh(script: 'date +"%m/%d/%Y %I:%M %p"', returnStdout: true).trim()
                }
            }
        }

    stage('Set Config per Branch') {
        steps {
            script {
                if (env.BRANCH_NAME == 'development') {
                    withCredentials([
                        string(credentialsId: 'docker-registry-staging', variable: 'REGISTRY'),
                        string(credentialsId: 'host-staging', variable: 'HOST')
                    ]) {
                        env.DOCKER_REGISTRY = REGISTRY
                        env.IMAGE_NAME = 'sti-dev-be'
                        env.SSH_CREDENTIALS = 'ssh-credentials-staging'
                        env.SSH_HOST = HOST
                        env.ENV_FILE_CRED = 'env-sti-dev-be'
                        env.VERSION_PREFIX = 'dev-version'
                        env.PORT_MAPPING = '5021:3000'
                        env.MOUNT_PATH = '/root/sti/asset-dev'
                    }
                }
                else if (env.BRANCH_NAME == 'staging') {
                withCredentials([
                    string(credentialsId: 'docker-registry-staging', variable: 'REGISTRY'),
                    string(credentialsId: 'host-staging', variable: 'HOST')
                ]) {
                    env.DOCKER_REGISTRY = REGISTRY
                    env.IMAGE_NAME = 'sti-staging-be'
                    env.SSH_CREDENTIALS = 'ssh-credentials-staging'
                    env.SSH_HOST = HOST
                    env.ENV_FILE_CRED = 'env-sti-staging-be'
                    env.VERSION_PREFIX = 'staging-version'
                    env.PORT_MAPPING = '5022:3000'
                    env.MOUNT_PATH = '/root/sti/asset-staging'
                }
                }
                else if (env.BRANCH_NAME == 'production') {
                    withCredentials([
                        string(credentialsId: 'docker-registry-production', variable: 'REGISTRY'),
                        string(credentialsId: 'host-production', variable: 'HOST')
                    ]) {
                        env.DOCKER_REGISTRY = REGISTRY
                        env.IMAGE_NAME = 'sti-be'
                        env.SSH_CREDENTIALS = 'ssh-credentials-prod'
                        env.SSH_HOST = HOST
                        env.ENV_FILE_CRED = 'env-sti-prod-be'
                        env.VERSION_PREFIX = 'prod-version'
                        env.PORT_MAPPING = '5021:3000'
                        env.MOUNT_PATH = '/root/sti/asset'
                    }
                }
                else if (env.BRANCH_NAME == 'main') {
                    withCredentials([
                        string(credentialsId: 'docker-registry-staging', variable: 'REGISTRY'),
                        string(credentialsId: 'host-demo', variable: 'HOST')
                    ]) {
                        env.DOCKER_REGISTRY = REGISTRY
                        env.IMAGE_NAME = 'sti-backend'
                        env.SSH_CREDENTIALS = 'ssh-credentials-demo'
                        env.SSH_HOST = HOST
                        env.ENV_FILE_CRED = 'env-sti-backend'
                        env.VERSION_PREFIX = 'demo-version'
                        env.PORT_MAPPING = '3005:3000'
                        env.MOUNT_PATH = '/root/data/api-sti'
                    }
                }
                else {
                    error "Branch '${env.BRANCH_NAME}' tidak dikenali!"
                }

                // ✅ Set IMAGE full path
                env.DOCKER_IMAGE = "${env.DOCKER_REGISTRY}/${env.IMAGE_NAME}"
            }
        }
    }

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Use .env file') {
            steps {
                withCredentials([file(credentialsId: "${env.ENV_FILE_CRED}", variable: 'ENV_FILE')]) {
                    sh '''
                        cp "$ENV_FILE" env.production
                    '''
                }
            }
        }

        stage('Get New Version') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: "${env.DOCKER_CREDENTIALS_ID}",
                    usernameVariable: 'DOCKER_CREDENTIALS_USR',
                    passwordVariable: 'DOCKER_CREDENTIALS_PSW'
                )]) {
                    script {
                        def lastVersion = sh(
                            script: '''#!/bin/bash
                                curl -u "$DOCKER_CREDENTIALS_USR:$DOCKER_CREDENTIALS_PSW" \
                                "https://${DOCKER_REGISTRY}/v2/${IMAGE_NAME}/tags/list" \
                                | jq -r ".tags[]" 2>/dev/null \
                                | grep "^${VERSION_PREFIX}" \
                                | sort -rV \
                                | head -n 1 || true
                            ''',
                            returnStdout: true
                        ).trim()

                        env.LAST_VERSION = lastVersion ?: "${env.VERSION_PREFIX}0"
                        def lastNumber = env.LAST_VERSION.replaceAll("^${env.VERSION_PREFIX}", '')
                        env.NEW_VERSION = "${env.VERSION_PREFIX}${(lastNumber as int) + 1}"

                        echo "Last version: ${env.LAST_VERSION}"
                        echo "New version: ${env.NEW_VERSION}"
                    }
                }
            }
        }

        stage('Build & Push Docker Image') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: "${env.DOCKER_CREDENTIALS_ID}",
                    usernameVariable: 'DOCKER_USERNAME',
                    passwordVariable: 'DOCKER_PASSWORD'
                )]) {
                    sh '''#!/bin/bash
                        docker build --no-cache -t "$DOCKER_IMAGE:$NEW_VERSION" -f prod.Dockerfile .
                        echo "$DOCKER_PASSWORD" | docker login "$DOCKER_REGISTRY" -u "$DOCKER_USERNAME" --password-stdin
                        docker push "$DOCKER_IMAGE:$NEW_VERSION"
                    '''
                }
            }
        }

        stage('Deploy Application') {
            steps {
                sshagent([env.SSH_CREDENTIALS]) {
                    withCredentials([usernamePassword(
                        credentialsId: "${env.DOCKER_CREDENTIALS_ID}",
                        usernameVariable: 'DOCKER_USERNAME',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )]) {
                        sh """
                            echo '
                            echo "$DOCKER_PASSWORD" | docker login "$DOCKER_REGISTRY" -u "$DOCKER_USERNAME" --password-stdin
                            docker rm -f "$IMAGE_NAME" || true
                            docker run -d -it --restart always -p "$PORT_MAPPING" -e TZ=Asia/Jakarta -v ${MOUNT_PATH}:/usr/src/app/src/public --name "$IMAGE_NAME" "$DOCKER_REGISTRY/$IMAGE_NAME:$NEW_VERSION"
                            docker images --filter=reference="$DOCKER_REGISTRY/$IMAGE_NAME:*" --format "{{.Repository}}:{{.Tag}}" | sort -rV | tail -n +3 | xargs -r docker rmi -f
                            ' | ssh -T -o StrictHostKeyChecking=no "$SSH_USERNAME@$SSH_HOST"
                        """
                    }
                }
            }
        }

        stage('Clean Old Tags (Keep 2)') {
            when {
                expression { return env.BRANCH_NAME in ["development", "staging", "production", "main"] }
            }
            steps {
                withCredentials([usernamePassword(
                    credentialsId: "${env.DOCKER_CREDENTIALS_ID}",
                    usernameVariable: 'DOCKER_CREDENTIALS_USR',
                    passwordVariable: 'DOCKER_CREDENTIALS_PSW'
                )]) {
                    script {
                        def limit = 2
                        echo "🔍 Mengambil daftar tag untuk ${IMAGE_NAME}..."

                        def tagsOutput = sh(
                            script: '''#!/bin/bash
                                curl -sSL -u "$DOCKER_CREDENTIALS_USR:$DOCKER_CREDENTIALS_PSW" \
                                "https://${DOCKER_REGISTRY}/v2/${IMAGE_NAME}/tags/list" \
                                | jq -r ".tags[]" \
                                | grep "^${BRANCH_NAME}-version" \
                                | sort -rV
                            ''',
                            returnStdout: true
                        ).trim()

                        def tags = tagsOutput ? tagsOutput.split('\n') : []
                        if (tags.size() <= limit) {
                            echo "✅ Tidak ada tag lama yang perlu dihapus. Total tag: ${tags.size()}"
                            return
                        }

                        def keepTags = tags.take(limit)
                        def deleteTags = tags.drop(limit)

                        echo "📌 Tags yang disimpan: ${keepTags}"
                        echo "🗑️ Tags yang dihapus: ${deleteTags}"

                        deleteTags.each { tag ->
                            def digest = sh(
                                script: """#!/bin/bash
                                    curl -sSL -u "$DOCKER_CREDENTIALS_USR:$DOCKER_CREDENTIALS_PSW" -I \
                                    -H 'Accept: application/vnd.docker.distribution.manifest.v2+json' \
                                    "https://${DOCKER_REGISTRY}/v2/${IMAGE_NAME}/manifests/${tag}" \
                                    | awk '/Docker-Content-Digest/ { print \$2 }' | tr -d '\\r'
                                """,
                                returnStdout: true
                            ).trim()

                            if (digest) {
                                echo "🗑️ Menghapus tag ${tag} (digest: ${digest})"
                                sh """#!/bin/bash
                                    curl -sSL -u "$DOCKER_CREDENTIALS_USR:$DOCKER_CREDENTIALS_PSW" -X DELETE \
                                    "https://${DOCKER_REGISTRY}/v2/${IMAGE_NAME}/manifests/${digest}"
                                """
                            } else {
                                echo "⚠️ Digest untuk tag ${tag} tidak ditemukan, skip."
                            }
                        }

                        // try {
                        //     echo "♻️ Menjalankan garbage collection registry..."
                        //     sh '''#!/bin/bash
                        //         docker exec -i instalasi-registry-1 registry garbage-collect -m /etc/docker/registry/config.yml || true
                        //     '''
                        // } catch (err) {
                        //     echo "ℹ️ GC dilewati (kemungkinan registry bukan self-hosted)."
                        // }
                        try {
                                echo "♻️ Menjalankan garbage collection registry..."
                                
                                // Tentukan nama container registry sesuai branch
                                def registryContainer = (env.BRANCH_NAME == 'production') ? 'docker-registry-registry-1' : 'instalasi-registry-1'
                                
                                sh """
                                    docker exec -i ${registryContainer} registry garbage-collect -m /etc/docker/registry/config.yml || true
                                """
                        } catch (err) {
                            echo "ℹ️ GC dilewati (kemungkinan registry bukan self-hosted)."
                        }

                    }
                }
            }
        }

        stage('Send Notification to Discord') {
            steps {
                withCredentials([string(credentialsId: 'discord-webhook', variable: 'DISCORD_WEBHOOK')]) {
                    script {
                        def payload = [
                            username: "Jenkins",
                            embeds: [[
                                title: "✅ Deployment STI BE --- ${env.BRANCH_NAME} Success",
                                description: "Done update STI BE --- ${env.BRANCH_NAME} ke ${env.NEW_VERSION}",
                                fields: [
                                    [name: "Repository", value: "${env.GIT_REPOSITORY}", inline: true],
                                    [name: "Ref", value: "${env.GIT_REF}", inline: true],
                                    [name: "Event", value: "${env.EVENT}", inline: true],
                                    [name: "Commit", value: "${env.COMMIT_SHA} ${env.COMMIT_MESSAGE}", inline: true],
                                    [name: "Triggered by", value: "${env.TRIGGERED_BY}", inline: true],
                                    [name: "Workflow", value: "${env.WORKFLOW_FILE}", inline: true],
                                    [name: "Date", value: "${env.DATE}", inline: true]
                                ],
                                color: 65280
                            ]]
                        ]
                        sh """#!/bin/bash
                            curl -X POST -H "Content-Type: application/json" \
                            -d '${groovy.json.JsonOutput.toJson(payload)}' \
                            "$DISCORD_WEBHOOK"
                        """
                    }
                }
            }
        }
    }
}

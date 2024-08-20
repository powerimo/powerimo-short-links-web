pipeline {
    environment {
        // Docker image name
        imagename = "docker-repo.andewil.com/powerimo/short-links-web"
        FULL_PATH_BRANCH = "${env.BRANCH_NAME}"
        GIT_BRANCH = "${env.BRANCH_NAME}".tokenize('/').last()

        // Notifications
        NSS_API_KEY = credentials('powerimo-nss-api-key')
    }

    tools {
        nodejs 'node20'
    }

    agent any

    stages {
        stage('Initialization') {
            steps {
                sh 'npm version'
                echo "MAJOR_VERSION=${env.MAJOR_VERSION}"
                echo "VERSION_NUM=${env.VERSION_NUM}"
                echo "FULL_PATH_BRANCH=${env.FULL_PATH_BRANCH}"
                echo "GIT_BRANCH=${env.GIT_BRANCH}"
                echo "BRANCH_NAME=${env.BRANCH_NAME}"
            }
        }

        stage('Update npm') {
            steps {
                sh 'npm install --location=global npm'
                sh 'npm install --location=global pnpm'
            }
        }

        stage('Update packages') {
            steps {
                sh 'pnpm install'
            }
        }

        stage('Build QA') {
            when {
                branch 'qa'
            }
            steps {
                sh 'pnpm build'
            }
        }

        stage('Image QA') {
            when {
                branch 'qa'
            }
            steps {
                sh 'docker build -t $imagename:qa .'
                sh 'docker push $imagename:qa'
            }
        }

        stage('Deploy QA') {
            when {
                branch 'qa'
            }
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: 'deployagent', keyFileVariable: 'SSH_I', passphraseVariable: '', usernameVariable: 'SSH_USER_NAME')]) {
                    sh 'ssh -o StrictHostKeyChecking=no -p 40220 -i $SSH_I $SSH_USER_NAME@qa.andewil.com ./bin/deploy-powerimo-sl-front-qa.sh'
                }
            }
        }

        stage('Build RELEASE') {
            when {
                expression { env.BRANCH_NAME ==~ /release\/[0-9]+\.[0-9]+\.[0-9]+/ }
            }
            steps {
                sh 'pnpm build'
            }
        }

        stage('Image RELEASE') {
            when {
                expression { env.BRANCH_NAME ==~ /release\/[0-9]+\.[0-9]+\.[0-9]+/ }
            }
            steps {
                sh 'chmod -R 777 ./dist/'
                sh 'docker build -t $imagename:${GIT_BRANCH} -t ${imagename}:latest .'
                sh 'docker push $imagename:${GIT_BRANCH}'
                sh 'docker push $imagename:latest'
            }
        }

        stage('Deploy RELEASE') {
            when {
                expression { env.BRANCH_NAME ==~ /release\/[0-9]+\.[0-9]+\.[0-9]+/ }
            }
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: 'deployagent', keyFileVariable: 'SSH_I', passphraseVariable: '', usernameVariable: 'SSH_USER_NAME')]) {
                    sh 'ssh -o StrictHostKeyChecking=no -p 40220 -i $SSH_I $SSH_USER_NAME@app.andewil.com ./bin/deploy-powerimo-sl-front-prod.sh'
                }
            }
        }
    }

    post {
        always {
            nssSendJobResult(recipients: "AndewilEventsChannel")
        }
    }
}

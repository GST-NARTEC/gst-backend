pipeline {
    agent any

    environment {
        ENV_FILE_PATH = "C:\\ProgramData\\Jenkins\\.jenkins\\jenkinsEnv\\GST\\gst-david-roosen"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scmGit(
                    branches: [[name: '*/david-roosen']], 
                    extensions: [], 
                    userRemoteConfigs: [[
                        credentialsId: 'Wasim-Jenkins-Credentials', 
                        url: 'https://github.com/GST-NARTEC/gst-backend.git'
                    ]]
                )
            }
        }

        stage('Setup Environment File') {
            steps {
                echo "Copying environment file to the backend..."
                bat "copy \"${ENV_FILE_PATH}\" \"%WORKSPACE%\\.env\""
            }
        }

        stage('Manage PM2 and Install Dependencies') {
            steps {
                script {
                    echo "Stopping PM2 process if running..."
                    def processStatus = bat(script: 'pm2 list', returnStdout: true).trim()
                    if (processStatus.contains('gst-david-roosen') || processStatus.contains('gst-david-roosen-workers')) {
                        bat 'pm2 stop gst-david-roosen gst-david-roosen-workers || exit 0'
                    }
                }
                echo "Installing dependencies for GST-DAVID-ROOSEN..."
                bat 'npm install'
                echo "Generating Prisma files..."
                bat 'npx prisma generate'
                echo "Restarting PM2 process..."
                bat 'pm2 restart gst-david-roosen gst-david-roosen-workers'
                echo "Restarting PM2 process... Done"
                bat 'pm2 save'
            }
        }
    }
}

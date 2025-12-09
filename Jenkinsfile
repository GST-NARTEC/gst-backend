pipeline {
    agent any

    environment {
        ENV_FILE_PATH = "C:\\Program Files\\Jenkins\\jenkinsEnv\\GST\\gst"
    }

    // options {
    //     buildDiscarder logRotator(artifactDaysToKeepStr: '', artifactNumToKeepStr: '5', daysToKeepStr: '', numToKeepStr: '5')
    // }


    stages {
        stage('Checkout') {
            steps {
                checkout scmGit(
                    branches: [[name: '*/main']], 
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
                    echo "Checking PM2 process status..."
                    def processStatus = bat(script: 'pm2 list', returnStdout: true).trim()
                    
                    def gstKsaExists = processStatus.contains('gst-ksa')
                    def gstKsaWorkersExists = processStatus.contains('gst-ksa-workers')
                    
                    if (gstKsaExists || gstKsaWorkersExists) {
                        echo "PM2 processes found. Stopping them..."
                        bat 'pm2 stop gst-ksa gst-ksa-workers || exit 0'
                    }
                }
                echo "Installing dependencies for GST-KSA..."
                bat 'npm install'
                echo "Generating Prisma files..."
                bat 'npx prisma generate'
                
                script {
                    echo "Checking if PM2 processes need to be started or restarted..."
                    def processStatus = bat(script: 'pm2 list', returnStdout: true).trim()
                    
                    def gstKsaExists = processStatus.contains('gst-ksa')
                    def gstKsaWorkersExists = processStatus.contains('gst-ksa-workers')
                    
                    if (gstKsaExists || gstKsaWorkersExists) {
                        echo "Restarting PM2 processes..."
                        bat 'pm2 restart gst-ksa gst-ksa-workers'
                    } else {
                        echo "Starting PM2 processes for the first time..."
                        bat 'pm2 start ecosystem.config.cjs'
                    }
                }
                
                echo "PM2 process management completed."
                bat 'pm2 save'
            }
        }
    }
}
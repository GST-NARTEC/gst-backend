pipeline {
    agent any

    environment {
        // Default values that will be overridden based on branch
        ENV_FILE_PATH = ""
        PM2_APP_NAME = ""
        PM2_WORKER_NAME = ""
    }

    stages {
        stage('Set Environment Variables') {
            steps {
                script {
                    // Set environment variables based on the branch
                    if (env.BRANCH_NAME == 'david-roosen') {
                        // Development environment
                        env.ENV_FILE_PATH = "C:\\ProgramData\\Jenkins\\.jenkins\\jenkinsEnv\\GST\\gst-david-roosen"
                        env.PM2_APP_NAME = "gst-david-roosen"
                        env.PM2_WORKER_NAME = "gst-workers-david-roosen"
                    } else if (env.BRANCH_NAME == 'main') {
                        // Production environment
                        env.ENV_FILE_PATH = "C:\\ProgramData\\Jenkins\\.jenkins\\jenkinsEnv\\GST\\gst"
                        env.PM2_APP_NAME = "gst"
                        env.PM2_WORKER_NAME = "gst-workers"
                    } else {
                        error "Unsupported branch: ${env.BRANCH_NAME}"
                    }
                    
                    echo "Deploying for branch: ${env.BRANCH_NAME}"
                    echo "Using environment file: ${env.ENV_FILE_PATH}"
                    echo "PM2 app name: ${env.PM2_APP_NAME}"
                }
            }
        }

        stage('Checkout') {
            steps {
                checkout scmGit(
                    branches: [[name: "*/${env.BRANCH_NAME}"]], 
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
                bat "copy \"${env.ENV_FILE_PATH}\" \"%WORKSPACE%\\.env\""
            }
        }

        stage('Manage PM2 and Install Dependencies') {
            steps {
                script {
                    echo "Stopping PM2 process if running..."
                    def processStatus = bat(script: 'pm2 list', returnStdout: true).trim()
                    
                    // Stop the specific PM2 processes for this branch
                    if (processStatus.contains("${env.PM2_APP_NAME}") || processStatus.contains("${env.PM2_WORKER_NAME}")) {
                        bat "pm2 stop ${env.PM2_APP_NAME} ${env.PM2_WORKER_NAME} || exit 0"
                        bat "pm2 delete ${env.PM2_APP_NAME} ${env.PM2_WORKER_NAME} || exit 0"
                    }
                    
                    echo "Installing dependencies for QMS..."
                    bat 'npm install'
                    
                    echo "Generating Prisma files..."
                    bat 'npx prisma generate'
                    
                    echo "Starting PM2 processes for ${env.BRANCH_NAME}..."
                    // Start the app with the branch-specific name
                    bat "pm2 start app.js --name ${env.PM2_APP_NAME}"
                    bat "pm2 start worker.js --name ${env.PM2_WORKER_NAME}"
                    
                    echo "Saving PM2 configuration..."
                    bat 'pm2 save'
                }
            }
        }
    }
    
    post {
        success {
            echo "Deployment of ${env.BRANCH_NAME} branch completed successfully!"
        }
        failure {
            echo "Deployment of ${env.BRANCH_NAME} branch failed!"
            script {
                echo "Environment File Path: ${env.ENV_FILE_PATH}"
                echo "PM2 App Name: ${env.PM2_APP_NAME}"
                echo "PM2 Worker Name: ${env.PM2_WORKER_NAME}"
                echo "Branch Name: ${env.BRANCH_NAME}"
            }
        }
    }
}
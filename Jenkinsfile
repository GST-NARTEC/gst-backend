pipeline {
    agent any
    
    environment {
        NODE_VERSION = '20.10.0'
        PM2_PROCESS_DEV = 'gst'
        PM2_PROCESS_PROD = 'gst'
        JWT_SECRET = 'com.nartec.gst'
        DATABASE_URL = credentials('gst_database_url')
        EMAIL_FROM = credentials('gst_email_from')
        EMAIL_APP_PASSWORD = credentials('gst_email_app_password')
        JWT_ACCESS_SECRET = credentials('gst_jwt_access_secret')
        JWT_REFRESH_SECRET = credentials('gst_jwt_refresh_secret')
        LOGIN_URL = 'https://buybarcodeupc.com/login'
        FRONTEND_URL = 'http://localhost:5173'
        DOMAIN = "http://localhost:${PORT}"
    }
    
    triggers {
        githubPush()  // Automatically trigger on GitHub push events
    }
    
    stages {
        stage('Set Environment Variables') {
            steps {
                script {
                    // Set environment variables based on the branch
                    if (env.BRANCH_NAME == 'dev') {
                        env.NODE_ENV = 'development'
                        env.PORT = "${env.PORT}"
                        env.FRONTEND_URL = 'http://localhost:5173'
                        env.DOMAIN = "http://localhost:${env.PORT}"
                        env.PM2_PROCESS = env.PM2_PROCESS_DEV
                    } else if (env.BRANCH_NAME == 'master') {
                        env.NODE_ENV = 'production'
                        env.PORT = "${env.PORT}"  // Adjust if production port is different
                        env.FRONTEND_URL = 'https://buybarcodeupc.com'  // Adjust for production
                        env.DOMAIN = 'https://api.buybarcodeupc.com'    // Adjust for production
                        env.PM2_PROCESS = env.PM2_PROCESS_PROD
                    } else {
                        error "Unsupported branch: ${env.BRANCH_NAME}"
                    }
                }
            }
        }
        
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Setup Environment') {
            steps {
                script {
                    writeFile file: ".env", text: """
                        PORT=${env.PORT}
                        JWT_SECRET=${env.JWT_SECRET}
                        DATABASE_URL=${env.DATABASE_URL}
                        EMAIL_FROM=${env.EMAIL_FROM}
                        EMAIL_APP_PASSWORD=${env.EMAIL_APP_PASSWORD}
                        DOMAIN=${env.DOMAIN}
                        FRONTEND_URL=${env.FRONTEND_URL}
                        JWT_ACCESS_SECRET=${env.JWT_ACCESS_SECRET}
                        JWT_REFRESH_SECRET=${env.JWT_REFRESH_SECRET}
                        LOGIN_URL=${env.LOGIN_URL}
                        NODE_ENV=${env.NODE_ENV}
                    """
                }
            }
        }
        
        stage('Install Dependencies') {
            steps {
                nodejs(nodeJSInstallationName: "Node ${env.NODE_VERSION}") {
                    bat 'npm install'
                }
            }
        }
        
        stage('Generate Prisma Client') {
            steps {
                nodejs(nodeJSInstallationName: "Node ${env.NODE_VERSION}") {
                    bat 'npx prisma generate'
                }
            }
        }
        
        stage('Stop Existing Process') {
            steps {
                script {
                    bat """
                        for /f "tokens=5" %%a in ('netstat -ano ^| findstr ${env.PORT}') do taskkill /F /PID %%a 2>NUL || exit 0
                        pm2 delete ${env.PM2_PROCESS} 2>NUL || exit 0
                    """
                }
            }
        }
        
        stage('Deploy') {
            steps {
                nodejs(nodeJSInstallationName: "Node ${env.NODE_VERSION}") {
                    bat """
                        pm2 start app.js --name ${env.PM2_PROCESS} --env ${env.NODE_ENV}
                        pm2 save
                    """
                }
            }
        }
    }
    
    post {
        failure {
            script {
                bat """
                    pm2 restart ${env.PM2_PROCESS} || exit 0
                    pm2 save
                """
                echo 'Pipeline failed! PM2 process restarted.'
            }
        }
        always {
            node {
                deleteDir()  // Clean workspace
            }
        }
    }
}
pipeline {
    agent any
    
    environment {
        NODE_VERSION = '20.10.0'
        PM2_PROCESS = 'gst'
        PORT = '3000'
        JWT_SECRET = 'com.nartec.gst'
        DATABASE_URL = credentials('gst_database_url')
        EMAIL_FROM = credentials('gst_email_from')
        EMAIL_APP_PASSWORD = credentials('gst_email_app_password')
        JWT_ACCESS_SECRET = credentials('gst_jwt_access_secret')
        JWT_REFRESH_SECRET = credentials('gst_jwt_refresh_secret')
        LOGIN_URL = 'https://buybarcodeupc.com/login'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Setup Environment') {
            steps {
                node {
                    script {
                        writeFile file: ".env", text: """
                            PORT=${PORT}
                            JWT_SECRET=${JWT_SECRET}
                            DATABASE_URL=${DATABASE_URL}
                            EMAIL_FROM=${EMAIL_FROM}
                            EMAIL_APP_PASSWORD=${EMAIL_APP_PASSWORD}
                            DOMAIN=http://localhost:${PORT}
                            FRONTEND_URL=http://localhost:5173
                            JWT_ACCESS_SECRET=${JWT_ACCESS_SECRET}
                            JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
                            LOGIN_URL=${LOGIN_URL}
                        """
                    }
                }
            }
        }
        
        stage('Install Dependencies') {
            steps {
                node {
                    nodejs(nodeJSInstallationName: "Node ${NODE_VERSION}") {
                        bat 'npm install -g pnpm'
                        bat 'pnpm install'
                    }
                }
            }
        }
        
        stage('Generate Prisma Client') {
            steps {
                node {
                    nodejs(nodeJSInstallationName: "Node ${NODE_VERSION}") {
                        bat 'npx prisma generate'
                    }
                }
            }
        }
        
        stage('Stop Existing Process') {
            steps {
                node {
                    script {
                        bat """
                            for /f "tokens=5" %%a in ('netstat -ano ^| findstr ${PORT}') do taskkill /F /PID %%a
                            pm2 delete ${PM2_PROCESS} || exit 0
                        """
                    }
                }
            }
        }
        
        stage('Deploy') {
            steps {
                node {
                    nodejs(nodeJSInstallationName: "Node ${NODE_VERSION}") {
                        bat """
                            pm2 start app.js --name ${PM2_PROCESS}
                            pm2 save
                        """
                    }
                }
            }
        }
    }
    
    post {
        failure {
            node {
                script {
                    bat """
                        pm2 restart ${PM2_PROCESS} || exit 0
                        pm2 save
                    """
                    echo 'Pipeline failed! PM2 process restarted.'
                }
            }
        }
        always {
            node {
                deleteDir()
            }
        }
    }
}
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
                git branch: 'dev', url: 'https://github.com/GST-NARTEC/gst-backend.git'
            }
        }
        
        stage('Setup Environment') {
            steps {
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
        
        stage('Install Dependencies') {
            steps {
                nodejs(nodeJSInstallationName: "Node ${NODE_VERSION}") {
                    sh 'pnpm install'
                }
            }
        }
        
        stage('Generate Prisma Client') {
            steps {
                nodejs(nodeJSInstallationName: "Node ${NODE_VERSION}") {
                    sh 'npx prisma generate'
                }
            }
        }
        
        stage('Stop Existing Process') {
            steps {
                script {
                    sh '''
                        if pm2 list | grep -q "${PM2_PROCESS}"; then
                            pm2 stop ${PM2_PROCESS}
                            pm2 delete ${PM2_PROCESS}
                        fi
                    '''
                }
            }
        }
        
        stage('Deploy') {
            steps {
                nodejs(nodeJSInstallationName: "Node ${NODE_VERSION}") {
                    sh '''
                        pm2 start app.js --name ${PM2_PROCESS}
                        pm2 save
                    '''
                }
            }
        }
    }
    
    post {
        failure {
            script {
                sh '''
                    if pm2 list | grep -q "${PM2_PROCESS}"; then
                        pm2 restart ${PM2_PROCESS}
                        pm2 save
                    fi
                '''
                echo 'Pipeline failed! PM2 process restarted.'
            }
        }
        always {
            cleanWs()
        }
    }
}
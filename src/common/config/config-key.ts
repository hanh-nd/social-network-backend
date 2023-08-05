export enum ConfigKey {
    PORT = 'PORT',
    MONGO_DATABASE_CONNECTION_STRING = 'MONGO_DATABASE_CONNECTION_STRING',
    MONGO_DATABASE_NAME = 'MONGO_DATABASE_NAME',
    JWT_ACCESS_TOKEN_SECRET = 'JWT_ACCESS_TOKEN_SECRET',
    JWT_REFRESH_TOKEN_SECRET = 'JWT_REFRESH_TOKEN_SECRET',
    JWT_ACCESS_TOKEN_EXPIRES_TIME = 'JWT_ACCESS_TOKEN_EXPIRES_TIME',
    JWT_REFRESH_TOKEN_EXPIRES_TIME = 'JWT_REFRESH_TOKEN_EXPIRES_TIME',
    CORS_WHITELIST = 'CORS_WHITELIST',
    BASE_PATH = 'BASE_PATH',
    LOG_LEVEL = 'LOG_LEVEL',
    LOG_ROOT_FOLDER = 'LOG_ROOT_FOLDER',
    REDIS_CONNECTION_STRING = 'REDIS_CONNECTION_STRING',
    OPENAI_API_KEY = 'OPENAI_API_KEY',
    ELASTICSEARCH_NODE = 'ELASTICSEARCH_NODE',
    ELASTICSEARCH_USERNAME = 'ELASTICSEARCH_USERNAME',
    ELASTICSEARCH_PASSWORD = 'ELASTICSEARCH_PASSWORD',
    ALERT_TIME_RANGE = 'ALERT_TIME_RANGE',
    SEND_VERIFY_EMAIL_ADDRESS = 'SEND_VERIFY_EMAIL_ADDRESS',
    SEND_VERIFY_EMAIL_PASSWORD = 'SEND_VERIFY_EMAIL_PASSWORD',
}

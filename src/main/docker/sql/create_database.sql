SELECT 'CREATE DATABASE appbase'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'appbase')\gexec

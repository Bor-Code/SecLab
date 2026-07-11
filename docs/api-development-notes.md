# API Notes

Bu dosyada SecLab backend tarafında şu ana kadar eklediğim endpointleri kısa olarak tuttum.

## Current APIs

### Users
- GET /users
- POST /users
- GET /users/{user_id}
- PUT /users/{user_id}
- DELETE /users/{user_id}

### Topics
- GET /topics
- POST /topics
- GET /topics/{topic_id}
- PUT /topics/{topic_id}
- DELETE /topics/{topic_id}

### Learning Logs
- GET /learning-logs
- POST /learning-logs
- GET /learning-logs/{log_id}
- PUT /learning-logs/{log_id}
- DELETE /learning-logs/{log_id}

### Resources
- GET /resources
- POST /resources
- GET /resources/{resource_id}
- PUT /resources/{resource_id}
- DELETE /resources/{resource_id}

## Notes

Backend tarafında users, topics, learning_logs ve resources için temel CRUD yapısı tamamlandı.

Tablolar PostgreSQL üzerinde foreign key ilişkileriyle bağlı.

Endpointleri Swagger UI, tarayıcı ve PowerShell istekleriyle test ettim.

Sonraki adım bu endpointleri frontend formlarına bağlamak.
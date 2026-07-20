# API Notes

In this file, I’ve provided a brief overview of the endpoints I’ve added so far on the SecLab backend.

## Current APIs

### Users
- GET /users
- POST /users
- GET /users/{user_id}
- PATCH /users/{user_id}
- DELETE /users/{user_id}

### Topics
- GET /topics
- POST /topics
- GET /topics/{topic_id}
- PATCH /topics/{topic_id}
- DELETE /topics/{topic_id}

### Learning Logs
- GET /learning-logs
- POST /learning-logs
- GET /learning-logs/{log_id}
- PATCH /learning-logs/{log_id}
- DELETE /learning-logs/{log_id}

### Resources
- GET /resources
- POST /resources
- GET /resources/{resource_id}
- PATCH /resources/{resource_id}
- DELETE /resources/{resource_id}

## Response Models

FastAPI response models are used to explicitly define API responses in Swagger/OpenAPI.

Current CRUD response model pattern:

- List endpoints return typed lists, such as `list[TopicRead]`.
- Create endpoints return the created record, such as `TopicRead`.
- Read endpoints return a single record model.
- Update endpoints return the updated record model.
- Delete endpoints return explicit delete response models that include a message and the deleted record.

Current delete response models:

- `TopicDeleteResponse`
- `UserDeleteResponse`
- `LearningLogDeleteResponse`
- `ResourceDeleteResponse`

The behavior of the delete endpoint has not changed. The response models document the existing response structure in OpenAPI.
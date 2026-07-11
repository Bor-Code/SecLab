# Topics API Notes

## Purpose
This API manages the topics for the SecLab tracking application, providing full CRUD (Create, Read, Update, Delete) operations. It allows the frontend to categorize, store, and manage specific subject records seamlessly within the PostgreSQL database.

## Endpoints
The following endpoints are nested under the `/topics` router prefix.

## GET /topics
Lists all topic records from the `topics` table. The results are returned as a JSON array and are ordered by their unique `id`.

## POST /topics
Creates a new topic record for an existing user. Requires a JSON payload containing `user_id` and `name`, with an optional `description`. Returns the newly created topic object.

## GET /topics/{topic_id}
Retrieves the details of a specific topic by its unique ID. Returns a single JSON object containing the topic's data.

## PUT /topics/{topic_id}
Updates an existing topic. Requires a JSON payload containing the new `name` and/or `description`. Returns the updated topic object.

## DELETE /topics/{topic_id}
Deletes a specific topic record from the database based on its ID. Returns a success message along with the data of the deleted topic.

## Error Handling
The API follows standard HTTP status codes for error management. If a `topic_id` does not exist during a GET, PUT, or DELETE request, the API intercepts the null result and returns a `404 Not Found` HTTP exception.

## Test Notes
* **Swagger UI:** All endpoints can be interactively tested by navigating to the `/docs` route provided by FastAPI.
* **Foreign Key Constraint:** Before testing the `POST /topics` endpoint, ensure at least one valid user exists in the `users` table, as the `user_id` must reference a valid record to prevent database errors.
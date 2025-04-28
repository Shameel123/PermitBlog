# PermitBlog: A Headless Blog System

This is the backend for the HasabTech Blog application, built using the [NestJS](https://nestjs.com/) framework. It provides APIs for user management, post management, and role-based access control using [Permit.io](https://permit.io/).

---

## Environment Variables

The application requires the following environment variables to be set in a `.env` file:

### Permit.io Configuration
- **`PERMIT_IO_PDP`**: The Permit.io Policy Decision Point (PDP) URL.  
  Example: `http://localhost:7766` (for local development with docker, required for ABAC and ReBAC) or `https://cloudpdp.api.permit.io` (for RBAC only).
- **`PERMIT_IO_TOKEN`**: The Permit.io API token for authentication. You can get it from Permit.io platform: Projects > Environment > Click Card on Top Right > Copy API Key
  Example: `permit_key_dH6******************`.
- **`PERMIT_IO_TENANT`**: The tenant identifier for Permit.io.  
  Example: `permit-blog`. Nest.js in code refers to `default` if this is not set.

### MongoDB Configuration
- **`MONGO_DB_URI`**: The MongoDB connection string.  
  Example: `mongodb://localhost:27017/permit-blog`.

### JWT Configuration
- **`JwtSecret`**: The secret key used to sign JWT tokens.  
  Example: `454C5CE3123123HJJHK123`.
- **`JWT_EXPIRATION`**: The expiration time for JWT tokens.  
  Example: `1d`.

### API Key
- **`BackendApiKey`**: The API key used for secure backend communication. For example, changing role of a user directly from API. 
  Example: `2E91JKH23JHK123JHK12HJK3HF`.

### Port
**`PORT`**=3001
By default, it runs on 3000.


---

## Database Connectivity

The application uses MongoDB as its database. You can connect to a locally installed MongoDB instance or use a Docker container.

### Local MongoDB Installation
1. Install MongoDB from the [official website](https://www.mongodb.com/try/download/community).
2. Start the MongoDB service.
3. Update the `MONGO_DB_URI` in the `.env` file to point to your local MongoDB instance.  
   Example: `mongodb://localhost:27017/hasabTech-blog-permitio`.

### MongoDB with Docker
1. Pull the MongoDB Docker image:

docker pull mongo
docker run --name mongodb -d -p 27017:27017 mongo

## Permit.io Integration

The application uses Permit.io for role-based access control. Ensure the following:

- Set up a Permit.io account and create a project.
- (Optional) Define tenant and then copy its value to `PERMIT_IO_TENANT`
- Obtain the `PERMIT_IO_PDP` and `PERMIT_IO_TOKEN` values from your Permit.io dashboard.
- Define roles and permissions in Permit.io to match the application's requirements

Following Roles and Resources should match in your Permit.io environment/dashboard as well:
### Roles
Roles should match currently as per the code:
- admin
- editor
- author
- viewer

### Resources
There are 2 resource currently:
- Post
- User

## Running the Application

### Install dependencies:
```
npm install
```

### Start Application

Development Mode:
```
npm run start:dev
```
Production Mode:
```
npm run start:prod
```

## API Endpoints
The application exposes RESTful APIs for user and post management. Refer to the source code for detailed routes and functionality.

## Pending/Todo:

### User Management:

**Admin** can:
- [ ] Create user(s)
- [ ] Update user(s)
- [ ] Read all users
- [ ] Delete user(s)

**Editor/Author/Viewer** can:
- [ ] Read their own user-related data

### Posts:

**Publish Post | Archive Post | Delete Post:**
- [ ] Migrate co-author logic for archiving posts to ABAC with Permit.io.
- [ ] Implement Permit.io-based access control for publishing posts.
- [ ] Implement Permit.io-based access control for deleting posts.
- [ ] Review and update the `PostService` code to fully utilize Permit.io for post actions.

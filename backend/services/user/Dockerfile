# Use the official Node.js image as the base image
FROM node:18

# Set the working directory in the container
WORKDIR /usr/src/app

ENV DB_HOST_DOCKER=db_user
ENV DB_PORT_DOCKER=5432
ENV DB_NAME_DOCKER=user_db
ENV DB_USER_DOCKER=myuser
ENV DB_PASSWORD_DOCKER=mypassword
ENV DOCKER_ENV=true

# Copy package.json and package-lock.json
# This allows Docker to cache dependencies
COPY package*.json ./

# Install the application dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the application will run on
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]

# Use an official Python runtime as a base image
FROM python:3.9-slim

# Set the working directory inside the container to be at the project root
WORKDIR /usr/src/app

# Copy the entire project into the container's working directory
COPY . .

# Install any necessary dependencies
# Assumes you have a requirements.txt file at the project root
RUN pip install --no-cache-dir -r requirements.txt

# Expose the port your application runs on
EXPOSE 8001

# Command to run the application using the same command as localhost development
CMD ["python", "-m", "backend.services.langchain.server.main"]

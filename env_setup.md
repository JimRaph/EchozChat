# Environment Variables for WhatsApp Clone

This document outlines the required environment variables for the application.

## AWS SNS Configuration (Required for OTP SMS)

The following AWS credentials are required to send OTP messages via SMS:

```env
# AWS Region (e.g., us-east-1, eu-west-1)
AWS_REGION=your-aws-region

# AWS Access Key ID
AWS_ACCESS_KEY_ID=your-access-key-id

# AWS Secret Access Key
AWS_SECRET_ACCESS_KEY=your-secret-access-key
```

### Setting up AWS SNS:

1. **Create an AWS Account**: If you don't have one, sign up at [aws.amazon.com](https://aws.amazon.com)

2. **Enable SNS SMS**:

   - Go to AWS SNS Console
   - Navigate to "Text messaging (SMS)" in the left sidebar
   - Request production access if needed (AWS starts with sandbox mode)

3. **Create IAM User**:

   - Go to IAM Console
   - Create a new user with programmatic access
   - Attach the `AmazonSNSFullAccess` policy (or create a custom policy with `sns:Publish` permission)
   - Save the Access Key ID and Secret Access Key

4. **Configure Test Numbers**:
   - The application has built-in test numbers: `1234`, `2233`, `5678`
   - These numbers bypass actual SMS sending and return the OTP directly in the response

## Other Environment Variables

Add other required environment variables here (database connection, JWT secrets, etc.)

## Example .env File

```env
# AWS SNS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY

# Database
MONGODB_URI=your-mongodb-connection-string

# JWT
JWT_SECRET=your-jwt-secret

# Cloudinary (for media)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# frontend
VITE_API_BASE_URL=your_backend_link 
```


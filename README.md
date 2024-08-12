# Cloudflare R2 with Next.js: Upload, Download, Delete

This is a [Next.js](https://nextjs.org/) project that demonstrates how to integrate Cloudflare R2 for file upload, download, and deletion functionalities. It is bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).



https://github.com/user-attachments/assets/9b5b8922-167c-4519-a49c-5efbc932c999



## Table of Contents

- [Installation](#installation)
- [Getting Started](#getting-started)
- [Features](#features)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Package Details](#package-details)
- [License](#license)

## Installation

To install the necessary dependencies, run the following command:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

## Getting Started

To run the project, first ensure you have installed the necessary dependencies. Then, start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

- **Upload files to Cloudflare R2**: Users can upload files directly to Cloudflare R2 storage.
- **Download files from Cloudflare R2**: Users can download files stored in Cloudflare R2.
- **Delete files from Cloudflare R2**: Users can delete files from Cloudflare R2.
- **Progress indication during file uploads**: Users receive feedback on the upload progress.
- **Responsive UI**: The application is designed to be responsive and user-friendly.

## Project Structure

The project is structured as follows:

```
/src
  /app
    /api
      /files
        route.ts         # API routes for file operations
      /upload
        route.ts         # API route for file upload
    /components
      file-manager.tsx   # Component for managing file uploads, downloads, and deletions
    layout.tsx           # Main layout component
    page.tsx             # Home page component
  /utils
    r2.ts                # Utility functions for interacting with Cloudflare R2
/globals.css             # Global styles
```

## API Endpoints

### File Operations

- **GET /api/files**: Lists all files in the Cloudflare R2 bucket.
- **POST /api/files**: Generates a signed URL for downloading a specific file.
- **DELETE /api/files**: Deletes a specified file from the Cloudflare R2 bucket.

### Upload File

- **POST /api/upload**: Generates a signed URL for uploading a file to Cloudflare R2.

## Environment Variables

Make sure to set the following environment variables in your `.env` file:

```
R2_ACCOUNT_ID=<your_r2_account_id>
R2_ACCESS_KEY_ID=<your_r2_access_key_id>
R2_SECRET_ACCESS_KEY=<your_r2_secret_access_key>
R2_BUCKET=<your_r2_bucket_name>
```

## Package Details

This project uses the following packages:

### Dependencies
- **@aws-sdk/client-s3**: ^3.627.0 - AWS SDK for JavaScript S3 client.
- **@aws-sdk/s3-request-presigner**: ^3.627.0 - Presigner for S3 requests.
- **next**: 14.2.5 - The React framework for production.
- **react**: ^18 - A JavaScript library for building user interfaces.
- **react-dom**: ^18 - React package for working with the DOM.

### Dev Dependencies
- **@types/node**: ^20 - TypeScript definitions for Node.js.
- **@types/react**: ^18 - TypeScript definitions for React.
- **@types/react-dom**: ^18 - TypeScript definitions for React DOM.
- **eslint**: ^8 - A tool for identifying and reporting on patterns in JavaScript.
- **eslint-config-next**: 14.2.5 - ESLint configuration for Next.js.
- **postcss**: ^8 - A tool for transforming CSS with JavaScript plugins.
- **tailwindcss**: ^3.4.1 - A utility-first CSS framework.
- **typescript**: ^5 - A superset of JavaScript that compiles to clean JavaScript output.

## License

This project is licensed under the MIT License.
# cloudflare-r2-nextjs

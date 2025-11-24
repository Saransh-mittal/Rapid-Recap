# Deployment Guide

This project is configured for deployment on **Render** using Docker. This allows us to run the Node.js server, React frontend, and Python dependencies (including Playwright browsers) in a single free service.

## Prerequisites

1.  A [Render](https://render.com) account (Free).
2.  This code pushed to a GitHub repository.

## Deployment Steps

1.  **Log in to Render** and go to your Dashboard.
2.  Click **New +** and select **Blueprint**.
3.  Connect your GitHub repository containing this code.
4.  Render will automatically detect the `render.yaml` file.
5.  **Service Name**: You can keep `rapid-recap` or change it.
6.  **Environment Variables**: You will be prompted to enter values for the variables defined in `render.yaml`.
    *   `MONGODB_URI`: Your MongoDB connection string.
    *   `JWT_SECRET`: A secret key for authentication.
    *   `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: For Google Auth.
    *   `PUBLIC_VAPID_KEY` & `PRIVATE_VAPID_KEY`: For Web Push notifications.
    *   `OPENAI_API_KEY`: For AI features.
    *   **PORT**: Leave as `10000` (default for Render).
    *   **Other Keys**: Copy the values from your local `.env` file or ask your team for the production keys. Render keeps these secure.
7.  Click **Apply**.

Render will now:
1.  Build the Docker image (this may take a few minutes as it installs browsers).
2.  Deploy the service.
3.  Provide you with a `...onrender.com` URL.

## Troubleshooting

-   **Build Failures**: Check the logs. If it fails on Python dependencies, ensure `server/requirements.txt` is up to date.
-   **Runtime Errors**: Check the logs. If Playwright fails to launch, it might be a memory issue on the free tier, but the chosen base image is optimized for this.

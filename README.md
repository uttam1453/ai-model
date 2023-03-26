# Cheer Me Up
Cheer Me Up is an AI-based conversational model that assesses a person's emotional state and provides appropriate methods to uplift their spirits. The model uses natural language processing and machine learning to analyze a person's mood and determine the most effective methods to improve it. This solution is intended to provide a more accessible, personalized, and effective approach to emotional wellness, particularly for those who may not have access to or feel comfortable seeking traditional mental health services.
This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

# Backend Architecture

The backend architecture of Cheer Me Up includes the following components:

AWS Rekognition: This component analyzes the images uploaded to the S3 bucket and provides information such as the objects and faces detected in the images.

Mongo DB: This component stores the images that will be analyzed by Rekognition.

Slack Integration: This component allows you to send notification over Slack

AWS IAM: This component manages access to the AWS services and resources used by your backend components.

# FrontEnd Architecture

The frontend of Cheer Me Up is a ReactJS application that allows users to interact with the model and receive recommendations to improve their mood.

# Getting Started
To use Cheer Me Up, follow these steps:

Create an AWS account and set up the necessary components, including IAM roles

Install the AWS SDK for JavaScript in your ReactJS application.

Implemented code to upload images to the Mongo DB, analyze them with Rekognition, and provide personalized recommendations to the user.

Continuously train and improve the model using machine learning techniques.

## Available Scripts

In the project directory, you can run:

### `npm start start`

Runs the app in the development mode.\
Open [http://localhost:8080](http://localhost:8080) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm run buildWeb`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

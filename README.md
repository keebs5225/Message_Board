Message Board 

This is a simple message board web application built with Node.js, Express, and EJS for templating. It supports user authentication, posting messages, upvoting, and profile management. The app is styled with CSS and deployed on GitHub Pages.

Features

User signup, login, and logout

Post new messages with username

View messages with timestamps and avatars

Upvote messages

Delete messages

View user profile and their messages

Flash messages for success and error feedback



Technologies

Backend: Node.js, Express

Frontend: EJS, HTML, CSS

Database: In-memory (can be extended)



Project Structure

message-board/
|
|-- middleware
|   |-- auth.js                      # Auth routes
|   |--moderation.js
|
|-- models/
|   |--users.js
|
|-- public/
|   |-- style.css                    # Global styles
|
|-- routes/
|   |-- index.js                     # Main routes
|
|-- utils
|   |-- dateFormatter.js
|
|-- views/
|   |-- form.ejs                     # New message form
|   |-- index.ejs                    # Homepage
|   |-- message.ejs                  # Message details
|   |-- profile.ejs                  # User profile
|   |-- login.ejs                    # Login page
|   |-- signup.ejs                   # Signup page
|
|-- .gitignore                       # Ignored files
|-- .env
|-- app.js                           # Express setup and middleware
|-- database.db
|-- package.json                     # Project dependencies
|-- package-lock.json                # Dependency versions
|--README.md



Deployment on GitHub Pages

Ensure your project is pushed to a GitHub repository.

In your GitHub repo, go to Settings > Pages.

Under "Source," select the branch to deploy and save.

Your site will be live at https:keebs5225.github.io/Message_Board
Suntales
Kindergarten Management App
A full-stack web application designed to support the daily operations of a kindergarten — from classroom activities to meal tracking, announcements, and parent communication.

📌 What the Project Does
This app provides a secure, role-based platform for managing a kindergarten’s daily life. It includes:

 Admin Dashboard: Manage users, assign roles (Parent/Teacher), create announcements,
events, weekly menus, invoices, and classroom activities.

 Parent Portal: View your child’s student card with access to parent and teacher contact info, 
track meals, update medical info, and stay informed about classroom activities and announcements.

 Teacher Tools: Track meals for students, upload and manage classroom activities, and 
view student cards with access to parent and teacher contact info.


💡 Why It's Useful
This project streamlines communication between staff and families, centralizes student data, 
and brings joyful transparency to everyday kindergarten life. 
It’s built to be intuitive, secure, and scalable — perfect for schools that want to digitize their workflow while keeping things playful and personal.

🚀 Getting Started

🔧 Backend Setup (Django + DRF)

1.Clone the repository:	

	git clone https://github.com/KKostika/SunTales-main.git
	cd backend
	cd suntales


2.Create a virtual invorement and activate it:

	python -m venv env
	.\env\Scripts\Activate.ps1



3.install depedencies:

	pip install -r requirements.txt


4. Create your MySQL database manually, open Workbench(or phhMyAdmin etc.) and create a new suntales DB


5. On settings search for the DATABASES and configure it with your DB Credentials or create an .env file and add your credentials there:

	<img width="391" height="219" alt="Screenshot 2025-09-03 211318" src="https://github.com/user-attachments/assets/07629b3e-767a-4fdf-9618-3cd978200eac" />


	<img width="239" height="137" alt="Screenshot 2025-09-03 220336" src="https://github.com/user-attachments/assets/e1865881-360f-49d1-915c-98066520834a" />

6. Make sure you are in the same path as the manage.py file and then run migrations:

		python manage.py makemigrations
		
		python manage.py migrate

7.Create a superuser to access the admin panel:

	python manage.py createsuperuser

8.Start the server:

	python manage.py runserver

9.If you're running the frontend locally, make sure your backend allows requests from your frontend origin. In your Django settings.py, change CORS_ALLOWED_ORIGINS to match your Frontend origin:

<img width="807" height="66" alt="Screenshot 2025-09-04 163756" src="https://github.com/user-attachments/assets/834cdd09-be37-4e88-be2a-fda1f4b29ad3" />


🎨 Frontend Setup (React + Bootstrap)


1. Open a new terminal and then navigate to frontend folder:
 
		cd frontend

2.Install dependecies:

	npm install

3. Start the development server:

		npm run dev



The SunTales application is divided into two main parts: Backend (Django + DRF) and Frontend (React). Below is an overview of the folder structure:

	SUNTALES-MAIN/
	│
	├── backend/
	│   ├── suntales/
	│   │   ├── config/              # Django settings, URLs, WSGI/ASGI configuration
	│   │   ├── products/api/        # Django REST API: models, views, serializers
	│   │   ├── media/               # Uploaded user files (e.g., images)
	│   │   ├── .env                 # Environment variables (DB credentials, etc.). ---> Please either create manually this file or add your DB credentials firectly in settings <---
	│   │   ├── manage.py            # Django management script
	│   │   └── requirements.txt     # Python dependencies
	│
	├── frontend/
	│   ├── public/                  # Static public assets
	│   ├── src/
	│   │   ├── assets/images/       # Icons and image assets
	│   │   ├── components/          # React components (Activities, Menu, Students, etc.)
	│   │   ├── services/            # API calls and helper functions
	│   │   ├── App.jsx              # Main application component
	│   │   └── index.css            # Global styles
	│   ├── package.json             # JavaScript dependencies & scripts
	│   └── vite.config.js           # Vite configuration
	│
	└── README.md                    # Project documentation


   

🛠️ Technologies Used

This project leverages a modern full-stack setup to ensure scalability, performance, and ease of use:

  Backend (Django + Django REST Framework)
----------------------------------------------
Python 3.11

Django – Web framework for building the backend logic

Django REST Framework (DRF) – For building RESTful APIs

MySQL – Relational database for storing user and student data

dotenv – For managing environment variables securely


  Frontend (React + Vite)
----------------------------------------------

React – Component-based UI library

Vite – Fast development server and build tool

Bootstrap – Responsive UI styling

Axios – For making HTTP requests to the backend

React Router – For client-side routing


 Dev Tools & Utilities
----------------------------------------------
Git – Version control

VS Code – Recommended code editor

Postman – API testing and debugging

npm – Package manager for frontend dependencies

venv – Python virtual environment



--> Project Flow <--
To ensure a smooth setup and operation, here's the recommended workflow for Admin users:

➕ Add Classrooms Start by creating classroom entries.

👥 Create Users Add all users to the system. Each user must be assigned a role: either Parent, Teacher or Admin.

📋 Assign Users to Role-Based Lists

The Parents List automatically displays users with the "Parent" role.

The Teachers List automatically displays users with the "Teacher" role. No manual filtering is needed — the system handles it dynamically.

👶 Create Student Profiles Fill out the student form, where you can assign a parent and a teacher from the respective lists. Each student is linked to their classroom and guardians.

🍽️ Add Weekly Menu (optional) Upload the weekly meal plan to keep parents informed and help teachers track meals.

🎨 Add Classroom Activities (optional) Teachers can upload photos and updates from classroom activities to share with parents. 
	Each parent has permission to view only the photos from the classroom their child is assigned to, along with the corresponding teacher.

💳 Add Invoice Information (optional) Manage billing and payment details for each student.

📢 Post Events, News & Announcements (optional) Keep families and staff informed with timely updates.


📬 Contact

Creator: Kyriaki Kostika 

**LinkedIn:** [Connect with me on LinkedIn](https://linkedin.com/in/kyriaki-kostika-23865a369)










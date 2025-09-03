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


Frontend Setup (React + Bootstrap)

1. Open a new terminal and then navigate to frontend folder:
 
	   	cd frontend

2.Install dependecies:

	npm install

3. Start the development server:

		npm run dev

   






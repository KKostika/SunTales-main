import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Header from './components/header.jsx';
import About from './components/LandingPage/about.jsx';
import Teachers from './components/LandingPage/ourTeachers.jsx';
import Contact from './components/LandingPage/contact.jsx';
import Footer from './components/footer.jsx';
import Login from './components/LoginPage.jsx';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './components/LandingPage/landingPage.jsx';
import ProtectedRoute from './services/protectedRoutes.jsx';
import Dashboard from './components/Dashboard/Dashboard.jsx';
import UserManagement from './components/Managment/UserManagments.jsx';
import StudentList from './components/Students/StudentList.jsx';
import ParentList from './components/Managment/ParentList.jsx';
import TeachersList from './components/Managment/TeacherList.jsx';
import api from './services/api.jsx';
import AddClassroomForm from './components/Managment/classroomList.jsx';
import WeeklyMenuCalendar from './components/Menu/menuCalendar.jsx'
import Meals from './components/Menu/Meals.jsx';
import FinancialRecords from './components/Managment/Invoices.jsx';
import ActivitiesPage from './components/Activities/activitiesPage.jsx';
import Activities from './components/LandingPage/activitiesInfo.jsx';





function HomePage() {
  return (
    <>
      <Landing />
      <About />
      <Activities />
      <Teachers />
      <Contact />
    </>
  );
}

function App() {
  
  return (
    <BrowserRouter>
      <div className='App d-flex flex-column min-vh-100'>
        <header id='header'>
          <Header />
        </header>

        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin', 'teacher', 'parent']}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/students"
              element={
                <ProtectedRoute allowedRoles={['admin', 'teacher', 'parent']}>
                  <StudentList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/parents"
              element={
                <ProtectedRoute allowedRoles={['admin', 'teacher', 'parent']}>
                  <ParentList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/teachers"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <TeachersList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/classrooms"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AddClassroomForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/meals"
              element={
                <ProtectedRoute allowedRoles={['admin', 'parent', 'teacher']}>
                  <Meals />
                </ProtectedRoute>
              }
            />
            <Route
              path="/daily-menus"
              element={
                <ProtectedRoute allowedRoles={['admin', 'parent']}>
                  <WeeklyMenuCalendar />
                </ProtectedRoute>
              }
            />
             <Route
              path="/financial_records"
              element={
                <ProtectedRoute allowedRoles={['admin', 'parent']}>
                  <FinancialRecords />
                </ProtectedRoute>
              }
            />
              <Route
              path="/activities"
              element={
                <ProtectedRoute allowedRoles={['admin', 'teacher', 'parent']}>
                  <ActivitiesPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        <div className='mt-auto'>
          <footer id='footer'>
          <Footer />
        </footer>
        </div>
        
      </div>
    </BrowserRouter>
  );
}

export default App;


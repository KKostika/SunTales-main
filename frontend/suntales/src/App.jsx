import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Header from './components/header';
import About from './components/about';
import Teachers from './components/ourTeachers.jsx';
import Contact from './components/contact';
import Footer from './components/footer';
import Login from './components/LoginPage';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './components/landingPage';
import ProtectedRoute from './services/protectedRoutes.jsx';
import Dashboard from './components/Dashboard';
import UserManagement from './components/UserManagments';
import StudentList from './components/StudentList';
import ParentList from './components/ParentList';
import TeachersList from './components/TeacherList.jsx';
import api from './services/api';
import AddClassroomForm from './components/classroomList.jsx';
import WeeklyMenuCalendar from './components/menuCalendar.jsx'
import Meals from './components/Meals.jsx';
import FinancialRecords from './components/Invoices.jsx';
import ActivitiesPage from './components/activitiesPage.jsx';





function HomePage() {
  return (
    <>
      <Landing />
      <About />
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
                <ProtectedRoute allowedRoles={['admin', 'parent']}>
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
                <ProtectedRoute allowedRoles={['admin', 'teacher']}>
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


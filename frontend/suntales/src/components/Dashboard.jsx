// import React, { useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Container, Row, Col, Button } from 'react-bootstrap';
// import { isTokenExpired } from '../services/tokenUtils'; 


// const Dashboard = () => {
//   const navigate = useNavigate();
//   const token = localStorage.getItem('token');
//   const role = localStorage.getItem('role');

//   useEffect(() => {
//     if (!token || isTokenExpired(token)) {
    
//      navigate('/login');

//     }
//   }, [token, navigate]);


//   const goTo = (path) => {
//     navigate(path);
//   };

//   return (
//     <Container className="mt-4">
//       <h2 className="mb-4">Welcome to the Dashboard</h2>
//       <p>📰 General announcements go here...</p>

//       {role === 'admin' && (
//         <div className="mb-4">
//           <h4>🔧 Admin Panel</h4>
//           <Button className="me-2" onClick={() => goTo('/users')}>Manage Users</Button>
//           <Button className="me-2" onClick={() => goTo('/students')}>Manage Students</Button>
//         </div>
//       )}

//       {role === 'teacher' && (
//         <div className="mb-4">
//           <h4>📚 Teacher Tools</h4>
//           <Button className="me-2" onClick={() => goTo('/activities')}>Grade Assignments</Button>
//           <Button className="me-2" onClick={() => goTo('/messages')}>Messages</Button>
//         </div>
//       )}

//       {role === 'parent' && (
//         <div className="mb-4">
//           <h4>👨‍👩‍👧 Parent View</h4>
//           <Button className="me-2" onClick={() => goTo('/students')}>View Child Progress</Button>
//           <Button className="me-2" onClick={() => goTo('/financial_records')}>View Invoices</Button>
//         </div>
//       )}
//     </Container>
//   );
// };

// export default Dashboard;


import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Button } from 'react-bootstrap';
import { isAuthenticated, getRole } from '../services/tokenUtils';

const Dashboard = () => {
  const navigate = useNavigate();
  const role = getRole();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

  const goTo = (path) => {
    navigate(path);
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Welcome to the Dashboard</h2>
      <p>📰 General announcements go here...</p>

      {role === 'admin' && (
        <div className="mb-4">
          <h4>🔧 Admin Panel</h4>
          <Button className="me-2" onClick={() => goTo('/users')}>Manage Users</Button>
          <Button className="me-2" onClick={() => goTo('/students')}>Manage Students</Button>
        </div>
      )}

      {role === 'teacher' && (
        <div className="mb-4">
          <h4>📚 Teacher Tools</h4>
          <Button className="me-2" onClick={() => goTo('/activities')}>Grade Assignments</Button>
          <Button className="me-2" onClick={() => goTo('/messages')}>Messages</Button>
        </div>
      )}

      {role === 'parent' && (
        <div className="mb-4">
          <h4>👨‍👩‍👧 Parent View</h4>
          <Button className="me-2" onClick={() => goTo('/students')}>View Child Progress</Button>
          <Button className="me-2" onClick={() => goTo('/financial_records')}>View Invoices</Button>
        </div>
      )}
    </Container>
  );
};

export default Dashboard;


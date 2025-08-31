import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { isAuthenticated, getRole } from '../services/tokenUtils';
import { logout } from '../services/authServices';

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState(null);
  const [expanded, setExpanded] = useState(false);

  const updateAuthStatus = () => {
    const auth = isAuthenticated();
    setIsLoggedIn(auth);
    setRole(auth ? getRole() : null);
  };

  useEffect(() => {
    updateAuthStatus();
  }, [location]);

  const handleLogout = () => {
    logout();
    updateAuthStatus();
    navigate('/login');
    setExpanded(false);
  };

  const handleNavigate = (path) => {
    navigate(path);
    setExpanded(false);
  };

  return (
    <Navbar expand="lg" expanded={expanded} onToggle={() => setExpanded(!expanded)} className="bg-body-tertiary">
      <Container fluid>
        <Navbar.Brand onClick={() => handleNavigate('/')}>Suntales</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto me-5 gap-2 align-items-center">
            {!isLoggedIn && (
              <>
                <Nav.Link href="#home">Home</Nav.Link>
                <Nav.Link href="#about">About</Nav.Link>
                <Nav.Link href="#teachers">Teachers</Nav.Link>
                <Nav.Link href="#contact">Contact</Nav.Link>
              </>
            )}

            {isLoggedIn && role === "admin" && (
              <>
                <Nav.Link onClick={() => handleNavigate('/students')}>Students</Nav.Link>
                <Nav.Link onClick={() => handleNavigate('/parents')}>Parents</Nav.Link>
                <Nav.Link onClick={() => handleNavigate('/teachers')}>Teachers</Nav.Link>
                <Nav.Link onClick={() => handleNavigate('/activities')}>Activities</Nav.Link>
                <Nav.Link onClick={() => handleNavigate('/users')}>Users</Nav.Link>
                <Nav.Link onClick={() => handleNavigate('/financial_records')}>Invoices</Nav.Link>
                <Nav.Link onClick={() => handleNavigate('/classrooms')}>Classrooms</Nav.Link>
                <Nav.Link onClick={() => handleNavigate('/meals')}>Meals</Nav.Link>
                <Nav.Link onClick={() => handleNavigate('/daily-menus')}>Menu</Nav.Link>
                {/* <Nav.Link onClick={() => handleNavigate('/meetings')}>Meetings</Nav.Link> */}
                {/* <Nav.Link onClick={() => handleNavigate('/update_medical_info')}>Medical Info</Nav.Link> */}
                {/* <Nav.Link onClick={() => handleNavigate('/messages')}>Messages</Nav.Link> */}
              </>
            )}

            {isLoggedIn && role === 'teacher' && (
              <>
                <Nav.Link onClick={() => handleNavigate('/students')}>Students</Nav.Link>
                <Nav.Link onClick={() => handleNavigate('/activities')}>Activities</Nav.Link>
                {/* <Nav.Link onClick={() => handleNavigate('/messages')}>Messages</Nav.Link> */}
                <Nav.Link onClick={() => handleNavigate('/classrooms')}>Classrooms</Nav.Link>
              </>
            )}

            {isLoggedIn && role === 'parent' && (
              <>
                {/* <Nav.Link onClick={() => handleNavigate('/parents')}>Parents</Nav.Link> */}
                <Nav.Link onClick={() => handleNavigate('/activities')}>Activities</Nav.Link>
                <Nav.Link onClick={() => handleNavigate('/students')}>Students</Nav.Link>
                <Nav.Link onClick={() => handleNavigate('/financial_records')}>Invoices</Nav.Link>
                 <Nav.Link onClick={() => handleNavigate('/daily-menus')}>Menu</Nav.Link>
                {/* <Nav.Link onClick={() => handleNavigate('/update_medical_info')}>Medical Info</Nav.Link> */}
              </>
            )}
          </Nav>

          <div className="d-flex align-items-center">
            {!isLoggedIn ? (
              <Button variant="primary" onClick={() => handleNavigate('/login')} className='me-5'>
                Login
              </Button>
            ) : (
              <Button variant="secondary" onClick={handleLogout} className='me-5'>
                Logout
              </Button>
            )}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;

import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import api from '../services/api';
import { getRole } from '../services/tokenUtils';

function UserManagement() {
  const role = getRole();

  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'parent',
    first_name: '',
    last_name: '',
    phone: ''
  });
  const [editingUserId, setEditingUserId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validateForm = () => {
  const errors = {};
  const { username, email, role, first_name, last_name, password, phone } = formData;

  if (!username) errors.username = 'Υποχρεωτικό πεδίο';
  if (!email) errors.email = 'Υποχρεωτικό πεδίο';
  else if (!isValidEmail(email)) errors.email = 'Μη έγκυρο email';
  if (!role) errors.role = 'Υποχρεωτικό πεδίο';
  if (!first_name) errors.first_name = 'Υποχρεωτικό πεδίο';
  if (!last_name) errors.last_name = 'Υποχρεωτικό πεδίο';
  if (!editingUserId && !password) errors.password = 'Υποχρεωτικό πεδίο';
  if (phone && phone.length < 10) errors.phone = 'Ο αριθμός τηλεφώνου πρέπει να έχει τουλάχιστον 10 ψηφία';

  setFormErrors(errors);
  return Object.keys(errors).length === 0;
};


  useEffect(() => {
    if (role === 'admin') fetchUsers();
  }, [role]);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users/');
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Είσαι σίγουρη ότι θέλεις να διαγράψεις αυτόν τον χρήστη;');
    if (!confirmDelete) return;

    try {
      await api.delete(`/users/${id}/`);
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const dataToSend = { ...formData };
      if (editingUserId && !formData.password) {
        delete dataToSend.password;
      }

      if (editingUserId) {
        await api.put(`/users/${editingUserId}/`, dataToSend);
      } else {
        await api.post('/users/', dataToSend);
        alert('Ο χρήστης δημιουργήθηκε!');
      }

      handleCloseModal();
      fetchUsers();
    } catch (err) {
      console.error('Error saving user:', err);
    }
  };

  const openEditModal = (user) => {
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      role: user.role,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      phone: user.phone || ''
    });
    setEditingUserId(user.id);
    setShowModal(true);
    setFormErrors({});
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      username: '',
      email: '',
      password: '',
      role: 'parent',
      first_name: '',
      last_name: '',
      phone: ''
    });
    setEditingUserId(null);
    setFormErrors({});
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = (
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesRole = roleFilter ? user.role === roleFilter : true;
    return matchesSearch && matchesRole;
  });

  if (role !== 'admin') return <Navigate to="/unauthorized" />;

  return (
    <div className="container mt-5">
      <h2>User Management</h2>
      <Button onClick={() => setShowModal(true)} className="mb-3">Add User</Button>

      <div className="d-flex justify-content-between mb-3">
        <Form.Control
          type="text"
          placeholder="Αναζήτηση με όνομα, email ή username"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '60%' }}
        />
        <Form.Select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{ width: '35%' }}
        >
          <option value="">Όλοι οι ρόλοι</option>
          <option value="admin">Admin</option>
          <option value="teacher">Teacher</option>
          <option value="parent">Parent</option>
        </Form.Select>
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Firstname</th>
            <th>Lastname</th>
            <th>Username</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map(user => (
            <tr key={user.id}>
              <td>{user.first_name}</td>
              <td>{user.last_name}</td>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.phone}</td>
              <td>{user.role}</td>
              <td>
                <Button variant="warning" onClick={() => openEditModal(user)}>Edit</Button>{' '}
                <Button variant="danger" onClick={() => handleDelete(user.id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editingUserId ? 'Edit User' : 'Add User'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {['first_name', 'last_name', 'username', 'password', 'email'].map(field => (
              <Form.Group className="mb-3" key={field}>
                <Form.Label>{field.replace('_', ' ').toUpperCase()}</Form.Label>
                <Form.Control
                  type={field === 'password' ? 'password' : 'text'}
                  value={formData[field]}
                  onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                  isInvalid={!!formErrors[field]}
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors[field]}
                </Form.Control.Feedback>
              </Form.Group>
            ))}

            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                isInvalid={!!formErrors.phone}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.phone}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                isInvalid={!!formErrors.role}
              >
                <option value="parent">Parent</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {formErrors.role}
              </Form.Control.Feedback>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
          <Button variant="primary" onClick={handleSave}>Save</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default UserManagement;


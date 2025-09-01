import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

function TeacherList() {
  const [teachers, setTeachers] = useState([]);
  const [teacherUsers, setTeacherUsers] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [formData, setFormData] = useState({ user: '', classroom: '' });

  const navigate = useNavigate();

  useEffect(() => {
    fetchTeachers();
    fetchTeacherUsers();
    fetchClassrooms();
  }, []);

  const fetchTeachers = () => {
    api.get('/teachers/')
      .then(res => setTeachers(res.data))
      .catch(err => {
        console.error('Error fetching teachers:', err);
        if (err.response?.status === 401) navigate('/login');
      });
  };

  const fetchTeacherUsers = () => {
    api.get('/teacher-users/')
      .then(res => setTeacherUsers(res.data))
      .catch(err => {
        console.error('Error fetching teacher users:', err);
        console.log(res.data)
        if (err.response?.status === 401) navigate('/login');
      });
  };

  const fetchClassrooms = () => {
    api.get('/classrooms/')
      .then(res => setClassrooms(res.data))
      .catch(err => {
        console.error('Error fetching classrooms:', err);
        if (err.response?.status === 401) navigate('/login');
      });
  };

  const handleSave = () => {
    const endpoint = editingTeacher
      ? `/teachers/${editingTeacher.id}/`
      : '/teachers/';
    const method = editingTeacher ? 'put' : 'post';

    const payload = {
      user: formData.user,
      phone: formData.phone,
      classroom_ids: formData.classroom ? [parseInt(formData.classroom)] : []
    };

    api[method](endpoint, payload)
      .then(() => {
        setShowModal(false);
        setEditingTeacher(null);
        setFormData({ user: '', phone: '', classroom: '' });
        fetchTeachers();
      })
      .catch(err => console.error('Error saving teacher:', err));
  };

  // const handleEdit = (teacher) => {
  //   setEditingTeacher(teacher);
  //   setFormData({
  //     user: teacher.user_id,
  //     phone: teacher.phone || '',
  //     classroom: teacher.classrooms[0]?.id || ''
  //   });
  //   setShowModal(true);
  // };

  const handleDelete = (id) => {
    if (window.confirm('Θέλεις σίγουρα να διαγράψεις αυτόν τον καθηγητή;')) {
      api.delete(`/teachers/${id}/`)
        .then(() => fetchTeachers())
        .catch(err => console.error('Error deleting teacher:', err));
    }
  };

  return (
    <div className="container mt-4">
      <h2> Teachers List</h2>

      <Button className="mb-3" onClick={() => {
        setEditingTeacher(null);
        setFormData({ user: '', phone: '', classroom: '' });
        setShowModal(true);
      }}>
        Add Teacher
      </Button>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Contact</th>
            <th>Classroom</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {teachers.map((t) => {
            console.log('Teacher:', t);
            return (
              <tr key={t.id}>
                <td>{t.name}</td>
                <td>{t.phone || '—'}</td>
                <td>{t.classrooms.map(c => c.name).join(', ') || '—'}</td>
                <td>
                  {/* <Button variant="warning" size="sm" onClick={() => handleEdit(t)}>Edit</Button>{' '} */}
                  <Button variant="danger" size="sm" onClick={() => handleDelete(t.id)}>Delete</Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Select User</Form.Label>
              <Form.Select
                value={formData.user}
                onChange={(e) => setFormData({ ...formData, user: e.target.value })}
                disabled={!!editingTeacher}
              >
                <option value="">-- Select Teacher User --</option>
                {teacherUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

           

            <Form.Group className="mb-3">
              <Form.Label>Select Classroom</Form.Label>
              <Form.Select
                value={formData.classroom}
                onChange={(e) => setFormData({ ...formData, classroom: e.target.value })}
              >
                <option value="">-- Select Classroom --</option>
                {classrooms.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!formData.user || !formData.classroom}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default TeacherList;




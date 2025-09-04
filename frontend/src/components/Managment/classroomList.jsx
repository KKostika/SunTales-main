
import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import api from '../../services/api';

function ClassroomList() {
  const [classrooms, setClassrooms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingClassroom, setEditingClassroom] = useState(null);
  const [formData, setFormData] = useState({ name: '' });

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = () => {
    api.get('/classrooms/')
      .then(res => setClassrooms(res.data))
      .catch(err => console.error('Error fetching classrooms:', err));
  };

  const handleSave = () => {
    const endpoint = editingClassroom
      ? `/classrooms/${editingClassroom.id}/`
      : '/classrooms/';
    const method = editingClassroom ? 'put' : 'post';

    api[method](endpoint, formData)
      .then(() => {
        setShowModal(false);
        setEditingClassroom(null);
        setFormData({ name: '' });
        fetchClassrooms();
      })
      .catch(err => console.error('Error saving classroom:', err));
  };

  const handleEdit = (classroom) => {
    setEditingClassroom(classroom);
    setFormData({ name: classroom.name });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this classroom?')) {
      api.delete(`/classrooms/${id}/`)
        .then(() => fetchClassrooms())
        .catch(err => console.error('Error deleting classroom:', err));
    }
  };

  return (
    <div className="container mt-4">
      <h2> Classroom List</h2>

      <Button className="mb-3"  onClick={() => {
        setEditingClassroom(null);
        setFormData({ name: '' });
        setShowModal(true);
      }}>
         Add Classroom
      </Button>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {classrooms.map((c) => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.name}</td>
              <td>
                <Button variant="warning" size="sm" onClick={() => handleEdit(c)}>Edit</Button>{' '}
                <Button variant="danger" size="sm" onClick={() => handleDelete(c.id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton >
          <Modal.Title>{editingClassroom ? 'Edit Classroom' : 'Add New Classroom'}</Modal.Title>
        </Modal.Header>
        <Modal.Body >
          <Form >
            <Form.Group className="mb-3" >
              <Form.Label>Classroom Name</Form.Label>
              <Form.Control 
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Butterflies, Stars, Rainbows"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!formData.name.trim()}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default ClassroomList;
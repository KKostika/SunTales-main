import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Spinner } from 'react-bootstrap';
import api from '../services/api';

function ParentList() {
  const [parents, setParents] = useState([]);
  const [parentUsers, setParentUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingParent, setEditingParent] = useState(null);
  const [formData, setFormData] = useState({ phone: '', user: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchParents();
    fetchParentUsers();
  }, []);

  const fetchParents = () => {
    api.get('/parents/')
      .then(res => setParents(res.data))
      .catch(err => console.error('Error fetching parents:', err))
      .finally(() => setLoading(false));
  };

  const fetchParentUsers = () => {
    api.get('/parent-users/')
      .then(res => setParentUsers(res.data))
      .catch(err => console.error('Error fetching parent users:', err));
  };

  // 🔁 Όταν αλλάζει ο επιλεγμένος χρήστης, φέρνουμε το phone
  useEffect(() => {
    if (formData.user && !editingParent) {
      api.get(`/parent-users/${formData.user}/`)
        .then(res => {
          setFormData(prev => ({
            ...prev,
            phone: res.data.phone || ''
          }));
        })
        .catch(err => console.error('Error fetching user contact:', err));
    }
  }, [formData.user, editingParent]);

  const handleSave = () => {
    const endpoint = editingParent
      ? `/parents/${editingParent.id}/`
      : '/parents/';
    const method = editingParent ? 'put' : 'post';

    api[method](endpoint, formData)
      .then(() => {
        setShowModal(false);
        setEditingParent(null);
        setFormData({ phone: '', user: '' });
        fetchParents();
      })
      .catch(err => console.error('Error saving parent:', err));
  };

  // const handleEdit = (parent) => {
  //   setEditingParent(parent);
  //   setFormData({
  //     user: parent.user_id,
  //     phone: parent.phone || ''
  //   });
  //   setShowModal(true);
  // };

  const handleDelete = (id) => {
    if (window.confirm('Θέλεις σίγουρα να διαγράψεις αυτόν τον γονέα;')) {
      api.delete(`/parents/${id}/`)
        .then(() => fetchParents())
        .catch(err => console.error('Error deleting parent:', err));
    }
  };

  if (loading) return <Spinner animation="border" className="mt-5" />;

  return (
    <div className="container mt-4">
      <h2>Parents List</h2>

      <Button className="mb-3" onClick={() => {
        setEditingParent(null);
        setFormData({ phone: '', user: '' });
        setShowModal(true);
      }}>
         Add Parent
      </Button>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Contact</th>
            {/* <th>Student</th> */}
            <th>Finance</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {parents.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.phone || '—'}</td>
              {/* <td>{p.student?.name || '—'}</td> */}
              <td>{p.finance?.length || 0} records</td>
              <td>
                {/* <Button variant="warning" size="sm" onClick={() => handleEdit(p)}>Edit</Button>{' '} */}
                <Button variant="danger" size="sm" onClick={() => handleDelete(p.id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingParent ? 'Edit Parent' : 'Add New Parent'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Select User</Form.Label>
              <Form.Select
                value={formData.user}
                onChange={(e) => setFormData({ ...formData, user: e.target.value })}
                disabled={!!editingParent}
              >
                <option value="">-- Select Parent User --</option>
                {parentUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Contact Number</Form.Label>
              <Form.Control
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!formData.user}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default ParentList;

import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { getRole } from '../../services/tokenUtils';




function FinancialRecords() {
  const [records, setRecords] = useState([]);
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    student: '',
    amount: '',
    date: '',
    description: '',
    status: 'unpaid'
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchRecords();
    fetchStudents();
  }, []);

  const fetchRecords = () => {
    api.get('/financial_records/')
      .then(res => setRecords(res.data))
      .catch(err => {
        console.error('Error fetching records:', err);
        if (err.response?.status === 401) navigate('/login');
      });
  };

  const fetchStudents = () => {
    api.get('/students/')
      .then(res => setStudents(res.data))
      .catch(err => console.error('Error fetching students:', err));
  };

  const handleSave = () => {
    if (role === 'parent') return;
    const endpoint = editingRecord
      ? `/financial_records/${editingRecord.id}/`
      : '/financial_records/';
    const method = editingRecord ? 'put' : 'post';

    api[method](endpoint, formData)
      .then(() => {
        setShowModal(false);
        setEditingRecord(null);
        setFormData({
          student: '',
          amount: '',
          date: '',
          description: '',
          status: 'unpaid'
        });
        fetchRecords();
      })
      .catch(err => console.error('Error saving record:', err));
  };
  const role = getRole();

  const handleEdit = (record) => {
    if (role === 'parent') return;

    setEditingRecord(record);
    setFormData({
      student: record.student,
      amount: record.amount,
      date: record.date,
      description: record.description,
      status: record.status
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (role === 'parent') return;

    if (window.confirm('Are you sure you want to delete this record?')) {
      api.delete(`/financial_records/${id}/`)
        .then(() => fetchRecords())
        .catch(err => console.error('Error deleting record:', err));
    }
  };

  return (
    <div className="container mt-4">
      <h2>Financial Records</h2>

      {role !== 'parent' && (
        <Button className="mb-3" onClick={() => {
          setEditingRecord(null);
          setFormData({
            student: '',
            amount: '',
            date: '',
            description: '',
            status: 'unpaid'
          });
          setShowModal(true);
        }}>
          Add Invoices
        </Button>
      )}

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Student</th>
            <th>Parent</th>
            <th>Amount (€)</th>
            <th>Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.id}>
              <td>{r.student_name}</td>
              <td>{r.parent_name}</td>
              <td>{r.amount}</td>
              <td>{r.date}</td>
              <td>{r.status === 'paid' ? '✅ Paid' : '❌ Unpaid'}</td>
              <td>
                {role !== 'parent' && (
                  <>
                    <Button variant="warning" size="sm" onClick={() => handleEdit(r)}>Edit</Button>{' '}
                    <Button variant="danger" size="sm" onClick={() => handleDelete(r.id)}>Delete</Button>
                  </>
                )}
              </td>

            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal */}
      {role !== 'parent' && (
        <Modal show={showModal} centered onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>{editingRecord ? 'Edit Record' : 'Add New Record'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Select Student</Form.Label>
                <Form.Select
                  value={formData.student}
                  onChange={(e) => setFormData({ ...formData, student: e.target.value })}
                >
                  <option value="">-- Select Student --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Amount (€)</Form.Label>
                <Form.Control
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Date</Form.Label>
                <Form.Control
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                </Form.Select>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} disabled={!formData.student}>
              Save
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
}

export default FinancialRecords;

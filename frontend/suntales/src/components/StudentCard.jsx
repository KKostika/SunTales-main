import React, { useState, useEffect } from 'react';
import { Card, ListGroup, Form, Button, Modal } from 'react-bootstrap';
import api from '../services/api';
import { getRole } from '../services/tokenUtils';

const StudentCard = ({ student, role, currentUserId, onTrackMeal, onEdit }) => {
  const [mealLevel, setMealLevel] = useState(2);
  const [editedAllergies, setEditedAllergies] = useState(student.allergies || '');
  const [isSaving, setIsSaving] = useState(false);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [showParentModal, setShowParentModal] = useState(false);
  const [todayMenu, setTodayMenu] = useState(null);

  const mealLabels = ['🐦 Bird skip', '🐭 Mouse nibble', '🐼 Panda munch', '🦁 Lion feast'];
  const userRole = getRole();
  const parentUserIds = student.parent_details?.map(p => Number(p.user_id)) || [];
  const canEdit = userRole === 'admin' || (userRole === 'parent' && parentUserIds.includes(currentUserId));

  useEffect(() => {
    setEditedAllergies(student.allergies || '');
  }, [student.allergies]);

  useEffect(() => {
    const fetchTodayMenu = async () => {
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

      try {
        const res = await api.get('/daily-menus/', { params: { date: today } });
        const menu = res.data.find(m => m.date === today);
        setTodayMenu(menu);
      } catch (err) {
        console.error('Error fetching today\'s menu:', err);
      }
    };

    fetchTodayMenu();
  }, []);

  const handleSubmitMeal = async () => {
    try {
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

      await api.post(`/meals/`, {
        student: student.id,
        meal: 'lunch',
        date: today,
        status: mealLevel
      });

      alert('Meal tracked successfully!');
      if (onTrackMeal) onTrackMeal(student.id, mealLevel);
    } catch (error) {
      console.error('Meal tracking error:', error);
      alert('Failed to track meal.');
    }
  };

  const updateAllergies = async () => {
    setIsSaving(true);
    try {
      await api.patch(`/students/${student.id}/`, {
        allergies: editedAllergies
      });
      alert('Information updated successfully!');
    } catch (error) {
      alert('Error updating information.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (studentId) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;

    try {
      await api.delete(`/students/${studentId}/`);
      alert('Student deleted successfully!');
      if (typeof onDelete === 'function') {
        onDelete(studentId); // ενημερώνει τον γονέα
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete student.');
    }
  };


  return (
    <>
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Card.Title>{student.name ?? 'No Name'}</Card.Title>

          <Button variant="warning" className="mt-2 me-2" onClick={() => onEdit(student)}>
            Edit Student
          </Button>

          <ListGroup variant="flush" className="mb-3">
            <ListGroup.Item><strong>Age:</strong> {student.age ?? '—'}</ListGroup.Item>
            <ListGroup.Item><strong>Classroom:</strong> {student.classroom?.name ?? '—'}</ListGroup.Item>
          </ListGroup>

          {student.teacher_details && (
            <Button variant="light" onClick={() => setShowTeacherModal(true)}>
              👩‍🏫 View Teacher Info
            </Button>
          )}

          {student.parent_details?.length > 0 && (
            <Button variant="light" onClick={() => setShowParentModal(true)}>
              👨‍👩‍👧 View Parent Info
            </Button>
          )}

          <Form.Group controlId={`menu.lunch-${student.id}`} className="mt-3">
            <Form.Label>
              {todayMenu?.lunch
                ? `${todayMenu.lunch}: ${mealLabels[mealLevel]}`
                : `Today's Lunch: ${mealLabels[mealLevel]}`}
            </Form.Label>
            <Form.Range
              min={0}
              max={3}
              value={mealLevel}
              onChange={(e) => setMealLevel(parseInt(e.target.value))}
            />
          </Form.Group>

          <Button variant="primary" className="mt-2" onClick={handleSubmitMeal}>
            Track: {mealLabels[mealLevel]} (Lunch)
          </Button>

          <Form.Group controlId={`allergies-${student.id}`} className="mt-3">
            <Form.Label>Medical Information / Allergies</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={editedAllergies}
              onChange={(e) => setEditedAllergies(e.target.value)}
              disabled={!canEdit}
            />
          </Form.Group>

          <Button
            variant="warning"
            className="mt-2 me-2"
            disabled={!canEdit || isSaving}
            onClick={updateAllergies}
          >
            {isSaving ? 'Saving...' : 'Save Medical Information'}
          </Button>

          <Button
            variant="danger"
            className="mt-2"
            onClick={() => handleDelete(student.id)}
          >
            Delete Student
          </Button>
        </Card.Body>
      </Card>

      {/* Teacher Modal */}
      <Modal show={showTeacherModal} onHide={() => setShowTeacherModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Teacher Info</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p><strong>Name:</strong> {student.teacher_details?.name ?? '—'}</p>
          <p><strong>Email:</strong> {student.teacher_details?.email ?? '—'}</p>
          <p><strong>Phone:</strong> {student.teacher_details?.phone ?? '—'}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTeacherModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Parent Modal */}
      <Modal show={showParentModal} onHide={() => setShowParentModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Parent Info</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {student.parent_details?.map((p, idx) => (
            <div key={idx} className="mb-3">
              <p><strong>Name:</strong> {p.name ?? '—'}</p>
              <p><strong>Email:</strong> {p.user?.email ?? '—'}</p>
              <p><strong>Phone:</strong> {p.phone ?? '—'}</p>
              <hr />
            </div>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowParentModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default StudentCard;









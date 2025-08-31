import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Modal, Button, Form } from 'react-bootstrap';
import api from '../services/api';
import { getRole, getUserId } from '../services/tokenUtils';

function Meals() {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [mealRecords, setMealRecords] = useState([]);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const role = getRole();
  const userId = getUserId();

  // 🔹 Fetch students
  useEffect(() => {
    if (role === 'admin') {
      api.get('/students/')
        .then(res => setStudents(res.data))
        .catch(err => console.error('Error fetching students:', err));
    } else if (role === 'parent') {
      api.get(`/parents/${userId}/`)
        .then(res => {
          const studentList = res.data.students || [res.data.student];
          setStudents(studentList);
          if (studentList.length === 1) {
            setSelectedStudentId(studentList[0].id);
          }
        })
        .catch(err => console.error('Error fetching parent student:', err));
    }
  }, [role, userId]);

  // 🔹 Fetch meals
  useEffect(() => {
    if (selectedStudentId) {
      api.get('/meals/', {
        params: { student: selectedStudentId }
      })
        .then(res => setMealRecords(res.data))
        .catch(err => console.error('Error fetching meals:', err));
    }
  }, [selectedStudentId]);

  // 🔹 Convert meals to calendar events
  const mealEvents = mealRecords.map(meal => ({
    title: meal.notes || 'Meal',
    date: meal.date,
    extendedProps: { ...meal }
  }));

  const handleDateClick = (arg) => {
    const clickedMeal = mealRecords.find(m => m.date === arg.dateStr);
    if (clickedMeal) {
      setSelectedMeal(clickedMeal);
      setShowModal(true);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">🍽️ Meal Calendar</h2>

      {(role === 'admin' || (role === 'parent' && students.length > 1)) && (
        <Form.Group className="mb-3">
          <Form.Label>Select Student</Form.Label>
          <Form.Select
            value={selectedStudentId || ''}
            onChange={(e) => setSelectedStudentId(e.target.value)}
          >
            <option value="">-- Select --</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </Form.Select>
        </Form.Group>
      )}

      {selectedStudentId && (
        <div className="border rounded shadow-sm mb-4 p-3">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={mealEvents}
            dateClick={handleDateClick}
            height="auto"
            locale="el"
          />
        </div>
      )}

      {/* 📋 Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Meal Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedMeal ? (
            <>
              <p><strong>Date:</strong> {selectedMeal.date}</p>
              <p><strong>Notes:</strong> {selectedMeal.notes}</p>
            </>
          ) : (
            <p>No meal data available.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Κλείσιμο</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Meals;

import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import api from '../../services/api';

const DashboardCalendar = ({ role }) => {
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({ title: '', time: '', date: '', description: '' });
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = () => {
    api.get('/events/')
      .then(res => {
        const formattedEvents = res.data.map(ev => ({
          id: ev.id,
          title: ev.title,
          start: ev.date,
          extendedProps: {
            description: ev.description,
            time: ev.date.split('T')[1]
          }
        }));
        setEvents(formattedEvents);
      })
      .catch(err => console.error('Error fetching events:', err));
  };

  const handleAddEvent = () => {
    if (!newEvent.date || !newEvent.title) {
      setFormError('Παρακαλώ συμπληρώστε τουλάχιστον ημερομηνία και τίτλο.');
      return;
    }

    const payload = {
      title: newEvent.title,
      date: `${newEvent.date}T${newEvent.time}`,
      description: newEvent.description
    };

    api.post('/events/', payload)
      .then(() => {
        fetchEvents();
        setShowEventModal(false);
        setNewEvent({ title: '', time: '', date: '', description: '' });
        setFormError('');
      })
      .catch(err => {
        console.error('Error adding event:', err);
        setFormError('Παρουσιάστηκε σφάλμα κατά την αποθήκευση.');
      });
  };

  const handleDeleteEvent = (id) => {
    api.delete(`/events/${id}/`)
      .then(() => {
        fetchEvents();
        setShowDetailsModal(false);
        setSelectedEvent(null);
      })
      .catch(err => console.error('Error deleting event:', err));
  };

  const handleEventClick = (info) => {
    setSelectedEvent(info.event);
    setShowDetailsModal(true);
  };

  const handleDateClick = (info) => {
    setNewEvent({ ...newEvent, date: info.dateStr });
    setFormError('');
    setShowEventModal(true);
  };

  return (
    <section id="events" className="mt-5">
      <h4 className="mb-3 text-center">📅 Ημερολόγιο Εκδηλώσεων</h4>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          height="auto"
          contentHeight="auto"
          dateClick={role === 'admin' ? handleDateClick : null}
          eventClick={handleEventClick}
        />
      </div>

      {role === 'admin' && (
        <Modal show={showEventModal} onHide={() => {
          setShowEventModal(false);
          setFormError('');
        }} centered>
          <Modal.Header closeButton>
            <Modal.Title>Προσθήκη Εκδήλωσης</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {formError && (
              <div className="alert alert-danger" role="alert">
                {formError}
              </div>
            )}
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Τίτλος</Form.Label>
                <Form.Control
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Ώρα</Form.Label>
                <Form.Control
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Περιγραφή</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => {
              setShowEventModal(false);
              setFormError('');
            }}>Άκυρο</Button>
            <Button variant="success" onClick={handleAddEvent}>Αποθήκευση</Button>
          </Modal.Footer>
        </Modal>
      )}

      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Λεπτομέρειες Εκδήλωσης</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEvent && (
            <>
              <p><strong>Title:</strong> {selectedEvent.title}</p>
              <p><strong>Date:</strong> {selectedEvent.start ? new Date(selectedEvent.start).toLocaleDateString() : '—'}</p>
              <p><strong>Time:</strong> {selectedEvent.start ? new Date(selectedEvent.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</p>
              <p><strong>Description:</strong> {selectedEvent.extendedProps?.description}</p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>Close</Button>
          {role === 'admin' && (
            <Button variant="danger" onClick={() => {
              if (window.confirm('Are you sure you want to delete this event?')) {
                handleDeleteEvent(selectedEvent.id);
              }
            }}>
              Delete
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </section>
  );
};

export default DashboardCalendar;
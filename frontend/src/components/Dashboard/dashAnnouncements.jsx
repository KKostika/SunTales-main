import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Modal, Button, Form } from 'react-bootstrap';
import api from '../../services/api';

const DashboardAnnouncements = ({ role }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', summary: '', date: '' });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = () => {
    api.get('/announcements/')
      .then(res => setAnnouncements(res.data))
      .catch(err => console.error('Error fetching announcements:', err));
  };

  const handleAddAnnouncement = () => {
    api.post('/announcements/', newAnnouncement)
      .then(() => {
        fetchAnnouncements(); 
        setShowAnnouncementModal(false);
        setNewAnnouncement({ title: '', summary: '', date: '' });
      })
      .catch(err => console.error('Error adding announcement:', err));
  };

  const handleDeleteAnnouncement = (id) => {
    api.delete(`/announcements/${id}/`)
      .then(() => {
        setAnnouncements(prev => prev.filter(a => a.id !== id));
      })
      .catch(err => console.error('Error deleting announcement:', err));
  };

  return (
    <section id="news" className="mt-5">
      <Container>
        <Row className="mb-3">
          <Col><h4>News & Announcements</h4></Col>
          {role === 'admin' && (
            <Col className="text-end">
              <Button variant="primary" onClick={() => setShowAnnouncementModal(true)}>
                ➕ Προσθήκη Ανακοίνωσης
              </Button>
            </Col>
          )}
        </Row>

        <Row xs={1} md={2} lg={3} className="g-4">
          {announcements.map((item) => (
            <Col key={item.id}>
              <Card
                onClick={() => setSelectedAnnouncement(item)}
                style={{ cursor: 'pointer', height: '100%' }}
              >
                <Card.Body>
                  <Card.Title>{item.title}</Card.Title>
                  <Card.Text>
                    {item.summary.length > 100
                      ? item.summary.slice(0, 100) + '...'
                      : item.summary}
                  </Card.Text>
                  <small className="text-muted">{item.date}</small>
                </Card.Body>
                {role === 'admin' && (
                  <Card.Footer className="text-end">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAnnouncement(item.id);
                      }}
                    >
                      🗑️
                    </Button>
                  </Card.Footer>
                )}
              </Card>
            </Col>
          ))}
        </Row>

        <Modal
          show={!!selectedAnnouncement}
          onHide={() => setSelectedAnnouncement(null)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>{selectedAnnouncement?.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p><strong>Date:</strong> {selectedAnnouncement?.date}</p>
            <p>{selectedAnnouncement?.summary}</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setSelectedAnnouncement(null)}>Κλείσιμο</Button>
          </Modal.Footer>
        </Modal>

        <Modal
          show={showAnnouncementModal}
          onHide={() => setShowAnnouncementModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Νέα Ανακοίνωση</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Τίτλος</Form.Label>
                <Form.Control
                  type="text"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Περίληψη</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  style={{ maxHeight: '200px', overflowY: 'auto', resize: 'vertical' }}
                  value={newAnnouncement.summary}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, summary: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Ημερομηνία</Form.Label>
                <Form.Control
                  type="date"
                  value={newAnnouncement.date}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, date: e.target.value })}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAnnouncementModal(false)}>Άκυρο</Button>
            <Button variant="success" onClick={handleAddAnnouncement}>Αποθήκευση</Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </section>
  );
};

export default DashboardAnnouncements;
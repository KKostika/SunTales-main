import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Form } from 'react-bootstrap';
import api from '../../services/api';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { getRole } from '../../services/tokenUtils';

function ActivitiesGallery() {
  const [activities, setActivities] = useState([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxSlides, setLightboxSlides] = useState([]);
  const [editingActivityId, setEditingActivityId] = useState(null);
  const [editedName, setEditedName] = useState('');
  const [editedDate, setEditedDate] = useState('');
  const [editedClassId, setEditedClassId] = useState('');
  const [classrooms, setClassrooms] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);

  const userRole = getRole();
  const canEdit = userRole === 'admin' || userRole === 'teacher';
  const canDelete = canEdit;

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await api.get('/activities/');
        const sortedActivities = res.data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setActivities(sortedActivities);
      } catch (err) {
        console.error('Error fetching activities:', err);
      }
    };

    const fetchClassrooms = async () => {
      if (!canEdit) return;
      try {
        const res = await api.get('/classrooms/');
        setClassrooms(res.data);
      } catch (err) {
        console.error('Error fetching classrooms:', err);
      }
    };

    fetchActivities();
    fetchClassrooms();
  }, []);

  const openAlbum = (activity) => {
    const slides = activity.photos.map(p => ({
      src: p.image,
      description: p.caption
    }));
    setLightboxSlides(slides);
    setLightboxIndex(0);
    setLightboxOpen(true);
    setSelectedActivity(activity);
  };

  const handleDownload = (photo) => {
    const link = document.createElement('a');
    link.href = photo.image;
    link.download = photo.caption || 'photo.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const editActivity = (activity) => {
    setEditingActivityId(activity.id);
    setEditedName(activity.name);
    setEditedDate(activity.date);
    setEditedClassId(activity.classroom?.id || '');
  };

  const saveActivity = async (activityId) => {
    try {
      await api.patch(`/activities/${activityId}/`, {
        name: editedName,
        date: editedDate,
        classroom_id: editedClassId
      });

      setActivities(prev =>
        prev.map(a =>
          a.id === activityId
            ? { ...a, name: editedName, date: editedDate, classroom: { ...a.classroom, id: editedClassId } }
            : a
        )
      );

      setEditingActivityId(null);
      setEditedName('');
      setEditedDate('');
      setEditedClassId('');
    } catch (err) {
      console.error('Failed to update activity:', err);
      alert('Failed to update activity.');
    }
  };

  const deleteActivity = async (activityId) => {
    const confirm = window.confirm('Are you sure you want to delete this activity?');
    if (!confirm) return;

    try {
      await api.delete(`/activities/${activityId}/`);
      setActivities(prev => prev.filter(a => a.id !== activityId));
    } catch (err) {
      console.error('Delete activity failed:', err);
      alert('Failed to delete activity.');
    }
  };

  return (
    <div className="container mt-4">
      {activities.length === 0 ? (
        <p>No available activities.</p>
      ) : (
        <Row>
          {activities.map(activity => (
            <Col key={activity.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
              <Card className="shadow-sm">
                <Card.Img
                  src={activity.photos[0]?.image || '/placeholder.jpg'}
                  onClick={() => openAlbum(activity)}
                  style={{
                    height: '200px',
                    objectFit: 'cover',
                    cursor: 'pointer',
                    borderRadius: '0.5rem 0.5rem 0 0'
                  }}
                />
                <Card.Body>
                  {editingActivityId === activity.id ? (
                    <Form>
                      <Form.Group className="mb-2">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                          type="text"
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                        />
                      </Form.Group>

                      <Form.Group className="mb-2">
                        <Form.Label>Date</Form.Label>
                        <Form.Control
                          type="date"
                          value={editedDate}
                          onChange={(e) => setEditedDate(e.target.value)}
                        />
                      </Form.Group>

                      <Form.Group className="mb-2">
                        <Form.Label>Classroom</Form.Label>
                        <Form.Select
                          value={editedClassId}
                          onChange={(e) => setEditedClassId(e.target.value)}
                        >
                          <option value="">-- Select Classroom --</option>
                          {classrooms.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>

                      <Button variant="outline-success" size="sm" onClick={() => saveActivity(activity.id)}>
                        Save
                      </Button>
                    </Form>
                  ) : (
                    <>
                      <Card.Title className="d-flex justify-content-between align-items-center">
                        {activity.name}
                        {canEdit && (
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => editActivity(activity)}
                            title="Επεξεργασία"
                          >
                            ✏️
                          </Button>
                        )}
                      </Card.Title>
                      <Card.Text className="text-muted">Date: {activity.date}</Card.Text>
                      <Card.Text>Photos: {activity.photos.length}</Card.Text>
                      <Card.Text>Classroom: {activity.classroom?.name || 'Unknown'}</Card.Text>
                    </>
                  )}

                  {canDelete && (
                    <Button
                      variant="link"
                      size="sm"
                      className="text-danger p-0"
                      onClick={() => deleteActivity(activity.id)}
                      title="Delete Activity"
                    >
                      🗑️
                    </Button>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {lightboxOpen && selectedActivity && (
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          slides={lightboxSlides}
          index={lightboxIndex}
          onIndexChange={setLightboxIndex}
        />
      )}
    </div>
  );
}

export default ActivitiesGallery;

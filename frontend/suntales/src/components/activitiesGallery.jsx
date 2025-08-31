import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Form, Modal } from 'react-bootstrap';
import api from '../services/api';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { getRole } from '../services/tokenUtils';

function ActivitiesGallery({ studentClassId }) {
  const [activities, setActivities] = useState([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxSlides, setLightboxSlides] = useState([]);
  const [editingActivityId, setEditingActivityId] = useState(null);
  const [editedName, setEditedName] = useState('');
  const [selectedActivity, setSelectedActivity] = useState(null);

  const userRole = getRole();
  const canEdit = userRole === 'admin' || userRole === 'teacher';
  const canDelete = canEdit;

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const endpoint =
          canDelete || !studentClassId
            ? '/activities/'
            : `/activities/?classroom=${studentClassId}`;
        const res = await api.get(endpoint);

        // Ταξινόμηση με βάση την ημερομηνία (πιο πρόσφατη πρώτα)
        const sortedActivities = res.data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setActivities(sortedActivities);
      } catch (err) {
        console.error('Error fetching activities:', err);
      }
    };


    fetchActivities();
  }, [studentClassId, canDelete]);

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

  const editActivityName = (activity) => {
    setEditingActivityId(activity.id);
    setEditedName(activity.name);
  };

  const saveActivityName = async (activityId) => {
    try {
      await api.patch(`/activities/${activityId}/`, { name: editedName });
      setActivities(prev =>
        prev.map(a =>
          a.id === activityId ? { ...a, name: editedName } : a
        )
      );
      setEditingActivityId(null);
      setEditedName('');
    } catch (err) {
      console.error('Failed to update activity name:', err);
      alert('Η ενημέρωση του ονόματος απέτυχε.');
    }
  };

  const deleteActivity = async (activityId) => {
    const confirm = window.confirm('Διαγραφή ολόκληρης δραστηριότητας;');
    if (!confirm) return;

    try {
      await api.delete(`/activities/${activityId}/`);
      setActivities(prev => prev.filter(a => a.id !== activityId));
    } catch (err) {
      console.error('Delete activity failed:', err);
      alert('Η διαγραφή απέτυχε.');
    }
  };

  return (
    <div className="container mt-4">
      {activities.length === 0 ? (
        <p>Δεν υπάρχουν δραστηριότητες προς προβολή.</p>
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
                    <>
                      <Form.Control
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="mb-2"
                      />
                      <Button
                        variant="outline-success"
                        size="sm"
                        onClick={() => saveActivityName(activity.id)}
                      >
                        Αποθήκευση
                      </Button>
                    </>
                  ) : (
                    <>
                      <Card.Title className="d-flex justify-content-between align-items-center">
                        {activity.name}
                        {canEdit && (
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => editActivityName(activity)}
                            title="Επεξεργασία"
                          >
                            ✏️
                          </Button>
                        )}
                      </Card.Title>
                    </>
                  )}
                  <Card.Text className="text-muted">Ημερομηνία: {activity.date}</Card.Text>
                  <Card.Text>{activity.photos.length} φωτογραφίες</Card.Text>
                  {canDelete && (
                    <Button
                      variant="link"
                      size="sm"
                      className="text-danger p-0"
                      onClick={() => deleteActivity(activity.id)}
                      title="Διαγραφή Δραστηριότητας"
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





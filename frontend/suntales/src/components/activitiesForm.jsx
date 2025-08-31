import React, { useState, useEffect, useRef } from 'react';
import { Form, Button, Card, Spinner, Alert, Image } from 'react-bootstrap';
import api from '../services/api';
import { getRole } from '../services/tokenUtils';

function ActivitiesForm() {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [classId, setClassId] = useState('');
  const [classrooms, setClassrooms] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const userRole = getRole();
  const canUpload = userRole === 'admin' || userRole === 'teacher';

  useEffect(() => {
    if (canUpload) {
      api.get('/classrooms/')
        .then(res => setClassrooms(res.data))
        .catch(err => console.error('Error fetching classrooms:', err));
    }
  }, [canUpload]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files).filter(file => file instanceof File);
    setPhotos(prev => [...prev, ...selectedFiles]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).filter(file => file instanceof File);
    setPhotos(prev => [...prev, ...droppedFiles]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleRemovePhoto = (indexToRemove) => {
    setPhotos(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleUpload = async () => {
    if (!name || !date || !classId || photos.length === 0) return;

    setUploading(true);
    setSuccess(false);
    setError('');

    try {
      const activityRes = await api.post('/activities/', {
        name,
        date,
        classroom_id: classId
      });

      const activityId = activityRes.data.id;

      for (let index = 0; index < photos.length; index++) {
        const formData = new FormData();
        formData.append('image', photos[index]);
        formData.append('caption', caption);
        formData.append('activity', activityId);

        await api.post('/activities_photos/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      setSuccess(true);
      setName('');
      setDate('');
      setClassId('');
      setPhotos([]);
      setCaption('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Η αποστολή απέτυχε. Δοκιμάστε ξανά.');
    }

    setUploading(false);
  };

  if (!canUpload) {
    return (
      <Alert variant="warning" className="mt-4">
        Δεν έχετε δικαίωμα να προσθέσετε δραστηριότητες.
      </Alert>
    );
  }

  return (
    <div className="container mt-4">
      <h3>📸 Δημιουργία Δραστηριότητας & Ανέβασμα Φωτογραφιών</h3>

      {success && <Alert variant="success">Η δραστηριότητα και οι φωτογραφίες ανέβηκαν με επιτυχία!</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      <Form>
        <Form.Group className="mb-3">
          <Form.Label>Όνομα Δραστηριότητας</Form.Label>
          <Form.Control
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Ημερομηνία</Form.Label>
          <Form.Control
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Τάξη</Form.Label>
          <Form.Select
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            required
          >
            <option value="">-- Επιλέξτε Τάξη --</option>
            {classrooms.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Επιλογή Φωτογραφιών</Form.Label>
          <Form.Control
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            ref={fileInputRef}
          />
        </Form.Group>

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          style={{
            border: '2px dashed #ccc',
            padding: '20px',
            borderRadius: '10px',
            textAlign: 'center',
            marginBottom: '20px',
            backgroundColor: '#f9f9f9'
          }}
        >
          Σύρετε τις φωτογραφίες εδώ για ανέβασμα
        </div>

        {photos.length > 0 && (
          <div className="mb-3">
            <h5>Προεπισκόπηση Φωτογραφιών</h5>
            {photos.map((photo, index) => (
              <Card key={index} className="mb-2">
                <Card.Body className="d-flex align-items-center">
                  <Image
                    src={URL.createObjectURL(photo)}
                    alt={photo.name}
                    thumbnail
                    style={{ maxHeight: '150px', objectFit: 'cover', marginRight: '15px' }}
                  />
                  <div className="flex-grow-1">
                    <Card.Text>{photo.name}</Card.Text>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleRemovePhoto(index)}
                    >
                      ❌ Αφαίρεση
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            ))}
            <Form.Group className="mt-3">
              <Form.Label>Κοινή Λεζάντα για Όλες τις Φωτογραφίες</Form.Label>
              <Form.Control
                type="text"
                placeholder="Προσθέστε λεζάντα..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
            </Form.Group>
          </div>
        )}

        <Button
          variant="primary"
          onClick={handleUpload}
          disabled={uploading || !name || !date || !classId}
          style={{ textTransform: 'none' }}
        >
          {uploading ? <Spinner animation="border" size="sm" /> : 'Ανέβασμα'}
        </Button>
      </Form>
    </div>
  );
}

export default ActivitiesForm;

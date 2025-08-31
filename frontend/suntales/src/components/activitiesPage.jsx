import React, { useState } from 'react';
import { Container, Button } from 'react-bootstrap';
import ActivitiesGallery from './activitiesGallery';
import ActivitiesForm from './activitiesForm';
import { getRole } from '../services/tokenUtils';

function ActivitiesPage() {
  const userRole = getRole();
  const [showForm, setShowForm] = useState(false);

  const toggleForm = () => setShowForm(prev => !prev);

  return (
    <Container className="mt-4">
      <h2>Δραστηριότητες</h2>

      {(userRole === 'admin' || userRole === 'teacher') && (
        <>
          <Button variant="primary" className='mt-2'  style={{ textTransform: 'none' }} onClick={toggleForm}>
            {showForm ? 'Hide Form' : 'Add Activity'}
          </Button>

          {showForm && (
            <>
              <ActivitiesForm />
              <hr />
            </>
          )}
        </>
      )}

      
      <ActivitiesGallery />
    </Container>
  );
}

export default ActivitiesPage;

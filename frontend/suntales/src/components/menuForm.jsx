import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import api from '../services/api';

function MenuForm({ selectedDate, existingMenu, refreshMenus }) {
  const [breakfast, setBreakfast] = useState('');
  const [lunch, setLunch] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (existingMenu) {
      setBreakfast(existingMenu.breakfast || '');
      setLunch(existingMenu.lunch || '');
    } else {
      setBreakfast('');
      setLunch('');
    }
    setMessage(null);
    setError(null);
  }, [existingMenu, selectedDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDate) {
      setError('Δεν έχει επιλεγεί ημερομηνία.');
      return;
    }

    const payload = {
      date: selectedDate.toISOString().split('T')[0],
      breakfast,
      lunch,
    };

    try {
      if (existingMenu) {
        await api.put(`/daily-menus/${existingMenu.id}/`, payload);
        setMessage('The menu was successfully updated.');
      } else {
        await api.post('/daily-menus/', payload);
        setMessage('The menu was successfully added.');
      }
      refreshMenus();
    } catch (err) {
      console.error('Error saving menu:', err);
      setError('Failed to save. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!existingMenu) return;

    const confirmDelete = window.confirm('Are you sure you want to delete the menu?');
    if (!confirmDelete) return;

    try {
      await api.delete(`/daily-menus/${existingMenu.id}/`);
      setMessage('The menu was successfully deleted.');
      setBreakfast('');
      setLunch('');
      refreshMenus();
    } catch (err) {
      console.error('Error deleting menu:', err);
      setError('Failed to delete. Please try again.');
    }
  };

  return (
    <Card>
      <Card.Body>
        <Card.Title>{existingMenu ? 'Edit Menu' : 'Add Menu'}</Card.Title>

        {message && <Alert variant="success">{message}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Date</Form.Label>
            <Form.Control
              type="text"
              value={selectedDate?.toLocaleDateString('el-GR') || ''}
              disabled
            />
          </Form.Group>

        

          <Form.Group className="mb-3">
            <Form.Label>Lunch</Form.Label>
            <Form.Control
              type="text"
              value={lunch}
              onChange={(e) => setLunch(e.target.value)}
              placeholder="e.g. Pasta with meat"
            />
          </Form.Group>

          <Button variant="primary" type="submit">Save</Button>

          {existingMenu && (
            <Button variant="danger" onClick={handleDelete} className="ms-2">
              Delete
            </Button>
          )}
        </Form>
      </Card.Body>
    </Card>
  );
}

export default MenuForm;

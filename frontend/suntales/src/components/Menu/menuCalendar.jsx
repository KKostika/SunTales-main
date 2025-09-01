import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card, Modal, Button } from 'react-bootstrap';
import api from '../../services/api';
import MenuForm from './menuForm';

function WeeklyMenuCalendar() {
  const [menus, setMenus] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      const res = await api.get('/daily-menus/');
      setMenus(res.data);
    } catch (err) {
      console.error('Error fetching menus:', err);
    }
  };

  const getMenuForDate = (dateStr) => {
    return menus.find((menu) => menu.date === dateStr);
  };

  const menuEvents = menus.map(menu => ({
    title: `${menu.lunch}`,
    date: menu.date,
    extendedProps: { ...menu }
  }));

  const handleDateClick = (arg) => {
    setSelectedDate(arg.dateStr);
    setShowModal(true);
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Menu Calendar</h2>

      <div className="mb-4 border rounded shadow-sm p-3">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={menuEvents}
          dateClick={handleDateClick}
          height="auto"
          locale="el"
        />
      </div>

      {/* 📋 Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Menu for {selectedDate}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedDate ? (
            (() => {
              const menu = getMenuForDate(selectedDate);
              return (
                <>
                  {menu ? (
                    <Card className="mb-3">
                      <Card.Body>
                        <Card.Text><strong>Lunch:</strong> {menu.lunch}</Card.Text>
                      </Card.Body>
                    </Card>
                  ) : (
                    <p>No Menu Available</p>
                  )}
                  <MenuForm
                    selectedDate={new Date(selectedDate)}
                    existingMenu={menu}
                    refreshMenus={fetchMenus}
                  />
                </>
              );
            })()
          ) : null}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Κλείσιμο</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default WeeklyMenuCalendar;

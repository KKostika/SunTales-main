import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Carousel, Button } from 'react-bootstrap';
import { isAuthenticated, getRole } from '../../services/tokenUtils';
import api from '../../services/api';

import duckInClass from '../../assets/images/ducksInClass.jpg';
import Adventure from '../../assets/images/Adventures.jpg';
import Yummy from '../../assets/images/Yummy.jpg';
import financial from '../../assets/images/financial.jpg';

import DashboardCalendar from './dashboardCalendar';
import DashboardAnnouncements from './dashAnnouncements';

const dashboardSlides = [
  {
    id: 1,
    title: "Welcome to Our Space",
    description: "A glimpse into our daily life and joyful learning moments.",
    image: duckInClass,
    link: "#news"
  },
  {
    id: 2,
    title: "Activities & Excursions",
    description: "Stay updated on upcoming events and classroom adventures.",
    image: Adventure,
    link: "/activities"
  },
  {
    id: 3,
    title: "Nutrition & Care",
    description: "Check out this week’s menu and health updates.",
    image: Yummy,
    link: "/daily-menus"
  },
  {
    id: 4,
    title: "Tuition & Budget",
    description: "Overview of fees, payments, and financial planning.",
    image: financial,
    link: "/financial_records"
  }
];

const Dashboard = () => {
  const navigate = useNavigate();
  const role = getRole();

  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

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
      });

    api.get('/announcements/')
      .then(res => setAnnouncements(res.data));
  }, [navigate]);

  // ✅ Ενσωματωμένη συνάρτηση για scroll ή πλοήγηση
  const handleClick = (link) => {
    if (link.startsWith("#")) {
      const target = document.querySelector(link);
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate(link);
    }
  };

  return (
    <section id="home" className='hero-block'>
      <Carousel className="hero-block mb-5">
        {dashboardSlides.map((slide) => (
          <Carousel.Item key={slide.id}>
            <img
              src={slide.image}
              alt={slide.title}
              className="d-block w-100"
              style={{ width: '100%' }}
            />
            <Carousel.Caption>
              <h5>{slide.title}</h5>
              <p>{slide.description}</p>
              <Button className='btn btn-primary mt-3' onClick={() => handleClick(slide.link)}>
                Learn More
              </Button>
            </Carousel.Caption>
          </Carousel.Item>
        ))}
      </Carousel>

      <DashboardAnnouncements role={role} initialAnnouncements={announcements} />
      <DashboardCalendar role={role} initialEvents={events} />
    </section>
  );
};

export default Dashboard;

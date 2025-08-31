import React, { useEffect, useState } from "react";
import StudentCard from './StudentCard';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Alert,
  Spinner,
  Button,
  Modal,
  Form
} from 'react-bootstrap';
import api from '../services/api';

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    age: '',
    classroom: '',
    teacher: '',
    parentId: ''
  });

  const [parents, setParents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const navigate = useNavigate();

  const handleEditStudent = (student) => {
    setFormData({
      id: student.id,
      name: student.name || '',
      age: student.age || '',
      classroom: student.classroom?.id || '',
      teacher: student.teacher_details?.id || '',
      parentId: student.parent_details?.[0]?.id || ''
    });
    setShowModal(true);
  };

  const handleUpdateStudent = async () => {
    if (!formData.age || isNaN(formData.age) || Number(formData.age) <= 0) {
      alert('Η ηλικία πρέπει να είναι έγκυρος αριθμός μεγαλύτερος του 0.');
      return;
    }

    try {
      await api.patch(`/students/${formData.id}/`, {
        name: formData.name,
        age: Number(formData.age),
        classroom: Number(formData.classroom),
        teacher: Number(formData.teacher)
      });

      setStudents(prev =>
        prev.map(s => (s.id === formData.id ? { ...s, ...formData } : s))
      );

      alert('Ο μαθητής ενημερώθηκε!');
      setShowModal(false);
    } catch (err) {
      console.error('Error updating student:', err);
    }
  };

  const handleSubmit = async () => {
    if (!formData.age || isNaN(formData.age) || Number(formData.age) <= 0) {
      alert('Η ηλικία πρέπει να είναι έγκυρος αριθμός μεγαλύτερος του 0.');
      return;
    }

    const parentExists = parents.some(p => p.id === Number(formData.parentId));
    if (!parentExists) {
      alert('Ο γονέας δεν υπάρχει ή δεν έχει φορτωθεί σωστά.');
      return;
    }

    try {
      const res = await api.post('/students/', {
        name: formData.name,
        age: Number(formData.age),
        classroom: Number(formData.classroom),
        teacher: Number(formData.teacher),
        enrollment_date: new Date().toISOString().split('T')[0],
        parents: [Number(formData.parentId)]
      });

      const newStudent = res.data;
      setStudents(prev => [...prev, newStudent]);
      alert('Ο μαθητής προστέθηκε!');
      setShowModal(false);
      setFormData({ id: '', name: '', age: '', classroom: '', teacher: '', parentId: '' });
    } catch (err) {
      console.error('Error creating student:', err);
    }
  };

useEffect(() => {
  const fetchInit = async () => {
      try {
        const [studentsRes, parentsRes, classroomsRes] = await Promise.all([
          api.get('/students/'),
          api.get('/parent-list/'),
          api.get('/classrooms/')
        ]);

        // 1. Students (paginated ή όχι)
        const studentsData = Array.isArray(studentsRes.data)
          ? studentsRes.data
          : studentsRes.data.results;
        setStudents(studentsData);

        // 2. Raw parents array
        const rawParents = Array.isArray(parentsRes.data)
          ? parentsRes.data
          : parentsRes.data.results;

        console.log("rawParents from API:", rawParents);

        // 3. Κάνουμε map για να συμπληρώσουμε το name
        const mappedParents = rawParents.map(p => ({
          ...p,
          name:
            (p.first_name || p.last_name)
              ? `${p.first_name || ''} ${p.last_name || ''}`.trim()
              : p.name,   // fallback στην ήδη υπάρχουσα p.name
        }));

        console.log("mappedParents:", mappedParents);
        setParents(mappedParents);

        // 4. Classrooms
        setClassrooms(classroomsRes.data);
      } catch (err) {
        console.error("Error in fetchInit:", err);
        setError('Failed to initialize data');
      } finally {
        setLoading(false);
      }
    };

    fetchInit();
  }, []);


  useEffect(() => {
    if (!formData.classroom) {
      setTeachers([]);
      return;
    }

    const fetchTeachers = async () => {
      try {
        const res = await api.get('/teachers/', {
          params: { classroom: formData.classroom }
        });

        // Αν το API σου είναι paginated:
        const list = Array.isArray(res.data)
          ? res.data
          : res.data.results;

        console.log('Fetched teachers:', list);
        setTeachers(list);
      } catch (err) {
        console.error('Error loading teachers:', err);
        setTeachers([]);
      }
    };

    fetchTeachers();
  }, [formData.classroom]);




  const handleTrackMeal = async (studentId, level) => {
    const mealLabels = ['🐦 Bird skip', '🐭 Mouse nibble', '🐼 Panda munch', '🦁 Lion feast'];
    const label = mealLabels[level] || 'Unknown meal level';

    try {
      await api.post(`/students/${studentId}/meals/`, { status: level });
      alert(`Tracked: ${label}`);
    } catch {
      alert('Error tracking meal.');
    }
  };

  const handleDeleteStudent = (id) => {
    setStudents(prev => prev.filter(s => s.id !== id));
  };


    if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  const filteredStudents = students.filter(s => {
    const nameMatch = s.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const classMatch = s.classroom?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return nameMatch || classMatch;
  });


  // Optional: Filter teachers based on selected classroom
  const filteredTeachers = formData.classroom
    ? teachers.filter(t =>
      Array.isArray(t.classrooms) &&
      t.classrooms.some(c => c.id === Number(formData.classroom))
    )
    : [];



  return (
    <Container className="mt-4">
      <h2 className="mb-4 text-center">Student List</h2>
      <Row className="mb-3 justify-content-between align-items-center">
        <Col md={4}>
          <Button className="mb-3" onClick={() => setShowModal(true)}>
            Add Student
          </Button>
        </Col>
        <Col md={7}>
          <input
            type="text"
            className="form-control mb-3"
            placeholder="Search for a student..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}
      {loading ? (
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <Row>
          {filteredStudents.length === 0 ? (
            <Col className="text-center">
              <Alert variant="info">No students to display.</Alert>
            </Col>
          ) : selectedStudent ? (
            <Col md={12}>
              <StudentCard
                student={selectedStudent}
                onTrackMeal={handleTrackMeal}
                onEdit={handleEditStudent}
                onDelete={handleDeleteStudent}
              />
            </Col>
          ) : (
            filteredStudents.map(student => (
              <Col key={student.id} md={4} className="mb-4">
                <StudentCard
                  student={student}
                  onTrackMeal={handleTrackMeal}
                  onEdit={handleEditStudent}
                  onDelete={handleDeleteStudent}
                />
              </Col>
            ))
          )}
        </Row>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{formData.id ? 'Edit Student' : 'Add Student'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Age</Form.Label>
              <Form.Control
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Classroom</Form.Label>
              <Form.Select
                value={formData.classroom}
                onChange={(e) => setFormData({ ...formData, classroom: e.target.value })}
              >
                <option value="">-- Select Classroom --</option>
                {classrooms.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Teacher</Form.Label>
              <Form.Select
                disabled={!formData.classroom || teachers.length === 0}
                value={formData.teacher}
                onChange={(e) =>
                  setFormData({ ...formData, teacher: Number(e.target.value) })
                }
              >
                <option value={''}>-- Select Teacher --</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </Form.Select>
            </Form.Group>

             <Form.Group className="mb-3">
              <Form.Label>Parent</Form.Label>
              <Form.Select
                value={formData.parentId}
                onChange={e => setFormData({ ...formData, parentId: e.target.value })}
              >
                <option value="">-- Select Parent --</option>

                {parents.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}

              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button
            variant="primary"
            onClick={formData.id ? handleUpdateStudent : handleSubmit}
          >
            {formData.id ? 'Update' : 'Save'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default StudentList;

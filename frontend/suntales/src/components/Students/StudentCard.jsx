import React, { useState, useEffect } from 'react';
import { Card, ListGroup, Form, Button, Modal } from 'react-bootstrap';
import api from '../../services/api';
import { getRole } from '../../services/tokenUtils';

const StudentCard = ({ student, role, currentUserId, onTrackMeal, onEdit }) => {
  const [mealLevel, setMealLevel] = useState(2);
  const [editedAllergies, setEditedAllergies] = useState(student.allergies || '');
  const [isSaving, setIsSaving] = useState(false);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [showParentModal, setShowParentModal] = useState(false);
  const [todayMenu, setTodayMenu] = useState(null);

  const mealLabels = ['🐦 Bird skip', '🐭 Mouse nibble', '🐼 Panda munch', '🦁 Lion feast'];
  const userRole = getRole();
  const parentUserIds = student.parent_details?.map(p => Number(p.user_id)) || [];
  const canEdit = userRole === 'admin' || (userRole === 'parent' && parentUserIds.includes(Number(currentUserId)));


  useEffect(() => {
    setEditedAllergies(student.allergies || '');
  }, [student.allergies]);

  useEffect(() => {
    const fetchTodayMenu = async () => {
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

      try {
        const res = await api.get('/daily-menus/', { params: { date: today } });
        const menu = res.data.find(m => m.date === today);
        setTodayMenu(menu);
      } catch (err) {
        console.error('Error fetching today\'s menu:', err);
      }
    };

    fetchTodayMenu();
  }, []);

  const handleSubmitMeal = async () => {
    try {
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

      await api.post(`/meals/`, {
        student: student.id,
        meal: 'lunch',
        date: today,
        status: mealLevel
      });

      alert('Meal tracked successfully!');
      if (onTrackMeal) onTrackMeal(student.id, mealLevel);
    } catch (error) {
      console.error('Meal tracking error:', error);
      alert('Failed to track meal.');
    }
  };

  const updateAllergies = async () => {
    setIsSaving(true);
    try {
      await api.patch(`/students/${student.id}/`, {
        allergies: editedAllergies
      });
      alert('Information updated successfully!');
    } catch (error) {
      alert('Error updating information.');
    } finally {
      setIsSaving(false);
    }
  };


  const updateClassroom = async () => {
    try {
      const response = await api.patch(`/students/${student.id}/`, {
        classroom_id: selectedClassroomId
      });

      alert('Classroom updated successfully!');
      setShowClassroomModal(false);

    } catch (err) {
      if (err.response?.data?.classroom_id) {
        alert(`Error: ${err.response.data.classroom_id.join(', ')}`);
      } else {
        alert('Failed to update. Please try again');
      }
      console.error('Update error:', err);
    }
  };


  const handleDelete = async (studentId) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;

    try {
      await api.delete(`/students/${studentId}/`);
      alert('Student deleted successfully!');
      if (typeof onDelete === 'function') {
        onDelete(studentId); // ενημερώνει τον γονέα
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete student.');
    }


  };
  console.log('User role:', userRole);
  console.log('Current user ID:', currentUserId);
  console.log('Parent user IDs:', parentUserIds);
  console.log('Can edit:', canEdit);


  return (
    <>
      <Card className="shadow-sm mb-4" >
        <Card.Body >
          <Card.Title>{student.name ?? 'No Name'}</Card.Title>
          {userRole !== 'parent' && (
            <Button variant="warning" className="mt-2 me-2" onClick={() => onEdit(student)}>
              Edit Student
            </Button>
          )}
          <ListGroup variant="flush" className="mb-3">
            <ListGroup.Item><strong>Age:</strong> {student.age ?? '—'}</ListGroup.Item>
            <ListGroup.Item><strong>Classroom:</strong> {student.classroom?.name ?? '—'} </ListGroup.Item>
          </ListGroup>

          {student.teacher_details && (
            <Button variant="light" onClick={() => setShowTeacherModal(true)}>
              👩‍🏫 View Teacher Info
            </Button>
          )}

          {student.parent_details?.length > 0 && (
            <Button variant="light" onClick={() => setShowParentModal(true)}>
              👨‍👩‍👧 View Parent Info
            </Button>
          )}
          {userRole !== 'parent' && (
            <Form.Group controlId={`menu.lunch-${student.id}`} className="mt-3">
              <Form.Label>
                {todayMenu?.lunch
                  ? `${todayMenu.lunch}: ${mealLabels[mealLevel]}`
                  : `Today's Lunch: ${mealLabels[mealLevel]}`}
              </Form.Label>
              <Form.Range
                min={0}
                max={3}
                value={mealLevel}
                onChange={(e) => setMealLevel(parseInt(e.target.value))}
              />
            </Form.Group>
          )}
          {userRole !== 'parent' && (
            <Button variant="primary" className="mt-2" onClick={handleSubmitMeal}>
              Track: {mealLabels[mealLevel]}
            </Button>
          )}
          <Form.Group controlId={`allergies-${student.id}`} className="mt-3">
            <Form.Label>Medical Information / Allergies</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={editedAllergies}
              onChange={(e) => setEditedAllergies(e.target.value)}
              disabled={!canEdit}
            />
          </Form.Group>
          {userRole === 'admin' && (
            <>
              <Button
                variant="warning"
                className="mt-2 me-2"
                disabled={!canEdit || isSaving}
                onClick={updateAllergies}
              >
                {isSaving ? 'Saving...' : 'Save Medical Information'}
              </Button>

              <Button
                variant="danger"
                className="mt-2"
                onClick={() => handleDelete(student.id)}
              >
                Delete Student
              </Button>
            </>
          )}

        </Card.Body>
      </Card>

      {/* Teacher Modal */}
      <Modal show={showTeacherModal} centered onHide={() => setShowTeacherModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Teacher Info</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p><strong>Name:</strong> {student.teacher_details?.name ?? '—'}</p>
          <p><strong>Email:</strong> {student.teacher_details?.email ?? '—'}</p>
          <p><strong>Phone:</strong> {student.teacher_details?.phone ?? '—'}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTeacherModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Parent Modal */}
      <Modal show={showParentModal} centered onHide={() => setShowParentModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Parent Info</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {student.parent_details?.map((p, idx) => (
            <div key={idx} className="mb-3">
              <p><strong>Name:</strong> {p.name ?? '—'}</p>
              <p><strong>Email:</strong> {p.user?.email ?? '—'}</p>
              <p><strong>Phone:</strong> {p.phone ?? '—'}</p>
              <hr />
            </div>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowParentModal(false)}>Close</Button>
        </Modal.Footer>

      </Modal>
    </>
  );
};

export default StudentCard;

// import React, { useState, useEffect } from 'react';
// import { Card, ListGroup, Form, Button, Modal } from 'react-bootstrap';
// import api from '../../services/api';
// import { getRole } from '../../services/tokenUtils';

// const StudentCard = ({ student, currentUserId, onTrackMeal, onEdit, onDelete }) => {
//   const [mealLevel, setMealLevel] = useState(2);
//   const [medicalInfoList, setMedicalInfoList] = useState([]);
//   const [newMedicalNote, setNewMedicalNote] = useState('');
//   const [isSavingNote, setIsSavingNote] = useState(false);
//   const [showTeacherModal, setShowTeacherModal] = useState(false);
//   const [showParentModal, setShowParentModal] = useState(false);
//   const [todayMenu, setTodayMenu] = useState(null);

//   const userRole = getRole();
//   const parentUserIds = student.parent_details?.map(p => Number(p.user_id)) || [];
//   const canEditMedical = userRole === 'admin' || (userRole === 'parent' && parentUserIds.includes(Number(currentUserId)));
//   const canDelete = userRole === 'admin';

//   useEffect(() => {
//     const fetchMedicalInfo = async () => {
//       try {
//         const res = await api.get('/medical-info/', { params: { student: student.id } });
//         setMedicalInfoList(res.data);
//       } catch (err) {
//         console.error('Error fetching medical info:', err);
//       }
//     };

//     const fetchTodayMenu = async () => {
//       const now = new Date();
//       const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
//       try {
//         const res = await api.get('/daily-menus/', { params: { date: today } });
//         const menu = res.data.find(m => m.date === today);
//         setTodayMenu(menu);
//       } catch (err) {
//         console.error('Error fetching today\'s menu:', err);
//       }
//     };

//     fetchMedicalInfo();
//     fetchTodayMenu();
//   }, [student.id]);

//   const handleSubmitMeal = async () => {
//     try {
//       const now = new Date();
//       const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

//       await api.post(`/meals/`, {
//         student: student.id,
//         meal: 'lunch',
//         date: today,
//         status: mealLevel
//       });

//       alert('Meal tracked successfully!');
//       if (onTrackMeal) onTrackMeal(student.id, mealLevel);
//     } catch (error) {
//       console.error('Meal tracking error:', error);
//       alert('Failed to track meal.');
//     }
//   };

//   const handleAddMedicalNote = async () => {
//     if (!newMedicalNote.trim()) return;
//     setIsSavingNote(true);
//     try {
//       const res = await api.post('/medical-info/', {
//         student: student.id,
//         note: newMedicalNote
//       });
//       setMedicalInfoList(prev => [res.data, ...prev]);
//       setNewMedicalNote('');
//     } catch (err) {
//       console.error('Error saving medical note:', err);
//       alert('Failed to save medical note.');
//     } finally {
//       setIsSavingNote(false);
//     }
//   };

//   const handleDelete = async () => {
//     if (!window.confirm('Are you sure you want to delete this student?')) return;
//     try {
//       await api.delete(`/students/${student.id}/`);
//       alert('Student deleted successfully!');
//       if (typeof onDelete === 'function') onDelete(student.id);
//     } catch (error) {
//       console.error('Delete error:', error);
//       alert('Failed to delete student.');
//     }
//   };

//   const mealLabels = ['🐦 Bird skip', '🐭 Mouse nibble', '🐼 Panda munch', '🦁 Lion feast'];

//   return (
//     <>
//       <Card className="shadow-sm mb-4">
//         <Card.Body>
//           <Card.Title>{student.name ?? 'No Name'}</Card.Title>

//           {userRole !== 'parent' && (
//             <Button variant="warning" className="mt-2 me-2" onClick={() => onEdit(student)}>
//               Edit Student
//             </Button>
//           )}

//           <ListGroup variant="flush" className="mb-3">
//             <ListGroup.Item><strong>Age:</strong> {student.age ?? '—'}</ListGroup.Item>
//             <ListGroup.Item><strong>Classroom:</strong> {student.classroom?.name ?? '—'}</ListGroup.Item>
//           </ListGroup>

//           {student.teacher_details && (
//             <Button variant="light" onClick={() => setShowTeacherModal(true)}>
//               👩‍🏫 View Teacher Info
//             </Button>
//           )}

//           {student.parent_details?.length > 0 && (
//             <Button variant="light" onClick={() => setShowParentModal(true)}>
//               👨‍👩‍👧 View Parent Info
//             </Button>
//           )}

//           {userRole !== 'parent' && (
//             <>
//               <Form.Group controlId={`menu.lunch-${student.id}`} className="mt-3">
//                 <Form.Label>
//                   {todayMenu?.lunch
//                     ? `${todayMenu.lunch}: ${mealLabels[mealLevel]}`
//                     : `Today's Lunch: ${mealLabels[mealLevel]}`}
//                 </Form.Label>
//                 <Form.Range
//                   min={0}
//                   max={3}
//                   value={mealLevel}
//                   onChange={(e) => setMealLevel(parseInt(e.target.value))}
//                 />
//               </Form.Group>
//               <Button variant="primary" className="mt-2" onClick={handleSubmitMeal}>
//                 Track: {mealLabels[mealLevel]} (Lunch)
//               </Button>
//             </>
//           )}

//           <hr />
//           <h5>Medical Information</h5>

//           {medicalInfoList.length === 0 ? (
//             <p>No medical notes available.</p>
//           ) : (
//             medicalInfoList.map((info, idx) => (
//               <Card key={idx} className="mb-2">
//                 <Card.Body>
//                   <Card.Text>{info.note}</Card.Text>
//                   <Card.Text className="text-muted">
//                     Added: {new Date(info.created_at).toLocaleDateString()}
//                   </Card.Text>
//                 </Card.Body>
//               </Card>
//             ))
//           )}

//           {canEditMedical && (
//             <>
//               <Form.Control
//                 as="textarea"
//                 rows={2}
//                 value={newMedicalNote}
//                 onChange={(e) => setNewMedicalNote(e.target.value)}
//                 placeholder="Add new medical note..."
//               />
//               <Button
//                 variant="success"
//                 className="mt-2"
//                 onClick={handleAddMedicalNote}
//                 disabled={isSavingNote}
//               >
//                 {isSavingNote ? 'Saving...' : 'Add Medical Note'}
//               </Button>
//             </>
//           )}

//           {canDelete && (
//             <Button variant="danger" className="mt-3" onClick={handleDelete}>
//               Delete Student
//             </Button>
//           )}
//         </Card.Body>
//       </Card>

//       {/* Teacher Modal */}
//       <Modal show={showTeacherModal} centered onHide={() => setShowTeacherModal(false)}>
//         <Modal.Header closeButton>
//           <Modal.Title>Teacher Info</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <p><strong>Name:</strong> {student.teacher_details?.name ?? '—'}</p>
//           <p><strong>Email:</strong> {student.teacher_details?.email ?? '—'}</p>
//           <p><strong>Phone:</strong> {student.teacher_details?.phone ?? '—'}</p>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowTeacherModal(false)}>Close</Button>
//         </Modal.Footer>
//       </Modal>

//       {/* Parent Modal */}
//       <Modal show={showParentModal} centered onHide={() => setShowParentModal(false)}>
//         <Modal.Header closeButton>
//           <Modal.Title>Parent Info</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {student.parent_details?.map((p, idx) => (
//             <div key={idx} className="mb-3">
//               <p><strong>Name:</strong> {p.name ?? '—'}</p>
//               <p><strong>Email:</strong> {p.user?.email ?? '—'}</p>
//               <p><strong>Phone:</strong> {p.phone ?? '—'}</p>
//               <hr />
//             </div>
//           ))}
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowParentModal(false)}>Close</Button>
//         </Modal.Footer>
//       </Modal>
//     </>
//   );
// };

// export default StudentCard;







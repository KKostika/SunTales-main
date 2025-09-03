import api from './api'

const StudentsAPI = {
    getAll: () =>api.get('./students'),
    getById: (id) => api.get(`/students/${id}`),
    create: (data) => api.post('/students', data),
    update: (id, data) => api.put(`/students/${id}`, data),
    delete: (id) => api.delete(`/students/${id}`)
};

export default StudentsAPI;
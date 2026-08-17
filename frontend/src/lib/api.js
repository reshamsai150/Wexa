import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

export const getHealth = () => api.get('/health');

export const getJobs = () => api.get('/jobs');
export const getJobById = (id) => api.get(`/jobs/${id}`);

export const getSkills = () => api.get('/skills');
export const getSkillById = (id) => api.get(`/skills/${id}`);

export const getPersons = () => api.get('/person');
export const getPersonById = (id) => api.get(`/person/${id}`);
export const getSkillGaps = (personId, jobId) => api.get(`/person/${personId}/skill-gaps?jobId=${jobId}`);
export const getRecommendations = (personId) => api.get(`/person/${personId}/recommendations`);
export const addPersonSkill = (personId, skillName) => api.post(`/person/${personId}/skills`, { skillName });

export const getJobGraph = (id) => api.get(`/graph/job/${id}`);
export const getSkillGraph = (id) => api.get(`/graph/skill/${id}`);
export const getFullGraph = () => api.get('/graph');

export default api;

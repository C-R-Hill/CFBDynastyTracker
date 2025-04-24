import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export interface Dynasty {
  _id: string;
  name: string;
  startDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDynastyData {
  name: string;
  startDate: string;
}

export interface Coach {
  _id?: string;
  dynastyId: string;
  firstName: string;
  lastName: string;
  college: string;
  wins: number;
  losses: number;
  winPercentage: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCoachData {
  dynastyId: string;
  firstName: string;
  lastName: string;
  college: string;
  wins?: number;
  losses?: number;
}

const api = {
  // Get all dynasties
  getDynasties: async (): Promise<Dynasty[]> => {
    const response = await axios.get(`${API_BASE_URL}/dynasties`);
    return response.data;
  },

  // Get a single dynasty
  getDynasty: async (id: string): Promise<Dynasty> => {
    const response = await axios.get(`${API_BASE_URL}/dynasties/${id}`);
    return response.data;
  },

  // Create a new dynasty
  createDynasty: async (data: CreateDynastyData): Promise<Dynasty> => {
    const response = await axios.post(`${API_BASE_URL}/dynasties`, data);
    return response.data;
  },

  // Update a dynasty
  updateDynasty: async (id: string, data: Partial<CreateDynastyData>): Promise<Dynasty> => {
    const response = await axios.put(`${API_BASE_URL}/dynasties/${id}`, data);
    return response.data;
  },

  // Delete a dynasty
  deleteDynasty: async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/dynasties/${id}`);
  },

  // Coach endpoints
  getCoaches: async (dynastyId: string): Promise<Coach[]> => {
    const response = await axios.get(`${API_BASE_URL}/dynasties/${dynastyId}/coaches`);
    return response.data;
  },

  getCoach: async (dynastyId: string, coachId: string): Promise<Coach> => {
    const response = await axios.get(`${API_BASE_URL}/dynasties/${dynastyId}/coaches/${coachId}`);
    return response.data;
  },

  createCoach: async (data: CreateCoachData): Promise<Coach> => {
    const response = await axios.post(`${API_BASE_URL}/dynasties/${data.dynastyId}/coaches`, data);
    return response.data;
  },

  updateCoach: async (dynastyId: string, coachId: string, data: Partial<CreateCoachData>): Promise<Coach> => {
    const response = await axios.put(`${API_BASE_URL}/dynasties/${dynastyId}/coaches/${coachId}`, data);
    return response.data;
  },

  deleteCoach: async (dynastyId: string, coachId: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/dynasties/${dynastyId}/coaches/${coachId}`);
  },
};

export default api; 
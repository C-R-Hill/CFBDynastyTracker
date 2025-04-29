import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Configure axios defaults
axios.defaults.withCredentials = false;  // Don't send credentials in development
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';

// Add response interceptor for error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
);

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

export interface Season {
  year: number;
  wins: number;
  losses: number;
  isEditable: boolean;
  college: string;
  position: string;
  confChamp: boolean;
  postSeason: 'none' | 'bowl' | 'playoff';
  bowlGame: string;
  bowlOpponent: string;
  bowlResult: boolean;
  playoffSeed?: number;
  playoffResult: 'none' | 'first_round_loss' | 'second_round_loss' | 'semifinal_loss' | 'championship_loss' | 'champion';
}

export interface Coach {
  _id?: string;
  dynastyId: string;
  firstName: string;
  lastName: string;
  college: string;
  position?: string;
  seasons: Season[];
  currentYear: number;
  wins: number;  // Virtual - total career wins
  losses: number;  // Virtual - total career losses
  winPercentage: number;  // Virtual
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCoachData {
  dynastyId: string;
  firstName: string;
  lastName: string;
  college: string;
  position: string;
}

export interface UpdateSeasonData {
  wins?: number;
  losses?: number;
  college?: string;
  position?: string;
  confChamp?: boolean;
  postSeason?: 'none' | 'bowl' | 'playoff';
  bowlGame?: string;
  bowlOpponent?: string;
  bowlResult?: boolean;
  playoffSeed?: number;
  playoffResult?: 'none' | 'first_round_loss' | 'second_round_loss' | 'semifinal_loss' | 'championship_loss' | 'champion';
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

  // Start a new season for all coaches in a dynasty
  startNewSeason: async (dynastyId: string): Promise<Coach[]> => {
    const response = await axios.post(`${API_BASE_URL}/dynasties/${dynastyId}/coaches/start-season`);
    return response.data;
  },

  // Update a specific season for a coach
  updateSeason: async (dynastyId: string, coachId: string, year: number, data: UpdateSeasonData): Promise<Coach> => {
    const response = await axios.put(
      `${API_BASE_URL}/dynasties/${dynastyId}/coaches/${coachId}/seasons/${year}`,
      data
    );
    return response.data;
  },

  // Toggle season editability
  toggleSeasonEdit: async (dynastyId: string, coachId: string, year: number): Promise<Coach> => {
    const response = await axios.put(
      `${API_BASE_URL}/dynasties/${dynastyId}/coaches/${coachId}/seasons/${year}/toggle-edit`
    );
    return response.data;
  },

  // Roll back the current season for all coaches in a dynasty
  rollbackSeason: async (dynastyId: string): Promise<Coach[]> => {
    const response = await axios.post(`${API_BASE_URL}/dynasties/${dynastyId}/coaches/rollback-season`);
    return response.data;
  }
};

export default api; 
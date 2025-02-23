import { describe, it, vi, beforeEach, afterEach, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../context/authContext';
import axios from 'axios';
import AxiosMockAdapter from 'axios-mock-adapter';
import User from '../pages/User';

vi.mock('../components/Navbar', () => ({ default: () => <div>Navbar</div> }));
vi.mock('../components/MobileNavbar', () => ({ default: () => <div>MobileNavbar</div> }));
vi.mock('../components/MediaList', () => ({ default: () => <div>MediaList</div> }));
vi.mock('../components/Watchlist', () => ({ default: () => <div>Watchlist</div> }));

describe('User Component', () => {
  let mockAxios: AxiosMockAdapter;

  beforeEach(() => {
    mockAxios = new AxiosMockAdapter(axios);
  });

  afterEach(() => {
    vi.clearAllMocks();
    mockAxios.reset();
  });

  it('renders sign-in button when user is not logged in', async () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider value={{ user: null, logout: vi.fn(), login: vi.fn() }}>
          <User />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText(/sign in/i)).toBeInTheDocument());
  });

  it('renders user info when logged in', async () => {
    mockAxios.onGet('http://localhost:3000/lists/Your_Watchlist').reply(200, { success: true });
    render(
      <MemoryRouter>
        <AuthContext.Provider value={{ user: 'testuser', logout: vi.fn(), login: vi.fn() }}>
          <User />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/testuser/i)).toBeInTheDocument();
      expect(mockAxios.history.get.length).toBeGreaterThan(1);
    });
  });

  it('calls logout on sign out', async () => {
    const mockLogout = vi.fn();
    mockAxios.onPost('http://localhost:3000/auth/logout').reply(200, { success: true });

    render(
      <MemoryRouter>
        <AuthContext.Provider value={{ user: 'testuser', logout: mockLogout, login: vi.fn() }}>
          <User />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      const signOutButton = screen.getByText(/sign out/i);
      fireEvent.click(signOutButton);
      expect(mockAxios.history.post.length).toBeGreaterThan(1);
    });
  });
});

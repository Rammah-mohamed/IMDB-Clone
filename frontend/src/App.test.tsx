import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from './context/authContext';
import App from './App';

// Mock lazy-loaded components
vi.mock('./pages/Home', () => ({ default: () => <div>Home Page</div> }));
vi.mock('./pages/Sign', () => ({ default: () => <div>Sign Page</div> }));
vi.mock('./pages/UserLists', () => ({ default: () => <div>User Lists</div> }));

describe('App Component', () => {
  it('renders the Home page by default', async () => {
    render(
      <AuthContext.Provider value={{ user: 'test', logout: vi.fn(), login: vi.fn() }}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthContext.Provider>
    );

    await waitFor(() => expect(screen.getByText('Home Page')).toBeInTheDocument());
  });

  it('renders the Sign page when navigating to /sign', async () => {
    window.history.pushState({}, 'Sign', '/sign');
    render(
      <AuthContext.Provider value={{ user: 'testUser', logout: vi.fn(), login: vi.fn() }}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthContext.Provider>
    );

    await waitFor(() => expect(screen.getByText('Sign Page')).toBeInTheDocument());
  });

  it('preconnects to necessary URLs on mount', () => {
    render(
      <AuthContext.Provider value={{ user: 'testUser', logout: vi.fn(), login: vi.fn() }}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthContext.Provider>
    );

    expect(document.head.innerHTML).toContain('http://localhost:3100');
    expect(document.head.innerHTML).toContain('http://localhost:3000/');
    expect(document.head.innerHTML).toContain('http://localhost:4000/graphql');
  });

  it('logs in a stored user on mount', () => {
    const loginMock = vi.fn();
    localStorage.setItem('user', JSON.stringify({ username: 'testUser' }));

    render(
      <AuthContext.Provider value={{ user: 'testUser', logout: vi.fn(), login: loginMock }}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthContext.Provider>
    );

    expect(loginMock).toHaveBeenCalledWith('testUser');
    localStorage.clear();
  });
});

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../context/authContext';
import Sign from '../pages/Sign';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';

const mockAxios = new MockAdapter(axios);
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

describe('Sign Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockAxios.reset();
    vi.spyOn(console, 'error');
  });

  it('renders sign-in form correctly', async () => {
    render(
      <AuthContext.Provider value={{ user: 'testUser', login: vi.fn(), logout: vi.fn() }}>
        <MemoryRouter>
          <Sign />
        </MemoryRouter>
      </AuthContext.Provider>
    );
    await waitFor(() => {
      expect(screen.getAllByText('Sign in')[0]).toBeInTheDocument();
      expect(screen.getAllByLabelText('Email or mobile phone number')[0]).toBeInTheDocument();
      expect(screen.getAllByLabelText('Password')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Sign in')[0]).toBeInTheDocument();
    });
  });

  it('updates input values correctly', () => {
    render(
      <AuthContext.Provider value={{ user: 'testUser', login: vi.fn(), logout: vi.fn() }}>
        <MemoryRouter>
          <Sign />
        </MemoryRouter>
      </AuthContext.Provider>
    );
    const emailInput = screen.getByLabelText('Email or mobile phone number');
    const passwordInput = screen.getByLabelText('Password');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('submits form and logs in user', async () => {
    mockAxios.onPost('http://localhost:3000/auth/login').reply(200);
    mockAxios.onGet(`http://localhost:3000/lists`).reply(200, []);

    render(
      <AuthContext.Provider value={{ user: 'testUser', login: vi.fn(), logout: vi.fn() }}>
        <MemoryRouter>
          <Sign />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    await waitFor(() => {
      fireEvent.change(screen.getAllByLabelText('Email or mobile phone number')[0], {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getAllByLabelText('Password')[0], {
        target: { value: 'password123' },
      });
      fireEvent.click(screen.getAllByText('Sign in')[1]);
    });

    await waitFor(() => expect(mockAxios.history.post.length).toBe(1));
  });

  it('shows error message on failed login', async () => {
    mockAxios.onPost('http://localhost:3000/auth/login').reply(500, 'Invalid credentials');

    render(
      <AuthContext.Provider value={{ user: 'testUser', login: vi.fn(), logout: vi.fn() }}>
        <MemoryRouter>
          <Sign />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    fireEvent.change(screen.getByLabelText('Email or mobile phone number'), {
      target: { value: 'wrong@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'wrongpassword' },
    });
    fireEvent.click(screen.getAllByText('Sign in')[1]);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Invalid credentials');
    });
  });
});

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../context/authContext';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import UserLists from '../pages/UserLists';

const mockAxios = new MockAdapter(axios);

vi.mock('../components/Navbar', () => ({
  default: () => <div data-testid='navbar'>Mock Navbar</div>,
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockLists = [
  { name: 'Action Movies', description: 'Best action films' },
  { name: 'Comedy Films', description: 'Top comedy picks' },
];

describe('UserLists Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios.reset();
    vi.spyOn(console, 'error');
  });

  it('renders correctly with user', async () => {
    mockAxios.onGet(`http://localhost:3000/lists`).reply(200, mockLists);

    render(
      <AuthContext.Provider value={{ user: 'testUser', login: vi.fn(), logout: vi.fn() }}>
        <MemoryRouter>
          <UserLists />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('navbar')).toBeInTheDocument();
      expect(screen.getByText('Your Lists')).toBeInTheDocument();
      expect(screen.getByText('testUser')).toBeInTheDocument();
    });
  });

  it("navigates to create list when clicking 'Create a new list'", async () => {
    render(
      <AuthContext.Provider value={{ user: 'testUser', login: vi.fn(), logout: vi.fn() }}>
        <MemoryRouter>
          <UserLists />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    await waitFor(() => {
      fireEvent.click(screen.getByText('Create a new list'));
      expect(mockNavigate).toHaveBeenCalledWith('/createList');
    });
  });

  it('fetches and displays user lists', async () => {
    mockAxios.onGet(`http://localhost:3000/lists`).reply(200, mockLists);

    render(
      <AuthContext.Provider value={{ user: 'testUser', login: vi.fn(), logout: vi.fn() }}>
        <MemoryRouter>
          <UserLists />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    await waitFor(() => expect(screen.getByText('Action Movies')).toBeInTheDocument());
    expect(screen.getByText('Comedy Films')).toBeInTheDocument();
  });

  it('handles errors when fetching lists', async () => {
    mockAxios.onGet(`http://localhost:3000/lists`).reply(500, 'Network Error');

    render(
      <AuthContext.Provider value={{ user: 'testUser', login: vi.fn(), logout: vi.fn() }}>
        <MemoryRouter>
          <UserLists />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Network Error');
    });
  });

  it('deletes a list and fetches updated data', async () => {
    const updatedList = [{ name: 'Comedy Films', description: 'Top comedy picks' }];

    mockAxios.onGet(`http://localhost:3000/lists`).reply(200, mockLists);
    mockAxios.onDelete(`http://localhost:3000/lists/Action Movies`).reply(200);

    render(
      <AuthContext.Provider value={{ user: 'testUser', login: vi.fn(), logout: vi.fn() }}>
        <MemoryRouter>
          <UserLists />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    await waitFor(() => expect(screen.getByText('Action Movies')).toBeInTheDocument());

    mockAxios.onGet(`http://localhost:3000/lists`).reply(200, updatedList);

    await waitFor(() => fireEvent.click(screen.getAllByText('Delete')[0]));

    await waitFor(() => expect(mockAxios.history.delete.length).toBe(1));
    await waitFor(() => expect(screen.queryByText('Action Movies')).not.toBeInTheDocument());
  });
});

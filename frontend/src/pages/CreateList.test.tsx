import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/authContext';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import CreateList from '../pages/CreateList';

vi.mock('../context/authContext', async () => {
  const actual = await vi.importActual('../context/authContext');
  return {
    ...actual, // Keep other exports like AuthProvider
    useAuth: vi.fn(() => ({
      user: 'Test User',
      login: vi.fn(),
      logout: vi.fn(),
    })),
  };
});

vi.mock('../components/Navbar', () => ({
  default: () => <div data-testid='navbar'>Navbar</div>,
}));
const mockNavigate = vi.fn(); // Mock navigate function

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

describe('CreateList Component', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    vi.resetAllMocks();
    mock.reset();
  });

  it('renders CreateList component', async () => {
    render(
      <MemoryRouter>
        <CreateList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Your Lists')).toBeInTheDocument();
    });
  });

  it('updates input fields correctly', async () => {
    render(
      <MemoryRouter>
        <CreateList />
      </MemoryRouter>
    );

    await waitFor(() => {
      const nameInput = screen.getAllByPlaceholderText('Enter the name of your list');
      const firstNameInput = nameInput[0] as HTMLInputElement;
      fireEvent.change(firstNameInput, { target: { value: 'My Movie List' } });
      expect(firstNameInput.value).toBe('My Movie List');
    });
  });

  it('validates empty list name on submit', async () => {
    render(
      <MemoryRouter>
        <CreateList />
      </MemoryRouter>
    );

    await waitFor(() => {
      const createButton = screen.getByText('Create');
      fireEvent.click(createButton);
      expect(screen.getByText('Enter a title')).toBeInTheDocument();
    });
  });

  it('submits form successfully', async () => {
    mock.onPost('http://localhost:3000/lists').reply(200, { success: true });

    render(
      <AuthProvider>
        <MemoryRouter>
          <CreateList />
        </MemoryRouter>
      </AuthProvider>
    );

    await waitFor(() => {
      screen.getAllByPlaceholderText('Enter the name of your list');
      screen.getAllByPlaceholderText('Enter a description');
    });

    const nameInput = screen.getAllByPlaceholderText('Enter the name of your list');
    const descriptionInput = screen.getAllByPlaceholderText('Enter a description');

    await userEvent.type(nameInput[0], 'My Movie List');
    await userEvent.type(descriptionInput[0], 'A list of my favorite movies');

    await waitFor(() => expect(nameInput[0]).toHaveValue('My Movie List'));
    await waitFor(() => expect(descriptionInput[0]).toHaveValue('A list of my favorite movies'));

    const createButton = screen.getByRole('button', { name: /create/i });
    await userEvent.click(createButton);

    await waitFor(() => {
      expect(mock.history.post.length).toBe(1);
    });

    await waitFor(() => expect(mock.history.post.length).toBe(1));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/userLists'));
  });
});

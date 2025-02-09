import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../context/authContext';
import Navbar from './Navbar';

vi.mock('axios', () => ({
  default: {
    get: vi.fn(() =>
      Promise.resolve({
        data: { movies: [1, 2, 3] },
      })
    ),
  },
}));

vi.mock('./Menu', () => ({
  default: () => <div data-testid='menu-component'>Menu Component</div>,
}));

vi.mock('./SearchMenu', () => ({
  default: () => <div data-testid='search-menu'>Search Menu</div>,
}));

vi.mock('./UserMenu', () => ({
  default: () => <div data-testid='user-menu'>User Menu</div>,
}));

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Navbar Component', () => {
  const renderNavbar = (user: string | null) =>
    render(
      <AuthContext.Provider value={{ user, login: vi.fn(), logout: vi.fn() }}>
        <MemoryRouter>
          <Navbar />
        </MemoryRouter>
      </AuthContext.Provider>
    );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the Navbar component', async () => {
    renderNavbar(null);

    await waitFor(() => {
      expect(screen.getByTestId('imdb-logo')).toBeInTheDocument();
      expect(screen.getByTestId('menuBtn')).toBeInTheDocument();
      expect(screen.getByTestId('btn')).toHaveTextContent('Sign In');
    });
  });

  it('displays the user menu when logged in', async () => {
    renderNavbar('Test User');

    await waitFor(() => {
      const userButton = screen.getByTestId('btn');
      fireEvent.click(userButton);
    });

    expect(screen.getByTestId('user-menu')).toBeInTheDocument();
  });

  it('shows the number of items in the watchlist for logged-in users', async () => {
    renderNavbar('Test User');

    await waitFor(() => expect(screen.getByText('3')).toBeInTheDocument());
  });

  it('navigates to the sign-in page if the user is not logged in and clicks on the user menu', async () => {
    renderNavbar(null);

    await waitFor(() => {
      const userButton = screen.getByTestId('btn');
      expect(userButton).toBeInTheDocument();
      fireEvent.click(userButton);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/sign');
  });

  it('opens the menu when clicking the menu button', async () => {
    renderNavbar(null);

    await waitFor(() => {
      const menuButton = screen.getByTestId('menuBtn');
      fireEvent.click(menuButton);
    });

    expect(screen.getByTestId('menu-component')).toBeInTheDocument();
  });

  it('opens the search dropdown when clicking the search menu button', async () => {
    renderNavbar(null);

    await waitFor(() => {
      const searchDropdown = screen.getByText('All');
      fireEvent.click(searchDropdown);
    });

    expect(screen.getByTestId('search-menu')).toBeInTheDocument();
  });

  it('navigates to the search page on Enter key press with valid input', async () => {
    renderNavbar(null);

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Search IMDB');
      fireEvent.focus(searchInput);
      fireEvent.change(searchInput, { target: { value: 'Inception' } });
      fireEvent.keyDown(window, { key: 'Enter' });
    });

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('/search', {
        state: { query: 'Inception', filter: 'All' },
      })
    );
  });
});

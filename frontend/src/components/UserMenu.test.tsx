import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../context/authContext';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import UserMenu from './UserMenu';

const mockAxios = new MockAdapter(axios);

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockNavigate,
}));

describe('UserMenu Component', () => {
  const mockLogout = vi.fn();
  const setshowUserMenu = vi.fn();

  const renderUserMenu = (showUserMenu = true) =>
    render(
      <AuthContext.Provider value={{ user: 'test', login: vi.fn(), logout: mockLogout }}>
        <BrowserRouter>
          <UserMenu showUserMenu={showUserMenu} setshowUserMenu={setshowUserMenu} />
        </BrowserRouter>
      </AuthContext.Provider>
    );

  beforeEach(() => {
    const localStorageMock = (() => {
      let store: Record<string, string> = {};

      return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
          store[key] = value.toString();
        },
        removeItem: (key: string) => {
          delete store[key];
        },
        clear: () => {
          store = {};
        },
      };
    })();

    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
    });
    vi.spyOn(localStorage, 'removeItem');
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    mockAxios.reset();
  });

  it('renders correctly when menu is visible', () => {
    renderUserMenu(true);

    const options = screen.getAllByRole('button');
    expect(options).toHaveLength(3); // "your Watchlist", "your Lists", "Sign out"

    expect(options[0]).toHaveTextContent('your Watchlist');
    expect(options[1]).toHaveTextContent('your Lists');
    expect(options[2]).toHaveTextContent('Sign out');
  });

  it('does not render when menu is hidden', () => {
    renderUserMenu(false);

    const menu = screen.queryByRole('button');
    expect(menu).not.toBeInTheDocument();
  });

  it('navigates to "your Watchlist" when clicked', async () => {
    renderUserMenu(true);

    const watchlistButton = screen.getByText('your Watchlist');
    userEvent.click(watchlistButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/listDetails');
    });
  });

  it('navigates to "your Lists" when clicked', async () => {
    renderUserMenu(true);

    const userListsButton = screen.getByText('your Lists');
    userEvent.click(userListsButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/userLists');
    });
  });

  it('logs out successfully on "Sign out"', async () => {
    mockAxios.onPost('http://localhost:3000/auth/logout').reply(200, 'Logged out successfully.');

    renderUserMenu(true);

    const signOutButton = screen.getByText('Sign out');
    userEvent.click(signOutButton);

    await waitFor(() => {
      expect(localStorage.removeItem).toHaveBeenCalledWith('user');
      expect(mockLogout).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith(location.pathname);
    });
  });

  it('handles logout failure gracefully', async () => {
    mockAxios.onPost('http://localhost:3000/auth/logout').reply(500, 'Error logging out');

    renderUserMenu(true);

    const signOutButton = screen.getByText('Sign out');
    userEvent.click(signOutButton);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Error logging out');
    });
  });

  it('closes the menu when clicked outside', () => {
    renderUserMenu(true);

    fireEvent.mouseDown(document);
    expect(setshowUserMenu).toHaveBeenCalledWith(false);
  });

  it('does not close the menu when clicked inside', () => {
    renderUserMenu(true);

    const menu = screen.getByText('your Watchlist');
    fireEvent.mouseDown(menu);

    expect(setshowUserMenu).not.toHaveBeenCalled();
  });
});

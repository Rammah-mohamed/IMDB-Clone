import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import MobileNavbar from '../components/MobileNavbar';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockNavigate,
}));

describe('MobileNavbar', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders all icons', () => {
    render(
      <MemoryRouter>
        <MobileNavbar />
      </MemoryRouter>
    );

    expect(screen.getByTestId('home-icon')).toBeInTheDocument();
    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
    expect(screen.getByTestId('user-icon')).toBeInTheDocument();
  });

  it('sets active icon based on props', () => {
    render(
      <MemoryRouter>
        <MobileNavbar activeNow='search' />
      </MemoryRouter>
    );

    expect(screen.getByTestId('search-icon')).toHaveClass('text-white');
  });

  it('updates active state on click', () => {
    render(
      <MemoryRouter>
        <MobileNavbar />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByTestId('search-icon'));
    expect(screen.getByTestId('search-icon')).toHaveClass('text-white');
  });

  it('calls navigate on icon click', () => {
    render(
      <MemoryRouter>
        <MobileNavbar />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByTestId('home-icon'));
    expect(mockNavigate).toHaveBeenCalledWith('/');

    fireEvent.click(screen.getByTestId('search-icon'));
    expect(mockNavigate).toHaveBeenCalledWith('/mobileSearch');

    fireEvent.click(screen.getByTestId('user-icon'));
    expect(mockNavigate).toHaveBeenCalledWith('/user');
  });
});

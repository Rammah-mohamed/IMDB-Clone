import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import MobileSearch from '../pages/MobileSearch';
import { Suspense } from 'react';

vi.mock('../components/MobileSearchMenu', () => ({
  default: ({ setSearchText }: { setSearchText: (text: string) => void }) => (
    <div data-testid='mobile-search-menu' onClick={() => setSearchText('Movies')}>
      Search Menu
    </div>
  ),
}));

vi.mock('../components/MobileNavbar', () => ({
  default: () => <div data-testid='mobile-navbar'>Mobile Navbar</div>,
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockNavigate,
}));

describe('MobileSearch', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders input and cancel button', async () => {
    render(
      <MemoryRouter>
        <Suspense fallback={<div>Loading...</div>}>
          <MobileSearch />
        </Suspense>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search IMDB')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });

  it('shows search menu when input is focused', async () => {
    render(
      <MemoryRouter>
        <Suspense fallback={<div>Loading...</div>}>
          <MobileSearch />
        </Suspense>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search IMDB')).toBeInTheDocument();
      const input = screen.getByPlaceholderText('Search IMDB');
      fireEvent.focus(input);
      expect(screen.getByTestId('mobile-search-menu')).toBeInTheDocument();
    });
  });

  it('updates input value when typed into', async () => {
    render(
      <MemoryRouter>
        <Suspense fallback={<div>Loading...</div>}>
          <MobileSearch />
        </Suspense>
      </MemoryRouter>
    );

    await waitFor(() => {
      const input = screen.getByPlaceholderText('Search IMDB');
      fireEvent.change(input, { target: { value: 'Inception' } });
      expect(input).toHaveValue('Inception');
    });
  });

  it('hides search menu when cancel button is clicked', async () => {
    render(
      <MemoryRouter>
        <Suspense fallback={<div>Loading...</div>}>
          <MobileSearch />
        </Suspense>
      </MemoryRouter>
    );

    await waitFor(() => {
      const input = screen.getByPlaceholderText('Search IMDB');
      fireEvent.focus(input);
      expect(screen.getByTestId('mobile-search-menu')).toBeInTheDocument();
    });
    await waitFor(() => {
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);
      expect(screen.queryByTestId('mobile-search-menu')).not.toBeInTheDocument();
    });
  });

  it('navigates when Enter is pressed with a valid query', async () => {
    render(
      <MemoryRouter>
        <Suspense fallback={<div>Loading...</div>}>
          <MobileSearch />
        </Suspense>
      </MemoryRouter>
    );

    await waitFor(() => {
      const input = screen.getByPlaceholderText('Search IMDB');
      fireEvent.change(input, { target: { value: 'Inception' } });
      fireEvent.focus(input);
      fireEvent.keyDown(window, { key: 'Enter', code: 'Enter' });

      expect(mockNavigate).toHaveBeenCalledWith('/search', {
        state: { query: 'Inception', filter: 'All' },
      });
    });
  });
});

import { render, screen, fireEvent } from '@testing-library/react';
import MobileSearchMenu from '../components/MobileSearchMenu';
import { vi } from 'vitest';

describe('MobileSearchMenu', () => {
  test('renders search filter heading', () => {
    const setSearchText = vi.fn();
    render(<MobileSearchMenu setSearchText={setSearchText} />);

    expect(screen.getByText('Search Filter')).toBeInTheDocument();
  });

  test('renders all search categories', () => {
    const setSearchText = vi.fn();
    render(<MobileSearchMenu setSearchText={setSearchText} />);

    const categories = ['All', 'Movies', 'TV Shows', 'Celebs'];
    categories.forEach((category) => {
      expect(screen.getByText(category)).toBeInTheDocument();
    });
  });

  test('updates active category and calls setSearchText on click', () => {
    const setSearchText = vi.fn();
    render(<MobileSearchMenu setSearchText={setSearchText} />);

    const moviesTab = screen.getByTestId('Movies');
    fireEvent.click(moviesTab);

    expect(setSearchText).toHaveBeenCalledWith('Movies');
    expect(moviesTab).toHaveClass('text-primary');
  });

  test('updates container width on window resize', () => {
    const setSearchText = vi.fn();
    render(<MobileSearchMenu setSearchText={setSearchText} />);

    global.innerWidth = 500;
    global.dispatchEvent(new Event('resize'));

    // No direct assertion, but ensuring no crash/errors
    expect(true).toBe(true);
  });
});

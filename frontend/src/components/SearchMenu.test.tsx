import { render, screen, fireEvent } from '@testing-library/react';
import SearchMenu from './SearchMenu';

describe('SearchMenu Component', () => {
  const setShowSearchMock = vi.fn();
  const setSearchTextMock = vi.fn();
  const setOrderTextMock = vi.fn();

  const defaultProps = {
    showSearch: true,
    menuFor: 'Navbar',
    setShowSearch: setShowSearchMock,
    setSearchText: setSearchTextMock,
    setOrderText: setOrderTextMock,
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the component with the correct items for Navbar', () => {
    render(<SearchMenu {...defaultProps} />);
    const items = ['All', 'Movies', 'TV Shows', 'Celebs'];
    items.forEach((item) => {
      expect(screen.getByText(item)).toBeInTheDocument();
    });
  });

  it('renders the component with the correct items for List', () => {
    render(<SearchMenu {...defaultProps} menuFor='List' />);

    const items = [
      'List order',
      'Alphabetical',
      'IMDB Rating',
      'Number Of Ratings',
      'Popularity',
      'Release Data',
    ];

    items.forEach((item) => {
      expect(screen.getByText(item)).toBeInTheDocument();
    });
  });

  it('calls setSearchText and sets the active item on item click (Navbar)', () => {
    render(<SearchMenu {...defaultProps} />);

    const item = screen.getByText('Movies');
    fireEvent.click(item);

    expect(setSearchTextMock).toHaveBeenCalledWith('Movies');
    expect(item).toHaveClass('text-primary');
  });

  it('calls setOrderText and sets the active item on item click (List)', () => {
    render(<SearchMenu {...defaultProps} menuFor='List' />);

    const item = screen.getByText('Alphabetical');
    fireEvent.click(item);

    expect(setOrderTextMock).toHaveBeenCalledWith('Alphabetical');
    expect(item).toHaveClass('text-secondary');
  });

  it('closes the menu when clicking outside', () => {
    render(<SearchMenu {...defaultProps} />);

    const outsideElement = document.createElement('div');
    document.body.appendChild(outsideElement);

    fireEvent.mouseDown(outsideElement);
    expect(setShowSearchMock).toHaveBeenCalledWith(false);

    document.body.removeChild(outsideElement);
  });

  it('does not display content when showSearch is false', () => {
    render(<SearchMenu {...defaultProps} showSearch={false} />);
    expect(screen.queryByText('All')).not.toBeVisible();
  });
});

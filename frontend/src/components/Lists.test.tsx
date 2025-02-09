import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Media, Trailer } from '../types/media';
import Lists from './Lists';

// Mock for Lazy loaded List component
vi.mock('./List', () => ({
  default: ({ title }: { title: string }) => <div data-testid='mock-list'>{title}</div>,
}));

const mediaData: Media[] = [
  {
    id: 1,
    name: 'Media One',
    title: 'Media 1',
    overview: 'Overview of Media 1',
    poster_path: '/path-to-poster1.jpg',
    backdrop_path: '/path-to-backdrop1.jpg',
    genre_ids: [28, 12],
    release_date: '2023-01-01',
    media_type: 'movie',
    popularity: 100,
    vote_average: '8.5',
    vote_count: '2000',
    isAdded: false,
    __typename: 'Media',
    _id: 'media1',
  },
  {
    id: 2,
    name: 'Media Two',
    title: 'Media 2',
    overview: 'Overview of Media 2',
    poster_path: '/path-to-poster2.jpg',
    backdrop_path: '/path-to-backdrop2.jpg',
    genre_ids: [16, 35],
    release_date: '2023-02-01',
    media_type: 'movie',
    popularity: 80,
    vote_average: '7.9',
    vote_count: '1500',
    isAdded: false,
    __typename: 'Media',
    _id: 'media2',
  },
];

const trailerData: Trailer[] = [
  { key: 'trailer1', name: 'Trailer One', type: 'Teaser' },
  { key: 'trailer2', name: 'Trailer Two', type: 'Trailer' },
];

describe('Lists Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders the component with a title', () => {
    render(<Lists title='Test Title' />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('renders the content from the data prop', async () => {
    render(<Lists title='Media List' data={mediaData} />);

    await waitFor(() => {
      const mockLists = screen.getAllByTestId('mock-list');
      expect(mockLists).toHaveLength(mediaData.length);
    });
  });

  it('renders the content from the relatedVideos prop', async () => {
    render(<Lists title='Trailer List' relatedVideos={trailerData} />);

    await waitFor(() => {
      const mockLists = screen.getAllByTestId('mock-list');
      expect(mockLists).toHaveLength(trailerData.length);
    });
  });

  it('renders fallback titles if no data or relatedVideos are provided', async () => {
    render(<Lists listFor='text' title='Default List' />);

    await waitFor(() => {
      const mockLists = screen.getAllByTestId('mock-list');
      expect(mockLists).toHaveLength(4);
    });
  });

  it('handles right arrow click to navigate items', async () => {
    render(<Lists title='Media List' data={mediaData} />);

    await waitFor(() => {
      const rightArrow = screen.getByTestId('nextBtn');
      fireEvent.click(rightArrow);
    });

    const mockLists = screen.getAllByTestId('mock-list');
    expect(mockLists).toHaveLength(mediaData.length);
  });

  it('handles left arrow click to navigate items', async () => {
    render(<Lists title='Media List' data={mediaData} />);

    await waitFor(() => {
      const leftArrow = screen.getByTestId('prevBtn');
      fireEvent.click(leftArrow);
    });

    const mockLists = screen.getAllByTestId('mock-list');
    expect(mockLists).toHaveLength(mediaData.length);
  });
});

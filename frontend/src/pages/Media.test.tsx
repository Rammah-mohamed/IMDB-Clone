import { Suspense } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Media from '../pages/Media';

// Mock the necessary components and hooks
vi.mock('../components/Navbar', () => ({
  default: () => <div>Navbar</div>,
}));
vi.mock('react-player', () => ({
  default: () => <div>Mocked ReactPlayer</div>,
}));

vi.mock('react-lazy-load-image-component', () => ({
  LazyLoadImage: (props: any) => <img {...props} />,
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Media Component', () => {
  it('renders Media component correctly with mock location state', async () => {
    const mockState = {
      name: 'Celebrity Name',
      mediaName: 'Movie Name',
      celebrityImage: { file_path: 'celebrity.jpg' },
      mediaImage: 'media.jpg',
      poster: 'poster.jpg',
      photos: [{ file_path: 'photo1.jpg', width: 800, height: 600 }],
      videos: [{ key: 'video1', name: 'Trailer 1' }],
      season: [],
      episodes: [],
      topRatedEpisodes: [],
    };

    render(
      <MemoryRouter initialEntries={[{ pathname: '/media', state: mockState }]}>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path='/media' element={<Media />} />
          </Routes>
        </Suspense>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Celebrity Name')).toBeInTheDocument();
    });
  });

  it('opens image modal on image click', async () => {
    const mockState = {
      name: 'Celebrity Name',
      mediaName: 'Movie Name',
      celebrityImage: { file_path: 'celebrity.jpg' },
      mediaImage: 'media.jpg',
      poster: 'poster.jpg',
      photos: [{ file_path: 'photo1.jpg', width: 800, height: 600 }],
      videos: [],
      season: [],
      episodes: [],
      topRatedEpisodes: [],
    };

    render(
      <MemoryRouter initialEntries={[{ pathname: '/media', state: mockState }]}>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path='/media' element={<Media />} />
          </Routes>
        </Suspense>
      </MemoryRouter>
    );

    await waitFor(() => {
      const images = screen.getAllByTestId('image');
      fireEvent.click(images[0]);
    });

    expect(screen.getByText('Close')).toBeInTheDocument();
  });

  it('navigates to video on click', async () => {
    const mockState = {
      name: 'Celebrity Name',
      mediaName: 'Movie Name',
      celebrityImage: { file_path: 'celebrity.jpg' },
      mediaImage: 'media.jpg',
      poster: 'poster.jpg',
      photos: [],
      videos: [{ key: 'video1', name: 'Trailer 1' }],
      season: [],
      episodes: [],
      topRatedEpisodes: [],
    };

    render(
      <MemoryRouter initialEntries={[{ pathname: '/media', state: mockState }]}>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path='/media' element={<Media />} />
            <Route path='/videos' element={<div>Video Page</div>} />
          </Routes>
        </Suspense>
      </MemoryRouter>
    );

    await waitFor(() => screen.getAllByTestId('video'));
    fireEvent.click(screen.getAllByTestId('video')[0]);

    expect(mockNavigate).toHaveBeenCalledWith('/videos', {
      state: {
        videoID: 'video1',
        name: 'Trailer 1',
        related: [{ key: 'video1', name: 'Trailer 1' }],
      },
    });
  });

  it('selects a season and updates active season', async () => {
    const mockState = {
      name: 'Celebrity Name',
      mediaName: 'Movie Name',
      celebrityImage: { file_path: 'celebrity.jpg' },
      mediaImage: 'media.jpg',
      poster: 'poster.jpg',
      photos: [],
      videos: [],
      season: [
        { season_number: 1, episodes: [] },
        { season_number: 2, episodes: [] },
      ],
      episodes: [],
      topRatedEpisodes: [],
    };

    render(
      <MemoryRouter initialEntries={[{ pathname: '/media', state: mockState }]}>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path='/media' element={<Media />} />
          </Routes>
        </Suspense>
      </MemoryRouter>
    );

    await waitFor(() => {
      const secondSeason = screen.getByText('2');
      fireEvent.click(secondSeason);
    });

    await waitFor(() => screen.getByText('2'));
    expect(screen.getByText('2')).toHaveClass('bg-primary');

    await waitFor(() => {
      const firstseason = screen.getByText('1');
      fireEvent.click(firstseason);
    });

    await waitFor(() => screen.getByText('1'));
    expect(screen.getByText('1')).toHaveClass('bg-primary');
  });
});

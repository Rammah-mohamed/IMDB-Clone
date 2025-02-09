import { startTransition, Suspense } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { GET_GENRES, GET_MOVIE_TRAILER } from '../graphql/queries';
import Videos from '../pages/Videos';

// Mocked components
vi.mock('react-player', () => ({
  default: () => <div>Mock ReactPlayer</div>,
}));

vi.mock('../components/Navbar', () => ({
  default: () => <div>Mock Navbar</div>,
}));

vi.mock('../components/Lists', () => ({
  default: () => <div>Mock Lists</div>,
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

const mockState = {
  data: {
    id: 1,
    media_type: 'movie',
    genre_ids: [28, 12],
    title: 'Test Movie',
    poster_path: '/test_poster.jpg',
    backdrop_path: '/test_backdrop.jpg',
    overview: 'Test movie overview',
  },
  trending: [],
  videoID: 'testVideoID',
  name: 'Test Video',
  related: [],
};

const mocks = [
  {
    request: {
      query: GET_GENRES,
    },
    result: {
      data: {
        movieGenres: [
          { id: 28, name: 'Action' },
          { id: 12, name: 'Adventure' },
        ],
        tvGenres: [],
      },
    },
  },
  {
    request: {
      query: GET_MOVIE_TRAILER,
      variables: { id: 1 },
    },
    result: {
      data: {
        movieVideos: [{ id: 'trailer1', key: 'testKey', type: 'Trailer', name: 'Trailer 1' }],
      },
    },
  },
];

describe('Videos Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
  });

  it('renders the component with mock data', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MemoryRouter initialEntries={[{ pathname: '/videos', state: mockState }]}>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path='/videos' element={<Videos />} />
            </Routes>
          </Suspense>
        </MemoryRouter>
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Mock Navbar')).toBeInTheDocument();
      expect(screen.getByText('Mock ReactPlayer')).toBeInTheDocument();
    });
  });

  it('fetches and displays genres', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MemoryRouter initialEntries={[{ pathname: '/videos', state: mockState }]}>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path='/videos' element={<Videos />} />
            </Routes>
          </Suspense>
        </MemoryRouter>
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Action')).toBeInTheDocument();
      expect(screen.getByText('Adventure')).toBeInTheDocument();
    });
  });

  it('saves data to localStorage when `data` changes', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MemoryRouter initialEntries={[{ pathname: '/videos', state: mockState }]}>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path='/videos' element={<Videos />} />
            </Routes>
          </Suspense>
        </MemoryRouter>
      </MockedProvider>
    );

    await waitFor(() => {
      startTransition(() => {
        const savedData = localStorage.getItem('video');
        expect(savedData).not.toBeNull();
        expect(JSON.parse(savedData!)).toEqual(mockState.data);
      });
    });
  });

  it('displays an error message if the genres query fails', async () => {
    const errorMocks = [
      {
        request: {
          query: GET_GENRES,
        },
        error: new Error('Genres query failed'),
      },
    ];

    render(
      <MockedProvider mocks={errorMocks} addTypename={false}>
        <MemoryRouter initialEntries={[{ pathname: '/videos', state: mockState }]}>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path='/videos' element={<Videos />} />
            </Routes>
          </Suspense>
        </MemoryRouter>
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Error: Genres query failed/i)).toBeInTheDocument();
    });
  });
});

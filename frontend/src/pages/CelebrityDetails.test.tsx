import { Suspense } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import {
  GET_CELEBRITY,
  GET_MOVIE_TRAILER,
  GET_TV_TRAILER,
  GET_MOVIE_CAST,
  GET_TV_CAST,
  GET_MOVIE_CREW,
  GET_TV_CREW,
} from '../graphql/queries';
import CelebrityDetails from '../pages/CelebrityDetails';

// Mock React Lazy Component (Navbar)
vi.mock('../components/Navbar', () => ({
  default: () => <div data-testid='navbar'>Navbar</div>,
}));

vi.mock('react-player', () => {
  return {
    default: vi.fn(() => <div>ReactPlayer</div>), // Mock implementation
  };
});

vi.mock('react-lazy-load-image-component', () => ({
  LazyLoadImage: (props: any) => <img {...props} />,
}));

const celebrityMock = {
  request: {
    query: GET_CELEBRITY,
    variables: { id: '1' }, // Ensure it's a number, not a string
  },
  result: {
    data: {
      celebrityDetail: {
        id: 1,
        name: 'Test Celebrity',
        profile_path: '/test-path.jpg',
        known_for_department: 'Acting',
        popularity: 80,
        biography: 'Test Biography',
        birthday: '1980-01-01',
        place_of_birth: 'Test City',
        known_for: [
          { id: 101, media_type: 'movie', title: 'Test Movie' },
          { id: 201, media_type: 'tv', name: 'Test TV Show' },
        ],
      },
      celebrityImages: [
        { file_path: '/image1.jpg', width: 800, height: 600 },
        { file_path: '/image2.jpg', width: 800, height: 600 },
      ],
    },
  },
};

const trailerMock = (type: 'movie' | 'tv', id: number) => ({
  request: {
    query: type === 'movie' ? GET_MOVIE_TRAILER : GET_TV_TRAILER,
    variables: { id },
  },
  result: {
    data: {
      [`${type}Videos`]: [
        { key: 'trailerKey1', name: 'Trailer 1', type: 'Trailer' },
        { key: 'trailerKey2', name: 'Trailer 2', type: 'Teaser' },
      ],
    },
  },
});

const castMock = (type: 'movie' | 'tv', id: number) => ({
  request: {
    query: type === 'movie' ? GET_MOVIE_CAST : GET_TV_CAST,
    variables: { id },
  },
  result: {
    data: {
      [`${type}Cast`]: [
        { id: 1, name: 'Actor 1' },
        { id: 2, name: 'Actor 2' },
      ],
    },
  },
});

const crewMock = (type: 'movie' | 'tv', id: number) => ({
  request: {
    query: type === 'movie' ? GET_MOVIE_CREW : GET_TV_CREW,
    variables: { id },
  },
  result: {
    data: {
      [`${type === 'movie' ? 'moviesCrew' : 'tvCrew'}`]: [
        {
          id: 'crew1',
          name: 'Director Name',
          job: 'Director',
          gender: 2,
          profile_path: '/director.jpg',
        },
        {
          id: 'crew2',
          name: 'Producer Name',
          job: 'Producer',
          gender: 1,
          profile_path: '/producer.jpg',
        },
      ],
    },
  },
});

// Mock celebrity data
const mockCelebrity = {
  id: '1',
  name: 'Test Celebrity',
  profile_path: '/test-path.jpg',
  known_for_department: 'Acting',
  known_for: [
    { id: 101, media_type: 'movie', title: 'Test Movie' },
    { id: 201, media_type: 'tv', name: 'Test TV Show' },
  ],
  popularity: 80,
};

// Mock Router Location
const mockLocation = {
  pathname: '/celebrity-details',
  state: mockCelebrity,
};

// Mock GraphQL Queries
const mocks = [
  celebrityMock,
  trailerMock('movie', 101),
  trailerMock('tv', 201),
  castMock('movie', 101),
  crewMock('movie', 101),
  castMock('tv', 201),
  crewMock('tv', 201),
];

describe('CelebrityDetails Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the loading spinner while loading', () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MemoryRouter initialEntries={[mockLocation]}>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path='/celebrity-details' element={<CelebrityDetails />} />
            </Routes>
          </Suspense>
        </MemoryRouter>
      </MockedProvider>
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders celebrity details after data loads', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MemoryRouter initialEntries={[mockLocation]}>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path='/celebrity-details' element={<CelebrityDetails />} />
            </Routes>
          </Suspense>
        </MemoryRouter>
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Test Celebrity/)).toBeInTheDocument();
    });

    expect(screen.getByText(/Acting/)).toBeInTheDocument();
  });

  it('renders trailers after they are fetched', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MemoryRouter initialEntries={[mockLocation]}>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path='/celebrity-details' element={<CelebrityDetails />} />
            </Routes>
          </Suspense>
        </MemoryRouter>
      </MockedProvider>
    );

    await waitFor(() => {
      const trailers = screen.getAllByText(/Play Trailer/);
      expect(trailers[0]).toBeInTheDocument();
    });
  });

  it('renders imagess after they are fetched', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MemoryRouter initialEntries={[mockLocation]}>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path='/celebrity-details' element={<CelebrityDetails />} />
            </Routes>
          </Suspense>
        </MemoryRouter>
      </MockedProvider>
    );

    await waitFor(() => {
      const images = screen.getAllByAltText(/Celebrity Image/);
      expect(images).toHaveLength(2);
    });
  });

  it('renders errors when GraphQL queries fail', async () => {
    const errorMocks = [...mocks.map((mock) => ({ ...mock, error: new Error('GraphQL error') }))];

    render(
      <MockedProvider mocks={errorMocks} addTypename={false}>
        <MemoryRouter initialEntries={[mockLocation]}>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path='/celebrity-details' element={<CelebrityDetails />} />
            </Routes>
          </Suspense>
        </MemoryRouter>
      </MockedProvider>
    );

    await waitFor(() => {
      const errors = screen.getAllByText(/GraphQL error/);
      expect(errors[0]).toBeInTheDocument();
    });
  });
});

import { Suspense } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { SEARCH_CELEBRITY, SEARCH_MOVIES, SEARCH_TV } from '../graphql/queries';
import Search from '../pages/Search';
import { AuthProvider } from '../context/authContext';

// Mocks for Apollo Client queries
const mocks = [
  {
    request: {
      query: SEARCH_MOVIES,
      variables: { query: 'test' },
    },
    result: {
      data: {
        searchMovies: [
          {
            id: '1',
            title: 'Test Movie',
            release_date: '2025-01-01',
            vote_average: 8.5,
            vote_count: 100,
          },
        ],
      },
    },
  },
  {
    request: {
      query: SEARCH_CELEBRITY,
      variables: { query: 'test' },
    },
    result: {
      data: {
        searchCelebrity: [{ id: '1', name: 'Test Celebrity', profile_path: '/test.jpg' }],
      },
    },
  },
  {
    request: {
      query: SEARCH_TV,
      variables: { query: 'test' },
    },
    result: {
      data: {
        searchTV: [
          {
            id: '1',
            name: 'Test TV Show',
            first_air_date: '2025-01-01',
            vote_average: 9.0,
            vote_count: 150,
          },
        ],
      },
    },
  },
];

// Mocking useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Search Component', () => {
  const mockState = { query: 'test', filter: 'Movies' };

  const renderSearchComponent = (mockedQueries = mocks) =>
    render(
      <MockedProvider mocks={mockedQueries} addTypename={false}>
        <AuthProvider>
          <MemoryRouter initialEntries={[{ pathname: '/search', state: mockState }]}>
            <Suspense fallback={<div>Loading...</div>}>
              <Routes>
                <Route path='/search' element={<Search />} />
              </Routes>
            </Suspense>
          </MemoryRouter>
        </AuthProvider>
      </MockedProvider>
    );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    renderSearchComponent([]);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should display movies correctly', async () => {
    renderSearchComponent();

    expect(await screen.findByText('Test Movie')).toBeInTheDocument();
    expect(screen.getByText('2025-01-01')).toBeInTheDocument();
    expect(screen.getByText('(100)')).toBeInTheDocument();
  });

  it('should navigate when a movie is clicked', async () => {
    renderSearchComponent();

    const movieTitle = await screen.findByText('Test Movie');
    fireEvent.click(movieTitle);

    expect(mockNavigate).toHaveBeenCalledWith('/mediaDetail', {
      state: {
        id: '1',
        title: 'Test Movie',
        release_date: '2025-01-01',
        vote_average: 8.5,
        vote_count: 100,
      },
    });
  });

  it('should render Navbar component lazily', async () => {
    renderSearchComponent();

    expect(await screen.findByText('Search test')).toBeInTheDocument(); // Verify Navbar is rendered
  });
});

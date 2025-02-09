import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router-dom';
import { GET_LIST_MEDIA } from '../graphql/queries';
import List from './List';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockNavigate,
}));

const mockContainerRef = { current: document.createElement('div') };

const props = {
  title: 'Popular Movies',
  listFor: 'movies',
  containerRef: mockContainerRef,
  setWidth: vi.fn(),
  info: {
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
  trending: [],
  videoID: '12345',
  poster: '/poster.jpg',
};

const mocks = [
  {
    request: { query: GET_LIST_MEDIA },
    result: {
      data: {
        upcomingMovies: [],
        popularMovies: [{ id: 1, backdrop_path: '/popular.jpg', title: 'Popular Movie' }],
        tvAiring: [],
        tvPopular: [],
      },
    },
  },
];

describe('List Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders the list component', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MemoryRouter>
          <List {...props} />
        </MemoryRouter>
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Popular Movies/i)).toBeInTheDocument();
    });
  });

  it('displays loading spinner when data is being fetched', () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MemoryRouter>
          <List {...props} />
        </MemoryRouter>
      </MockedProvider>
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('displays error message on GraphQL query error', async () => {
    const errorMocks = [
      {
        request: { query: GET_LIST_MEDIA },
        error: new Error('GraphQL error'),
      },
    ];

    render(
      <MockedProvider mocks={errorMocks} addTypename={false}>
        <MemoryRouter>
          <List {...props} />
        </MemoryRouter>
      </MockedProvider>
    );

    expect(await screen.findByText(/error/i)).toBeInTheDocument();
  });

  it('calls navigate with correct arguments on click', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MemoryRouter>
          <List {...props} />
        </MemoryRouter>
      </MockedProvider>
    );

    await waitFor(async () => {
      const link = screen.getByText(/Popular Movies/i);
      fireEvent.click(link);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/listDetails', {
      state: {
        data: [{ id: 1, backdrop_path: '/popular.jpg', title: 'Popular Movie' }],
        title: 'Popular Movies',
      },
    });
  });
});

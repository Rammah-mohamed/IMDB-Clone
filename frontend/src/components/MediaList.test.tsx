import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router-dom';
import { GET_LIST_MEDIA } from '../graphql/queries';
import { AuthContext } from '../context/authContext';
import axios from 'axios';
import AxiosMockAdapter from 'axios-mock-adapter';
import MediaList from '../components/MediaList';

const mockUser = { user: 'Test User', login: vi.fn(), logout: vi.fn() };

const mocks = [
  {
    request: { query: GET_LIST_MEDIA },
    result: {
      data: {
        trendingAll: [{ id: 1, title: 'Movie 1', poster_path: '/path.jpg', vote_average: 8.2 }],
        upcomingMovies: [],
        popularMovies: [],
        tvAiring: [],
        tvPopular: [],
      },
    },
  },
];

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockNavigate,
}));

describe('MediaList Component', () => {
  let mockAxios: AxiosMockAdapter;

  beforeEach(() => {
    mockAxios = new AxiosMockAdapter(axios);
  });

  afterEach(() => {
    vi.resetAllMocks();
    mockAxios.reset();
  });

  it('renders loading state initially', () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <AuthContext.Provider value={mockUser}>
          <MemoryRouter>
            <MediaList title='Trendings' />
          </MemoryRouter>
        </AuthContext.Provider>
      </MockedProvider>
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders movie list correctly after data loads', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <AuthContext.Provider value={mockUser}>
          <MemoryRouter>
            <MediaList title='Trendings' />
          </MemoryRouter>
        </AuthContext.Provider>
      </MockedProvider>
    );

    await waitFor(() => expect(screen.getByText('Movie 1')).toBeInTheDocument());
  });

  it('navigates to media details on click', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <AuthContext.Provider value={mockUser}>
          <MemoryRouter>
            <MediaList title='Trendings' />
          </MemoryRouter>
        </AuthContext.Provider>
      </MockedProvider>
    );

    await waitFor(() => screen.getByText('Movie 1'));
    fireEvent.click(screen.getByText('Movie 1'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        '/mediaDetail',
        expect.objectContaining({ state: expect.any(Object) })
      );
    });
  });

  it('handles add to watchlist functionality', async () => {
    const mediaId = 1;
    const apiUrl = `http://localhost:3000/lists/Your_Watchlist/${mediaId}`;
    mockAxios.onPut(apiUrl).reply(200, { success: true });

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <AuthContext.Provider value={mockUser}>
          <MemoryRouter>
            <MediaList title='Trendings' />
          </MemoryRouter>
        </AuthContext.Provider>
      </MockedProvider>
    );

    await waitFor(() => screen.getByText('Movie 1'));
    const addButton = screen.getByTestId('addBtn');
    fireEvent.click(addButton);

    await waitFor(() => expect(mockAxios.history.put.length).toBe(1));
    expect(mockAxios.history.put[0].url).toBe(apiUrl);
  });
});
